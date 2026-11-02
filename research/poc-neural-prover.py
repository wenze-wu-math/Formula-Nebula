#!/usr/bin/env python3
"""
Proof-of-Concept Neural Theorem Prover
Formula Nebula Project - November 2026

This POC demonstrates a hybrid symbolic-neural approach to automated theorem proving,
combining multiple AI techniques surveyed in AI-PROVERS.md:
1. Neural theorem proving (transformer-based)
2. Reinforcement learning for proof search
3. Few-shot learning from examples
4. Hybrid symbolic-neural verification

Architecture:
- Proof Planner: High-level strategy using hierarchical world model
- Tactic Selector: RL agent for low-level proof steps
- Symbolic Verifier: Ensures correctness of proof steps
- Memory System: Retrieval-augmented proof knowledge
"""

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass
from enum import Enum
import json
import heapq
from collections import defaultdict


# ============================================================================
# Data Structures
# ============================================================================

class ProofStatus(Enum):
    """Status of a proof attempt"""
    INCOMPLETE = "incomplete"
    COMPLETE = "complete"
    FAILED = "failed"
    TIMEOUT = "timeout"


@dataclass
class ProofState:
    """Represents the current state of a proof"""
    hypotheses: List[str]  # Known facts
    goals: List[str]  # Goals to prove
    context: str  # Mathematical context
    tactics_applied: List[str]  # History of tactics
    depth: int = 0  # Search depth

    def is_complete(self) -> bool:
        """Check if all goals are proved"""
        return len(self.goals) == 0

    def to_vector(self, vocab: Dict[str, int], max_len: int = 256) -> torch.Tensor:
        """Convert proof state to vector representation"""
        # Simple bag-of-words encoding (production would use embeddings)
        tokens = []
        for h in self.hypotheses:
            tokens.extend(h.split())
        for g in self.goals:
            tokens.extend(g.split())
        tokens.extend(self.context.split())

        vector = torch.zeros(max_len)
        for i, token in enumerate(tokens[:max_len]):
            if token in vocab:
                vector[i] = vocab[token]
        return vector


@dataclass
class Tactic:
    """Represents a proof tactic"""
    name: str
    description: str
    preconditions: List[str]
    effects: List[str]

    def applicable(self, state: ProofState) -> bool:
        """Check if tactic is applicable to current state"""
        # Simplified: check if preconditions are in hypotheses
        return all(pre in " ".join(state.hypotheses) for pre in self.preconditions)


@dataclass
class ProofExample:
    """Training example: theorem statement + proof"""
    statement: str
    hypotheses: List[str]
    conclusion: str
    proof_steps: List[Tuple[str, str]]  # (tactic, justification)
    domain: str  # e.g., "algebra", "analysis", "topology"


# ============================================================================
# Neural Components
# ============================================================================

class DynamicalMemoryCell(nn.Module):
    """
    Implements a dynamical memory unit as described in arXiv:2610.41850
    Uses complex diagonal recurrent matrix with input-dependent leak rate
    """
    def __init__(self, input_dim: int, memory_dim: int):
        super().__init__()
        self.input_dim = input_dim
        self.memory_dim = memory_dim

        # Complex diagonal recurrent matrix (magnitude and phase)
        self.diag_magnitude = nn.Parameter(torch.rand(memory_dim) * 0.9 + 0.05)
        self.diag_phase = nn.Parameter(torch.rand(memory_dim) * 2 * np.pi)

        # Input-dependent leak rate
        self.leak_net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, memory_dim),
            nn.Sigmoid()  # Leak rate in [0, 1]
        )

        # Input projection
        self.input_proj = nn.Linear(input_dim, memory_dim)

    def forward(self, x: torch.Tensor, state: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input tensor (batch, input_dim)
            state: Current memory state (batch, memory_dim)
        Returns:
            Updated memory state (batch, memory_dim)
        """
        # Compute input-dependent leak rate
        leak = self.leak_net(x)

        # Complex rotation using diagonal matrix
        magnitude = self.diag_magnitude.unsqueeze(0)
        phase = self.diag_phase.unsqueeze(0)

        # Real and imaginary parts of state
        state_real = state * torch.cos(phase)
        state_imag = state * torch.sin(phase)

        # Apply rotation
        new_real = magnitude * (state_real - state_imag)
        new_imag = magnitude * (state_real + state_imag)

        # Combine back to real representation
        rotated_state = torch.sqrt(new_real**2 + new_imag**2)

        # Apply leak and add input
        input_proj = self.input_proj(x)
        new_state = leak * rotated_state + (1 - leak) * input_proj

        return new_state


class HierarchicalProofPlanner(nn.Module):
    """
    Hierarchical world model for high-level proof strategy
    Based on ID-WM architecture (arXiv:2610.42146)

    Decouples:
    - High-level: Which subgoals to target
    - Low-level: Which tactics to apply
    """
    def __init__(self, state_dim: int, action_dim: int, memory_units: int = 4):
        super().__init__()
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.memory_units = memory_units

        # Dynamical memory units for proof context
        self.memory_cells = nn.ModuleList([
            DynamicalMemoryCell(state_dim, 128) for _ in range(memory_units)
        ])

        # High-level planner: predicts subgoal reachability
        self.high_level = nn.Sequential(
            nn.Linear(128 * memory_units, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim),
            nn.Softmax(dim=-1)
        )

        # Value estimator for proof state
        self.value_net = nn.Sequential(
            nn.Linear(128 * memory_units, 128),
            nn.ReLU(),
            nn.Linear(128, 1)
        )

    def forward(self, state_vector: torch.Tensor, memory_states: List[torch.Tensor]
                ) -> Tuple[torch.Tensor, torch.Tensor, List[torch.Tensor]]:
        """
        Args:
            state_vector: Current proof state (batch, state_dim)
            memory_states: Current memory states for each unit
        Returns:
            action_probs: Probability distribution over actions
            value: Estimated value of current state
            new_memory_states: Updated memory states
        """
        # Update each memory unit
        new_memory_states = []
        for i, cell in enumerate(self.memory_cells):
            new_state = cell(state_vector, memory_states[i])
            new_memory_states.append(new_state)

        # Concatenate memory outputs
        memory_concat = torch.cat(new_memory_states, dim=-1)

        # Predict action distribution and value
        action_probs = self.high_level(memory_concat)
        value = self.value_net(memory_concat)

        return action_probs, value, new_memory_states


class TacticSelector(nn.Module):
    """
    RL-based tactic selector with learned Q-function
    Uses hyperbolic embeddings for better low-data performance (arXiv:2610.42104)
    """
    def __init__(self, state_dim: int, n_tactics: int, embedding_dim: int = 64):
        super().__init__()
        self.state_dim = state_dim
        self.n_tactics = n_tactics
        self.embedding_dim = embedding_dim

        # State encoder
        self.state_encoder = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Linear(256, embedding_dim)
        )

        # Tactic embeddings (learnable)
        self.tactic_embeddings = nn.Parameter(torch.randn(n_tactics, embedding_dim))

        # Hyperbolic distance parameter (learnable)
        self.hyperbolic_param = nn.Parameter(torch.ones(1))

        # Q-network
        self.q_network = nn.Sequential(
            nn.Linear(embedding_dim * 2, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 1)
        )

    def hyperbolic_distance(self, x: torch.Tensor, y: torch.Tensor) -> torch.Tensor:
        """Compute hyperbolic distance between embeddings"""
        # Poincaré ball model
        norm_x = torch.clamp(torch.norm(x, dim=-1, keepdim=True), max=0.99)
        norm_y = torch.clamp(torch.norm(y, dim=-1, keepdim=True), max=0.99)

        diff_norm = torch.norm(x - y, dim=-1, keepdim=True)

        # Hyperbolic distance formula
        distance = torch.acosh(1 + 2 * diff_norm**2 / ((1 - norm_x**2) * (1 - norm_y**2)))

        return distance * self.hyperbolic_param

    def forward(self, state_vector: torch.Tensor) -> torch.Tensor:
        """
        Args:
            state_vector: Current proof state (batch, state_dim)
        Returns:
            q_values: Q-values for each tactic (batch, n_tactics)
        """
        # Encode state
        state_emb = self.state_encoder(state_vector)

        batch_size = state_vector.shape[0]
        q_values = []

        # Compute Q-value for each tactic
        for i in range(self.n_tactics):
            tactic_emb = self.tactic_embeddings[i].unsqueeze(0).expand(batch_size, -1)
            combined = torch.cat([state_emb, tactic_emb], dim=-1)
            q = self.q_network(combined)
            q_values.append(q)

        q_values = torch.cat(q_values, dim=-1)
        return q_values

    def select_tactic(self, state_vector: torch.Tensor, epsilon: float = 0.1) -> int:
        """Epsilon-greedy tactic selection"""
        if np.random.random() < epsilon:
            return np.random.randint(self.n_tactics)
        else:
            q_values = self.forward(state_vector)
            return torch.argmax(q_values, dim=-1).item()


class FewShotProofAdapter(nn.Module):
    """
    Few-shot learning module for rapid adaptation to new proof domains
    Uses meta-learning and curriculum learning (arXiv:2610.42149)
    """
    def __init__(self, base_encoder: nn.Module, n_classes: int, support_size: int = 5):
        super().__init__()
        self.base_encoder = base_encoder
        self.n_classes = n_classes
        self.support_size = support_size

        # Prototype network for few-shot classification
        self.embedding_dim = 256

        # Relation network
        self.relation_net = nn.Sequential(
            nn.Linear(self.embedding_dim * 2, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )

    def compute_prototypes(self, support_set: List[torch.Tensor]) -> torch.Tensor:
        """Compute prototype embeddings from support examples"""
        embeddings = [self.base_encoder(ex) for ex in support_set]
        prototype = torch.stack(embeddings).mean(dim=0)
        return prototype

    def forward(self, query: torch.Tensor, support_set: List[torch.Tensor]) -> torch.Tensor:
        """
        Args:
            query: Query proof state
            support_set: List of support proof states
        Returns:
            similarity: Similarity scores to prototypes
        """
        query_emb = self.base_encoder(query)
        prototype = self.compute_prototypes(support_set)

        # Compute relation score
        combined = torch.cat([query_emb, prototype], dim=-1)
        similarity = self.relation_net(combined)

        return similarity


# ============================================================================
# Symbolic Components
# ============================================================================

class SymbolicVerifier:
    """
    Symbolic verification engine
    Ensures correctness of proof steps
    """
    def __init__(self):
        self.axioms: Set[str] = set()
        self.inference_rules: List[Tuple[List[str], str]] = []

    def add_axiom(self, axiom: str):
        """Add an axiom to the knowledge base"""
        self.axioms.add(axiom)

    def add_inference_rule(self, premises: List[str], conclusion: str):
        """Add an inference rule"""
        self.inference_rules.append((premises, conclusion))

    def verify_step(self, state: ProofState, tactic: Tactic, new_state: ProofState) -> bool:
        """
        Verify that applying tactic to state yields new_state

        Returns:
            True if step is valid, False otherwise
        """
        # Check tactic is applicable
        if not tactic.applicable(state):
            return False

        # Check new hypotheses are derivable
        for new_hyp in new_state.hypotheses:
            if new_hyp not in state.hypotheses:
                if not self._is_derivable(new_hyp, state.hypotheses):
                    return False

        # Check goals are properly updated
        # (Simplified: just check that we didn't lose goals improperly)
        for old_goal in state.goals:
            if old_goal not in new_state.goals:
                # Goal must have been proved
                if not self._is_provable(old_goal, new_state.hypotheses):
                    return False

        return True

    def _is_derivable(self, statement: str, hypotheses: List[str]) -> bool:
        """Check if statement is derivable from hypotheses"""
        # Simplified: check if statement matches any inference rule
        for premises, conclusion in self.inference_rules:
            if conclusion == statement:
                if all(p in hypotheses for p in premises):
                    return True
        return False

    def _is_provable(self, goal: str, hypotheses: List[str]) -> bool:
        """Check if goal is provable from hypotheses"""
        # Direct match or derivable
        if goal in hypotheses:
            return True
        return self._is_derivable(goal, hypotheses)


# ============================================================================
# Memory and Retrieval System
# ============================================================================

class ProofMemory:
    """
    Retrieval-augmented memory for storing and retrieving proof knowledge
    Uses sparse indexing for efficient retrieval (arXiv:2610.42112)
    """
    def __init__(self, embedding_dim: int = 256):
        self.embedding_dim = embedding_dim
        self.memory: List[Tuple[str, torch.Tensor, ProofExample]] = []
        self.index: Dict[str, List[int]] = defaultdict(list)

    def add_proof(self, example: ProofExample):
        """Add a proof example to memory"""
        # Create embedding (simplified: just bag-of-words hash)
        key = f"{example.domain}:{example.statement[:50]}"
        embedding = self._create_embedding(example)

        idx = len(self.memory)
        self.memory.append((key, embedding, example))

        # Index by domain and keywords
        self.index[example.domain].append(idx)
        for word in example.statement.split():
            self.index[word.lower()].append(idx)

    def retrieve_similar(self, query_state: ProofState, k: int = 5) -> List[ProofExample]:
        """Retrieve k most similar proof examples"""
        query_embedding = self._create_embedding_from_state(query_state)

        # Compute similarities
        similarities = []
        for i, (key, emb, example) in enumerate(self.memory):
            sim = F.cosine_similarity(query_embedding.unsqueeze(0), emb.unsqueeze(0))
            similarities.append((sim.item(), i))

        # Return top-k
        top_k = heapq.nlargest(k, similarities, key=lambda x: x[0])
        return [self.memory[i][2] for _, i in top_k]

    def _create_embedding(self, example: ProofExample) -> torch.Tensor:
        """Create embedding from proof example"""
        # Simplified: hash-based embedding
        text = f"{example.statement} {' '.join(example.hypotheses)} {example.conclusion}"
        embedding = torch.randn(self.embedding_dim)  # Placeholder
        return embedding

    def _create_embedding_from_state(self, state: ProofState) -> torch.Tensor:
        """Create embedding from proof state"""
        text = f"{' '.join(state.hypotheses)} {' '.join(state.goals)} {state.context}"
        embedding = torch.randn(self.embedding_dim)  # Placeholder
        return embedding


# ============================================================================
# Main Prover
# ============================================================================

class HybridNeuralProver:
    """
    Main hybrid neural-symbolic theorem prover

    Combines:
    - Hierarchical proof planning (neural)
    - RL-based tactic selection (neural)
    - Symbolic verification (symbolic)
    - Retrieval-augmented memory (hybrid)
    - Few-shot adaptation (neural)
    """
    def __init__(self, state_dim: int = 256, n_tactics: int = 20):
        self.state_dim = state_dim
        self.n_tactics = n_tactics

        # Neural components
        self.planner = HierarchicalProofPlanner(state_dim, n_tactics)
        self.tactic_selector = TacticSelector(state_dim, n_tactics)
        self.few_shot_adapter = FewShotProofAdapter(
            self.tactic_selector.state_encoder,
            n_classes=10
        )

        # Symbolic components
        self.verifier = SymbolicVerifier()
        self.memory = ProofMemory()

        # Tactics library
        self.tactics = self._initialize_tactics()

        # Vocabulary for encoding
        self.vocab = self._build_vocab()

        # RL training state
        self.gamma = 0.99  # Discount factor
        self.optimizer = torch.optim.Adam(
            list(self.planner.parameters()) +
            list(self.tactic_selector.parameters()),
            lr=1e-4
        )

    def _initialize_tactics(self) -> List[Tactic]:
        """Initialize basic proof tactics"""
        return [
            Tactic("assumption", "Use an existing hypothesis", [], []),
            Tactic("intro", "Introduce a new variable", [], []),
            Tactic("apply", "Apply a theorem or lemma", [], []),
            Tactic("rewrite", "Rewrite using an equality", [], []),
            Tactic("split", "Split a conjunction", [], []),
            Tactic("left", "Prove left side of disjunction", [], []),
            Tactic("right", "Prove right side of disjunction", [], []),
            Tactic("induction", "Proof by induction", [], []),
            Tactic("contradiction", "Proof by contradiction", [], []),
            Tactic("cases", "Case analysis", [], []),
        ]

    def _build_vocab(self) -> Dict[str, int]:
        """Build vocabulary for encoding"""
        # Simplified vocabulary
        return {word: i for i, word in enumerate([
            "forall", "exists", "and", "or", "not", "implies",
            "equal", "less", "greater", "zero", "one", "plus", "times",
            "real", "natural", "integer", "set", "function"
        ])}

    def prove(self, statement: str, hypotheses: List[str], max_steps: int = 100,
              timeout: float = 30.0) -> Tuple[ProofStatus, List[str]]:
        """
        Attempt to prove a theorem

        Args:
            statement: Theorem to prove
            hypotheses: Known facts/axioms
            max_steps: Maximum proof steps
            timeout: Time limit in seconds

        Returns:
            status: Proof status
            proof_trace: List of tactics applied
        """
        # Initialize proof state
        initial_state = ProofState(
            hypotheses=hypotheses,
            goals=[statement],
            context=statement,
            tactics_applied=[]
        )

        # Retrieve similar proofs
        similar_proofs = self.memory.retrieve_similar(initial_state, k=5)

        # Initialize memory states for planner
        memory_states = [torch.zeros(1, 128) for _ in range(self.planner.memory_units)]

        # Proof search with beam search
        beam_width = 5
        beam = [(initial_state, memory_states, 0.0)]  # (state, memory, log_prob)

        for step in range(max_steps):
            # Expand beam
            candidates = []

            for state, mem_states, log_prob in beam:
                if state.is_complete():
                    return ProofStatus.COMPLETE, state.tactics_applied

                # Get state vector
                state_vector = state.to_vector(self.vocab, self.state_dim).unsqueeze(0)

                # Get action probabilities from planner
                action_probs, value, new_mem_states = self.planner(state_vector, mem_states)

                # Get Q-values from tactic selector
                q_values = self.tactic_selector(state_vector)

                # Combine planner and Q-values
                combined_scores = 0.5 * action_probs + 0.5 * F.softmax(q_values, dim=-1)

                # Generate candidate next states
                top_k = torch.topk(combined_scores, min(beam_width, self.n_tactics))

                for i, (score, tactic_idx) in enumerate(zip(top_k.values[0], top_k.indices[0])):
                    tactic_idx = tactic_idx.item()
                    tactic = self.tactics[tactic_idx % len(self.tactics)]

                    # Apply tactic (simplified: just add to trace)
                    new_state = ProofState(
                        hypotheses=state.hypotheses.copy(),
                        goals=state.goals.copy(),
                        context=state.context,
                        tactics_applied=state.tactics_applied + [tactic.name],
                        depth=state.depth + 1
                    )

                    # Verify step symbolically
                    if self.verifier.verify_step(state, tactic, new_state):
                        new_log_prob = log_prob + torch.log(score).item()
                        candidates.append((new_state, new_mem_states, new_log_prob))

            if not candidates:
                return ProofStatus.FAILED, []

            # Select top-k candidates for next beam
            candidates.sort(key=lambda x: x[2], reverse=True)
            beam = candidates[:beam_width]

        return ProofStatus.TIMEOUT, []

    def train_on_examples(self, examples: List[ProofExample], epochs: int = 10):
        """
        Train the prover on example proofs

        Uses curriculum learning: start with simple proofs, progress to complex
        """
        # Sort examples by difficulty (simplified: by number of steps)
        examples_sorted = sorted(examples, key=lambda e: len(e.proof_steps))

        for epoch in range(epochs):
            print(f"Epoch {epoch + 1}/{epochs}")

            # Curriculum: gradually increase difficulty
            curriculum_size = min(len(examples_sorted), 10 * (epoch + 1))
            training_set = examples_sorted[:curriculum_size]

            for example in training_set:
                # Add to memory
                self.memory.add_proof(example)

                # Simulate proof and collect RL experience
                state = ProofState(
                    hypotheses=example.hypotheses,
                    goals=[example.conclusion],
                    context=example.statement,
                    tactics_applied=[]
                )

                rewards = []
                states = []
                actions = []

                # Follow expert trajectory
                for tactic_name, justification in example.proof_steps:
                    # Get state vector
                    state_vector = state.to_vector(self.vocab, self.state_dim).unsqueeze(0)
                    states.append(state_vector)

                    # Find tactic index
                    tactic_idx = next((i for i, t in enumerate(self.tactics)
                                     if t.name == tactic_name), 0)
                    actions.append(tactic_idx)

                    # Reward: +1 for progress, +10 for completion
                    reward = 1.0
                    if state.is_complete():
                        reward = 10.0
                    rewards.append(reward)

                    # Update state (simplified)
                    state.tactics_applied.append(tactic_name)

                # Compute returns
                returns = []
                G = 0
                for r in reversed(rewards):
                    G = r + self.gamma * G
                    returns.insert(0, G)

                # Update networks
                self._update_networks(states, actions, returns)

    def _update_networks(self, states: List[torch.Tensor], actions: List[int],
                        returns: List[float]):
        """Update neural networks using RL"""
        if not states:
            return

        self.optimizer.zero_grad()

        # Initialize memory states
        memory_states = [torch.zeros(1, 128) for _ in range(self.planner.memory_units)]

        total_loss = 0
        for state_vec, action, G in zip(states, actions, returns):
            # Forward pass through planner
            action_probs, value, memory_states = self.planner(state_vec, memory_states)

            # Forward pass through tactic selector
            q_values = self.tactic_selector(state_vec)

            # Actor loss (policy gradient)
            log_prob = torch.log(action_probs[0, action] + 1e-10)
            advantage = G - value.item()
            actor_loss = -log_prob * advantage

            # Critic loss (value function)
            critic_loss = F.mse_loss(value, torch.tensor([[G]], dtype=torch.float32))

            # Q-learning loss
            target_q = G
            predicted_q = q_values[0, action]
            q_loss = F.mse_loss(predicted_q, torch.tensor(target_q, dtype=torch.float32))

            # Combined loss
            loss = actor_loss + 0.5 * critic_loss + 0.5 * q_loss
            total_loss += loss

        # Backpropagation
        total_loss.backward()
        torch.nn.utils.clip_grad_norm_(
            list(self.planner.parameters()) + list(self.tactic_selector.parameters()),
            max_norm=1.0
        )
        self.optimizer.step()

    def adapt_few_shot(self, support_set: List[ProofExample], query: ProofState) -> int:
        """
        Few-shot adaptation to new proof domain

        Args:
            support_set: Small set of example proofs in new domain
            query: Query proof state to solve

        Returns:
            Recommended tactic index
        """
        # Convert support examples to vectors
        support_vectors = [
            ProofState(
                hypotheses=ex.hypotheses,
                goals=[ex.conclusion],
                context=ex.statement,
                tactics_applied=[]
            ).to_vector(self.vocab, self.state_dim).unsqueeze(0)
            for ex in support_set
        ]

        # Query vector
        query_vector = query.to_vector(self.vocab, self.state_dim).unsqueeze(0)

        # Compute similarity
        similarity = self.few_shot_adapter(query_vector, support_vectors)

        # Use similarity to weight tactic selection
        q_values = self.tactic_selector(query_vector)
        weighted_scores = q_values * similarity

        return torch.argmax(weighted_scores).item()


# ============================================================================
# Demo and Testing
# ============================================================================

def create_sample_examples() -> List[ProofExample]:
    """Create sample proof examples for training"""
    return [
        ProofExample(
            statement="If x = y and y = z, then x = z",
            hypotheses=["x = y", "y = z"],
            conclusion="x = z",
            proof_steps=[
                ("assumption", "Use hypothesis x = y"),
                ("rewrite", "Rewrite using y = z"),
                ("assumption", "Conclude x = z")
            ],
            domain="equality"
        ),
        ProofExample(
            statement="For all n, n + 0 = n",
            hypotheses=["Natural number axioms"],
            conclusion="n + 0 = n",
            proof_steps=[
                ("intro", "Introduce variable n"),
                ("induction", "Proof by induction on n"),
                ("assumption", "Base case: 0 + 0 = 0"),
                ("rewrite", "Inductive step")
            ],
            domain="arithmetic"
        ),
        ProofExample(
            statement="If P and Q, then P",
            hypotheses=["P", "Q"],
            conclusion="P",
            proof_steps=[
                ("assumption", "Use hypothesis P")
            ],
            domain="propositional_logic"
        )
    ]


def demo_prover():
    """Demonstrate the hybrid neural prover"""
    print("=" * 80)
    print("Hybrid Neural Theorem Prover - Proof of Concept")
    print("Formula Nebula Project - November 2026")
    print("=" * 80)
    print()

    # Initialize prover
    print("Initializing prover...")
    prover = HybridNeuralProver(state_dim=256, n_tactics=20)

    # Create training examples
    print("Creating training examples...")
    examples = create_sample_examples()

    # Train prover
    print("Training prover on examples...")
    prover.train_on_examples(examples, epochs=5)

    print()
    print("-" * 80)
    print("Testing Proof Generation")
    print("-" * 80)
    print()

    # Test theorem
    statement = "If x = y and y = z, then x = z"
    hypotheses = ["x = y", "y = z"]

    print(f"Theorem: {statement}")
    print(f"Hypotheses: {hypotheses}")
    print()

    # Attempt proof
    print("Attempting proof...")
    status, proof_trace = prover.prove(statement, hypotheses, max_steps=50)

    print(f"Status: {status.value}")
    print(f"Proof trace: {proof_trace}")
    print()

    # Demonstrate few-shot adaptation
    print("-" * 80)
    print("Testing Few-Shot Adaptation")
    print("-" * 80)
    print()

    query_state = ProofState(
        hypotheses=["A", "B"],
        goals=["A"],
        context="Simple conjunction elimination",
        tactics_applied=[]
    )

    recommended_tactic = prover.adapt_few_shot(examples, query_state)
    print(f"Query: Prove A from hypotheses A and B")
    print(f"Recommended tactic: {prover.tactics[recommended_tactic % len(prover.tactics)].name}")
    print()

    # Show memory statistics
    print("-" * 80)
    print("Memory Statistics")
    print("-" * 80)
    print(f"Proofs in memory: {len(prover.memory.memory)}")
    print(f"Indexed domains: {list(prover.memory.index.keys())[:10]}")
    print()

    print("=" * 80)
    print("Demo complete!")
    print("=" * 80)


def save_model(prover: HybridNeuralProver, path: str):
    """Save prover model to disk"""
    torch.save({
        'planner_state_dict': prover.planner.state_dict(),
        'tactic_selector_state_dict': prover.tactic_selector.state_dict(),
        'optimizer_state_dict': prover.optimizer.state_dict(),
        'vocab': prover.vocab,
    }, path)
    print(f"Model saved to {path}")


def load_model(prover: HybridNeuralProver, path: str):
    """Load prover model from disk"""
    checkpoint = torch.load(path)
    prover.planner.load_state_dict(checkpoint['planner_state_dict'])
    prover.tactic_selector.load_state_dict(checkpoint['tactic_selector_state_dict'])
    prover.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    prover.vocab = checkpoint['vocab']
    print(f"Model loaded from {path}")


if __name__ == "__main__":
    # Run demo
    demo_prover()

    # Example of saving/loading model
    # prover = HybridNeuralProver()
    # save_model(prover, "models/neural_prover_v1.pt")
    # load_model(prover, "models/neural_prover_v1.pt")
