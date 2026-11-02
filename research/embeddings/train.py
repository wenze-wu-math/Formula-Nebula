"""
Knowledge Graph Embedding Training Module

Implements multiple embedding techniques for theorem knowledge graphs:
- Node2Vec: Random walk based node embeddings
- TransE: Translation-based entity-relation embeddings
- TransR: Relation-specific projection for embeddings

Usage:
    python train.py --model node2vec --input graph.json --output embeddings.pt
    python train.py --model transe --epochs 100 --dim 128
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import json
import argparse
from pathlib import Path
from typing import List, Tuple, Dict, Set
from collections import defaultdict
import random
from tqdm import tqdm


# ============================================================================
# Node2Vec Implementation
# ============================================================================

class Node2Vec:
    """
    Node2Vec: Scalable Feature Learning for Networks
    Generates node embeddings using biased random walks
    """

    def __init__(self, graph: Dict, embedding_dim: int = 128,
                 walk_length: int = 80, num_walks: int = 10,
                 p: float = 1.0, q: float = 1.0, window_size: int = 10):
        """
        Args:
            graph: Adjacency list representation {node_id: [neighbor_ids]}
            embedding_dim: Dimension of embedding vectors
            walk_length: Length of each random walk
            num_walks: Number of walks per node
            p: Return parameter (likelihood of backtracking)
            q: In-out parameter (BFS vs DFS)
            window_size: Context window for Skip-gram
        """
        self.graph = graph
        self.embedding_dim = embedding_dim
        self.walk_length = walk_length
        self.num_walks = num_walks
        self.p = p
        self.q = q
        self.window_size = window_size

        # Create node index mapping
        self.nodes = list(graph.keys())
        self.node2idx = {node: idx for idx, node in enumerate(self.nodes)}
        self.idx2node = {idx: node for node, idx in self.node2idx.items()}

        # Initialize embeddings
        num_nodes = len(self.nodes)
        self.embeddings = nn.Embedding(num_nodes, embedding_dim)
        nn.init.xavier_uniform_(self.embeddings.weight)

    def _get_alias_edge(self, src: str, dst: str) -> Tuple[List[float], List[int]]:
        """
        Compute alias sampling parameters for biased random walk
        """
        neighbors = self.graph.get(dst, [])
        if not neighbors:
            return [], []

        unnormalized_probs = []
        for neighbor in neighbors:
            if neighbor == src:  # Return to previous node
                unnormalized_probs.append(1.0 / self.p)
            elif neighbor in self.graph.get(src, []):  # Stay in same neighborhood
                unnormalized_probs.append(1.0)
            else:  # Move to new neighborhood
                unnormalized_probs.append(1.0 / self.q)

        # Normalize probabilities
        norm_const = sum(unnormalized_probs)
        normalized_probs = [prob / norm_const for prob in unnormalized_probs]

        return normalized_probs, neighbors

    def _random_walk(self, start_node: str) -> List[str]:
        """
        Generate a biased random walk starting from start_node
        """
        walk = [start_node]

        for _ in range(self.walk_length - 1):
            cur = walk[-1]
            neighbors = self.graph.get(cur, [])

            if not neighbors:
                break

            if len(walk) == 1:
                # First step: uniform random
                walk.append(random.choice(neighbors))
            else:
                # Biased walk based on previous node
                prev = walk[-2]
                probs, candidates = self._get_alias_edge(prev, cur)
                if probs:
                    walk.append(np.random.choice(candidates, p=probs))
                else:
                    break

        return walk

    def generate_walks(self) -> List[List[str]]:
        """
        Generate all random walks for training
        """
        walks = []
        nodes = list(self.graph.keys())

        print(f"Generating {self.num_walks} walks per node...")
        for _ in tqdm(range(self.num_walks)):
            random.shuffle(nodes)
            for node in nodes:
                walks.append(self._random_walk(node))

        return walks

    def train(self, walks: List[List[str]], epochs: int = 5,
              learning_rate: float = 0.025, negative_samples: int = 5):
        """
        Train embeddings using Skip-gram with negative sampling
        """
        optimizer = optim.SGD(self.embeddings.parameters(), lr=learning_rate)

        # Convert walks to indices
        walks_idx = []
        for walk in walks:
            walks_idx.append([self.node2idx[node] for node in walk if node in self.node2idx])

        num_nodes = len(self.nodes)

        for epoch in range(epochs):
            total_loss = 0.0
            random.shuffle(walks_idx)

            for walk in tqdm(walks_idx, desc=f"Epoch {epoch+1}/{epochs}"):
                for i, target_idx in enumerate(walk):
                    # Get context indices
                    start = max(0, i - self.window_size)
                    end = min(len(walk), i + self.window_size + 1)
                    context_indices = [walk[j] for j in range(start, end) if j != i]

                    if not context_indices:
                        continue

                    # Positive samples
                    target_emb = self.embeddings(torch.tensor([target_idx]))
                    for context_idx in context_indices:
                        context_emb = self.embeddings(torch.tensor([context_idx]))

                        # Positive loss
                        pos_score = torch.sigmoid(torch.sum(target_emb * context_emb))
                        pos_loss = -torch.log(pos_score + 1e-10)

                        # Negative sampling
                        neg_loss = 0.0
                        for _ in range(negative_samples):
                            neg_idx = random.randint(0, num_nodes - 1)
                            neg_emb = self.embeddings(torch.tensor([neg_idx]))
                            neg_score = torch.sigmoid(torch.sum(target_emb * neg_emb))
                            neg_loss += -torch.log(1 - neg_score + 1e-10)

                        loss = pos_loss + neg_loss

                        optimizer.zero_grad()
                        loss.backward()
                        optimizer.step()

                        total_loss += loss.item()

            print(f"Epoch {epoch+1} Loss: {total_loss:.4f}")

    def get_embeddings(self) -> Dict[str, np.ndarray]:
        """
        Return trained embeddings as dictionary
        """
        embeddings_dict = {}
        with torch.no_grad():
            for node, idx in self.node2idx.items():
                emb = self.embeddings(torch.tensor([idx]))
                embeddings_dict[node] = emb.squeeze().numpy()
        return embeddings_dict


# ============================================================================
# TransE Implementation
# ============================================================================

class TransE(nn.Module):
    """
    TransE: Translating Embeddings for Modeling Multi-relational Data
    Models relations as translations in embedding space: h + r ≈ t
    """

    def __init__(self, num_entities: int, num_relations: int,
                 embedding_dim: int = 128, margin: float = 1.0):
        super(TransE, self).__init__()
        self.num_entities = num_entities
        self.num_relations = num_relations
        self.embedding_dim = embedding_dim
        self.margin = margin

        # Entity embeddings
        self.entity_embeddings = nn.Embedding(num_entities, embedding_dim)
        nn.init.xavier_uniform_(self.entity_embeddings.weight)

        # Relation embeddings
        self.relation_embeddings = nn.Embedding(num_relations, embedding_dim)
        nn.init.xavier_uniform_(self.relation_embeddings.weight)

    def forward(self, heads, relations, tails):
        """
        Compute scores for triplets (head, relation, tail)
        Score = ||h + r - t||
        """
        h = self.entity_embeddings(heads)
        r = self.relation_embeddings(relations)
        t = self.entity_embeddings(tails)

        # Normalize embeddings
        h = nn.functional.normalize(h, p=2, dim=-1)
        t = nn.functional.normalize(t, p=2, dim=-1)

        # Translation score: h + r - t
        score = h + r - t
        score = torch.norm(score, p=2, dim=-1)

        return score

    def loss(self, pos_heads, pos_relations, pos_tails,
             neg_heads, neg_relations, neg_tails):
        """
        Margin-based ranking loss
        L = max(0, margin + score(positive) - score(negative))
        """
        pos_scores = self.forward(pos_heads, pos_relations, pos_tails)
        neg_scores = self.forward(neg_heads, neg_relations, neg_tails)

        loss = torch.relu(self.margin + pos_scores - neg_scores)
        return loss.mean()


# ============================================================================
# TransR Implementation
# ============================================================================

class TransR(nn.Module):
    """
    TransR: Learning Entity and Relation Embeddings for Knowledge Graph Completion
    Projects entities into relation-specific spaces before applying translation
    """

    def __init__(self, num_entities: int, num_relations: int,
                 entity_dim: int = 100, relation_dim: int = 50, margin: float = 1.0):
        super(TransR, self).__init__()
        self.num_entities = num_entities
        self.num_relations = num_relations
        self.entity_dim = entity_dim
        self.relation_dim = relation_dim
        self.margin = margin

        # Entity embeddings
        self.entity_embeddings = nn.Embedding(num_entities, entity_dim)
        nn.init.xavier_uniform_(self.entity_embeddings.weight)

        # Relation embeddings
        self.relation_embeddings = nn.Embedding(num_relations, relation_dim)
        nn.init.xavier_uniform_(self.relation_embeddings.weight)

        # Projection matrices (one per relation)
        self.projection_matrices = nn.Embedding(num_relations, entity_dim * relation_dim)
        nn.init.xavier_uniform_(self.projection_matrices.weight)

    def _project(self, entities, relations):
        """
        Project entities into relation-specific space
        """
        batch_size = entities.size(0)

        # Get projection matrices for each relation
        proj_matrices = self.projection_matrices(relations)
        proj_matrices = proj_matrices.view(batch_size, self.relation_dim, self.entity_dim)

        # Project entities: M_r * e
        entities_expanded = entities.unsqueeze(1)  # [batch, 1, entity_dim]
        projected = torch.bmm(entities_expanded, proj_matrices.transpose(1, 2))
        projected = projected.squeeze(1)  # [batch, relation_dim]

        return projected

    def forward(self, heads, relations, tails):
        """
        Compute scores for triplets in relation-specific spaces
        """
        h = self.entity_embeddings(heads)
        t = self.entity_embeddings(tails)
        r = self.relation_embeddings(relations)

        # Project entities into relation space
        h_proj = self._project(h, relations)
        t_proj = self._project(t, relations)

        # Normalize
        h_proj = nn.functional.normalize(h_proj, p=2, dim=-1)
        t_proj = nn.functional.normalize(t_proj, p=2, dim=-1)

        # Translation score in relation space
        score = h_proj + r - t_proj
        score = torch.norm(score, p=2, dim=-1)

        return score

    def loss(self, pos_heads, pos_relations, pos_tails,
             neg_heads, neg_relations, neg_tails):
        """
        Margin-based ranking loss
        """
        pos_scores = self.forward(pos_heads, pos_relations, pos_tails)
        neg_scores = self.forward(neg_heads, neg_relations, neg_tails)

        loss = torch.relu(self.margin + pos_scores - neg_scores)
        return loss.mean()


# ============================================================================
# Data Loading and Training Utilities
# ============================================================================

def load_graph_data(filepath: str) -> Tuple[Dict, List[Tuple]]:
    """
    Load knowledge graph from JSON file

    Expected format:
    {
        "nodes": [{"id": "node1", "label": "Theorem X"}],
        "edges": [{"source": "node1", "target": "node2", "relation": "implies"}]
    }

    Returns:
        adjacency_list: {node_id: [neighbor_ids]}
        triplets: [(head, relation, tail)]
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Build adjacency list for Node2Vec
    adjacency_list = defaultdict(list)
    for edge in data.get('edges', []):
        source = edge['source']
        target = edge['target']
        adjacency_list[source].append(target)
        # For undirected graph, add reverse edge
        # adjacency_list[target].append(source)

    # Build triplets for TransE/TransR
    triplets = []
    for edge in data.get('edges', []):
        head = edge['source']
        relation = edge.get('relation', 'related')
        tail = edge['target']
        triplets.append((head, relation, tail))

    return dict(adjacency_list), triplets


def prepare_training_data(triplets: List[Tuple]) -> Tuple[Dict, Dict, List]:
    """
    Prepare indexed training data for TransE/TransR

    Returns:
        entity2idx: Entity to index mapping
        relation2idx: Relation to index mapping
        indexed_triplets: List of (head_idx, rel_idx, tail_idx)
    """
    # Extract unique entities and relations
    entities = set()
    relations = set()

    for head, relation, tail in triplets:
        entities.add(head)
        entities.add(tail)
        relations.add(relation)

    # Create mappings
    entity2idx = {entity: idx for idx, entity in enumerate(sorted(entities))}
    relation2idx = {relation: idx for idx, relation in enumerate(sorted(relations))}

    # Index triplets
    indexed_triplets = []
    for head, relation, tail in triplets:
        h_idx = entity2idx[head]
        r_idx = relation2idx[relation]
        t_idx = entity2idx[tail]
        indexed_triplets.append((h_idx, r_idx, t_idx))

    return entity2idx, relation2idx, indexed_triplets


def generate_negative_samples(triplets: List[Tuple], num_entities: int,
                              num_negatives: int = 1) -> List[Tuple]:
    """
    Generate negative samples by corrupting triplets
    """
    negative_samples = []

    for head, relation, tail in triplets:
        for _ in range(num_negatives):
            # Randomly corrupt head or tail
            if random.random() < 0.5:
                # Corrupt head
                neg_head = random.randint(0, num_entities - 1)
                negative_samples.append((neg_head, relation, tail))
            else:
                # Corrupt tail
                neg_tail = random.randint(0, num_entities - 1)
                negative_samples.append((head, relation, neg_tail))

    return negative_samples


def train_transe(triplets: List[Tuple], entity2idx: Dict, relation2idx: Dict,
                 embedding_dim: int = 128, epochs: int = 100,
                 batch_size: int = 128, learning_rate: float = 0.01,
                 margin: float = 1.0) -> TransE:
    """
    Train TransE model on knowledge graph triplets
    """
    num_entities = len(entity2idx)
    num_relations = len(relation2idx)

    model = TransE(num_entities, num_relations, embedding_dim, margin)
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    print(f"Training TransE: {num_entities} entities, {num_relations} relations")

    for epoch in range(epochs):
        random.shuffle(triplets)
        total_loss = 0.0

        for i in range(0, len(triplets), batch_size):
            batch = triplets[i:i+batch_size]

            # Generate negative samples
            neg_batch = generate_negative_samples(batch, num_entities, num_negatives=1)

            # Prepare tensors
            pos_heads = torch.tensor([t[0] for t in batch], dtype=torch.long)
            pos_rels = torch.tensor([t[1] for t in batch], dtype=torch.long)
            pos_tails = torch.tensor([t[2] for t in batch], dtype=torch.long)

            neg_heads = torch.tensor([t[0] for t in neg_batch], dtype=torch.long)
            neg_rels = torch.tensor([t[1] for t in neg_batch], dtype=torch.long)
            neg_tails = torch.tensor([t[2] for t in neg_batch], dtype=torch.long)

            # Compute loss
            loss = model.loss(pos_heads, pos_rels, pos_tails,
                            neg_heads, neg_rels, neg_tails)

            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss:.4f}")

    return model


def train_transr(triplets: List[Tuple], entity2idx: Dict, relation2idx: Dict,
                 entity_dim: int = 100, relation_dim: int = 50,
                 epochs: int = 100, batch_size: int = 128,
                 learning_rate: float = 0.01, margin: float = 1.0) -> TransR:
    """
    Train TransR model on knowledge graph triplets
    """
    num_entities = len(entity2idx)
    num_relations = len(relation2idx)

    model = TransR(num_entities, num_relations, entity_dim, relation_dim, margin)
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    print(f"Training TransR: {num_entities} entities, {num_relations} relations")

    for epoch in range(epochs):
        random.shuffle(triplets)
        total_loss = 0.0

        for i in range(0, len(triplets), batch_size):
            batch = triplets[i:i+batch_size]

            # Generate negative samples
            neg_batch = generate_negative_samples(batch, num_entities, num_negatives=1)

            # Prepare tensors
            pos_heads = torch.tensor([t[0] for t in batch], dtype=torch.long)
            pos_rels = torch.tensor([t[1] for t in batch], dtype=torch.long)
            pos_tails = torch.tensor([t[2] for t in batch], dtype=torch.long)

            neg_heads = torch.tensor([t[0] for t in neg_batch], dtype=torch.long)
            neg_rels = torch.tensor([t[1] for t in neg_batch], dtype=torch.long)
            neg_tails = torch.tensor([t[2] for t in neg_batch], dtype=torch.long)

            # Compute loss
            loss = model.loss(pos_heads, pos_rels, pos_tails,
                            neg_heads, neg_rels, neg_tails)

            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss:.4f}")

    return model


def save_embeddings(embeddings: Dict, entity2idx: Dict, relation2idx: Dict,
                   output_path: str, model_type: str):
    """
    Save trained embeddings and mappings
    """
    checkpoint = {
        'model_type': model_type,
        'embeddings': embeddings,
        'entity2idx': entity2idx,
        'relation2idx': relation2idx,
        'num_entities': len(entity2idx),
        'num_relations': len(relation2idx)
    }

    torch.save(checkpoint, output_path)
    print(f"Embeddings saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(description='Train knowledge graph embeddings')
    parser.add_argument('--model', type=str, required=True,
                       choices=['node2vec', 'transe', 'transr'],
                       help='Embedding model to train')
    parser.add_argument('--input', type=str, required=True,
                       help='Input graph JSON file')
    parser.add_argument('--output', type=str, required=True,
                       help='Output embeddings file')
    parser.add_argument('--dim', type=int, default=128,
                       help='Embedding dimension')
    parser.add_argument('--epochs', type=int, default=100,
                       help='Number of training epochs')
    parser.add_argument('--lr', type=float, default=0.01,
                       help='Learning rate')
    parser.add_argument('--batch-size', type=int, default=128,
                       help='Batch size for TransE/TransR')
    parser.add_argument('--margin', type=float, default=1.0,
                       help='Margin for ranking loss')

    # Node2Vec specific parameters
    parser.add_argument('--walk-length', type=int, default=80,
                       help='Random walk length for Node2Vec')
    parser.add_argument('--num-walks', type=int, default=10,
                       help='Number of walks per node for Node2Vec')
    parser.add_argument('--p', type=float, default=1.0,
                       help='Return parameter for Node2Vec')
    parser.add_argument('--q', type=float, default=1.0,
                       help='In-out parameter for Node2Vec')

    args = parser.parse_args()

    print(f"Loading graph data from {args.input}...")
    adjacency_list, triplets = load_graph_data(args.input)

    if args.model == 'node2vec':
        print("Training Node2Vec...")
        node2vec = Node2Vec(
            adjacency_list,
            embedding_dim=args.dim,
            walk_length=args.walk_length,
            num_walks=args.num_walks,
            p=args.p,
            q=args.q
        )

        walks = node2vec.generate_walks()
        node2vec.train(walks, epochs=args.epochs, learning_rate=args.lr)

        embeddings = node2vec.get_embeddings()
        save_embeddings(embeddings, node2vec.node2idx, {}, args.output, 'node2vec')

    elif args.model == 'transe':
        print("Training TransE...")
        entity2idx, relation2idx, indexed_triplets = prepare_training_data(triplets)

        model = train_transe(
            indexed_triplets,
            entity2idx,
            relation2idx,
            embedding_dim=args.dim,
            epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.lr,
            margin=args.margin
        )

        # Extract embeddings
        embeddings = {
            'entities': model.entity_embeddings.weight.detach().numpy(),
            'relations': model.relation_embeddings.weight.detach().numpy()
        }

        save_embeddings(embeddings, entity2idx, relation2idx, args.output, 'transe')

    elif args.model == 'transr':
        print("Training TransR...")
        entity2idx, relation2idx, indexed_triplets = prepare_training_data(triplets)

        model = train_transr(
            indexed_triplets,
            entity2idx,
            relation2idx,
            entity_dim=args.dim,
            relation_dim=args.dim // 2,
            epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.lr,
            margin=args.margin
        )

        # Extract embeddings
        embeddings = {
            'entities': model.entity_embeddings.weight.detach().numpy(),
            'relations': model.relation_embeddings.weight.detach().numpy(),
            'projections': model.projection_matrices.weight.detach().numpy()
        }

        save_embeddings(embeddings, entity2idx, relation2idx, args.output, 'transr')

    print("Training complete!")


if __name__ == '__main__':
    main()
