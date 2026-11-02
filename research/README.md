# Research Directory

This directory contains research materials and proof-of-concept implementations for Formula Nebula's AI-powered proof systems.

## Contents

### AI-PROVERS.md
Comprehensive survey of AI proof techniques covering:
- Neural theorem provers (DeepHyper-style)
- Reinforcement learning for proof search
- LLM-based proof generation
- Hybrid symbolic-neural approaches
- Few-shot learning from examples

The survey synthesizes 15+ recent papers from October 2026 and provides:
- Detailed technical explanations
- Comparative analysis
- State-of-the-art benchmarks
- Open challenges
- Recommendations for Formula Nebula

### poc-neural-prover.py
Proof-of-concept implementation demonstrating:
- **Hierarchical Proof Planner:** High-level strategy using dynamical memory transformers
- **Tactic Selector:** RL-based agent with hyperbolic embeddings
- **Symbolic Verifier:** Ensures correctness of proof steps
- **Retrieval Memory:** Stores and retrieves proof knowledge
- **Few-Shot Adapter:** Rapid adaptation to new proof domains

**Architecture highlights:**
- Dynamical Memory Cells (inspired by arXiv:2610.41850)
- Hierarchical World Model (inspired by arXiv:2610.42146)
- Hyperbolic RL (inspired by arXiv:2610.42104)
- Curriculum learning for training

## Running the POC

```bash
# Install dependencies
pip install torch numpy

# Run demo
python poc-neural-prover.py
```

The demo will:
1. Initialize the hybrid neural-symbolic prover
2. Train on sample proof examples
3. Attempt to prove a simple theorem
4. Demonstrate few-shot adaptation
5. Show memory statistics

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Hybrid Neural Prover                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  High-Level      │───▶│  Low-Level       │              │
│  │  Proof Planner   │    │  Tactic Selector │              │
│  │  (Hierarchical)  │    │  (RL + Q-learn)  │              │
│  └──────────────────┘    └──────────────────┘              │
│           │                       │                          │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────────────────────────────┐              │
│  │      Symbolic Verifier (Guarantees)       │              │
│  └──────────────────────────────────────────┘              │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────┐              │
│  │  Retrieval-Augmented Proof Memory         │              │
│  │  (Similar proofs, tactics, strategies)    │              │
│  └──────────────────────────────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Dynamical Memory Cells
- Complex diagonal recurrent matrices
- Input-dependent leak rates
- Fixed-size state with logarithmic depth
- Maintains proof context across steps

### 2. Hierarchical Planning
- High-level: Subgoal selection
- Low-level: Tactic application
- Decouples strategy from execution
- Enables long-horizon proof synthesis

### 3. Hyperbolic Tactic Selection
- Embeddings in Poincaré ball
- Better geometry for hierarchical proof structures
- Improved low-data performance
- Non-separable reward functions

### 4. Symbolic Verification
- Checks applicability of tactics
- Verifies derivability of new facts
- Ensures proof soundness
- Falls back to safe alternatives

### 5. Few-Shot Adaptation
- Prototype networks for new domains
- Meta-learning from support examples
- Rapid specialization
- Transfer learning across proof types

## Training Strategy

### Curriculum Learning
1. Simple equality proofs
2. Basic arithmetic
3. Propositional logic
4. Predicate logic
5. Complex theorems

### Reinforcement Learning
- **State:** Proof state (hypotheses, goals, context)
- **Action:** Tactic selection
- **Reward:** Progress + completion bonus
- **Policy:** Combined planner + Q-network
- **Discount:** γ = 0.99

### Loss Function
```
L = L_actor + 0.5 * L_critic + 0.5 * L_Q

L_actor = -log π(a|s) * (G - V(s))
L_critic = MSE(V(s), G)
L_Q = MSE(Q(s,a), G)
```

## Evaluation Metrics

- **Proof Success Rate:** % theorems proved
- **Proof Length:** Average tactics used
- **Verification Rate:** % valid steps
- **Adaptation Speed:** Few-shot performance
- **Memory Efficiency:** Proofs stored vs retrieved

## Future Enhancements

### Near-term
- [ ] Integration with Lean 4 formal system
- [ ] Larger tactics library (100+ tactics)
- [ ] Real mathematical proof corpus
- [ ] Improved state embeddings (BERT-style)
- [ ] Better symbolic verification

### Medium-term
- [ ] Multi-agent proof collaboration
- [ ] Automated conjecture generation
- [ ] Natural language proof explanation
- [ ] Interactive proof assistant UI
- [ ] Proof visualization

### Long-term
- [ ] Research-level theorem proving
- [ ] Novel proof technique discovery
- [ ] Cross-domain proof transfer
- [ ] Verified AI systems using proofs
- [ ] Mathematical creativity metrics

## References

See AI-PROVERS.md for comprehensive references to:
- 15+ recent papers (2026)
- Classic theorem proving works
- Tools and frameworks
- Benchmarks and datasets

## Contributing

To contribute new proof techniques or improvements:
1. Document the technique in AI-PROVERS.md
2. Implement POC in this directory
3. Add tests and examples
4. Update this README

## License

Part of the Formula Nebula project.
