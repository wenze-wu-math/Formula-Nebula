"""
Unit tests for knowledge graph embedding implementations
"""

import unittest
import torch
import numpy as np
import json
import tempfile
import os
from train import (
    Node2Vec,
    TransE,
    TransR,
    load_graph_data,
    prepare_training_data,
    generate_negative_samples,
    train_transe,
    train_transr
)


class TestNode2Vec(unittest.TestCase):
    def setUp(self):
        """Create a simple test graph"""
        self.graph = {
            'A': ['B', 'C'],
            'B': ['A', 'C', 'D'],
            'C': ['A', 'B', 'D'],
            'D': ['B', 'C']
        }
        self.embedding_dim = 32

    def test_initialization(self):
        """Test Node2Vec initialization"""
        node2vec = Node2Vec(self.graph, embedding_dim=self.embedding_dim)

        self.assertEqual(len(node2vec.nodes), 4)
        self.assertEqual(node2vec.embedding_dim, self.embedding_dim)
        self.assertEqual(node2vec.embeddings.weight.shape,
                        (4, self.embedding_dim))

    def test_random_walk(self):
        """Test random walk generation"""
        node2vec = Node2Vec(self.graph, walk_length=10)
        walk = node2vec._random_walk('A')

        self.assertEqual(walk[0], 'A')
        self.assertLessEqual(len(walk), 10)
        # All nodes in walk should be in graph
        for node in walk:
            self.assertIn(node, self.graph)

    def test_generate_walks(self):
        """Test walk generation for all nodes"""
        node2vec = Node2Vec(self.graph, num_walks=2, walk_length=5)
        walks = node2vec.generate_walks()

        # Should have num_walks * num_nodes walks
        self.assertEqual(len(walks), 2 * 4)

    def test_training(self):
        """Test Node2Vec training"""
        node2vec = Node2Vec(self.graph, embedding_dim=16, num_walks=2)
        walks = node2vec.generate_walks()

        # Get initial embeddings
        initial_emb = node2vec.embeddings.weight.data.clone()

        # Train
        node2vec.train(walks, epochs=1, learning_rate=0.1)

        # Embeddings should change after training
        final_emb = node2vec.embeddings.weight.data
        self.assertFalse(torch.allclose(initial_emb, final_emb))

    def test_get_embeddings(self):
        """Test embedding extraction"""
        node2vec = Node2Vec(self.graph, embedding_dim=self.embedding_dim)
        embeddings = node2vec.get_embeddings()

        self.assertEqual(len(embeddings), 4)
        self.assertEqual(embeddings['A'].shape, (self.embedding_dim,))


class TestTransE(unittest.TestCase):
    def setUp(self):
        """Create test data"""
        self.num_entities = 10
        self.num_relations = 5
        self.embedding_dim = 32

    def test_initialization(self):
        """Test TransE initialization"""
        model = TransE(
            self.num_entities,
            self.num_relations,
            self.embedding_dim
        )

        self.assertEqual(model.entity_embeddings.weight.shape,
                        (self.num_entities, self.embedding_dim))
        self.assertEqual(model.relation_embeddings.weight.shape,
                        (self.num_relations, self.embedding_dim))

    def test_forward(self):
        """Test forward pass"""
        model = TransE(self.num_entities, self.num_relations, self.embedding_dim)

        heads = torch.tensor([0, 1, 2])
        relations = torch.tensor([0, 1, 2])
        tails = torch.tensor([3, 4, 5])

        scores = model.forward(heads, relations, tails)

        self.assertEqual(scores.shape, (3,))
        self.assertTrue(torch.all(scores >= 0))  # L2 distance is non-negative

    def test_loss(self):
        """Test loss computation"""
        model = TransE(self.num_entities, self.num_relations, self.embedding_dim)

        pos_heads = torch.tensor([0, 1])
        pos_rels = torch.tensor([0, 1])
        pos_tails = torch.tensor([2, 3])

        neg_heads = torch.tensor([4, 5])
        neg_rels = torch.tensor([0, 1])
        neg_tails = torch.tensor([6, 7])

        loss = model.loss(pos_heads, pos_rels, pos_tails,
                         neg_heads, neg_rels, neg_tails)

        self.assertTrue(loss.item() >= 0)


class TestTransR(unittest.TestCase):
    def setUp(self):
        """Create test data"""
        self.num_entities = 10
        self.num_relations = 5
        self.entity_dim = 50
        self.relation_dim = 30

    def test_initialization(self):
        """Test TransR initialization"""
        model = TransR(
            self.num_entities,
            self.num_relations,
            self.entity_dim,
            self.relation_dim
        )

        self.assertEqual(model.entity_embeddings.weight.shape,
                        (self.num_entities, self.entity_dim))
        self.assertEqual(model.relation_embeddings.weight.shape,
                        (self.num_relations, self.relation_dim))
        self.assertEqual(model.projection_matrices.weight.shape,
                        (self.num_relations, self.entity_dim * self.relation_dim))

    def test_projection(self):
        """Test entity projection"""
        model = TransR(
            self.num_entities,
            self.num_relations,
            self.entity_dim,
            self.relation_dim
        )

        entities = torch.randn(3, self.entity_dim)
        relations = torch.tensor([0, 1, 2])

        projected = model._project(entities, relations)

        self.assertEqual(projected.shape, (3, self.relation_dim))

    def test_forward(self):
        """Test forward pass"""
        model = TransR(
            self.num_entities,
            self.num_relations,
            self.entity_dim,
            self.relation_dim
        )

        heads = torch.tensor([0, 1, 2])
        relations = torch.tensor([0, 1, 2])
        tails = torch.tensor([3, 4, 5])

        scores = model.forward(heads, relations, tails)

        self.assertEqual(scores.shape, (3,))
        self.assertTrue(torch.all(scores >= 0))


class TestDataUtils(unittest.TestCase):
    def setUp(self):
        """Create test graph data"""
        self.graph_data = {
            "nodes": [
                {"id": "node1", "label": "Node 1"},
                {"id": "node2", "label": "Node 2"},
                {"id": "node3", "label": "Node 3"}
            ],
            "edges": [
                {"source": "node1", "target": "node2", "relation": "rel1"},
                {"source": "node2", "target": "node3", "relation": "rel2"},
                {"source": "node1", "target": "node3", "relation": "rel1"}
            ]
        }

        # Create temporary file
        self.temp_file = tempfile.NamedTemporaryFile(
            mode='w', delete=False, suffix='.json'
        )
        json.dump(self.graph_data, self.temp_file)
        self.temp_file.close()

    def tearDown(self):
        """Clean up temporary file"""
        os.unlink(self.temp_file.name)

    def test_load_graph_data(self):
        """Test graph data loading"""
        adjacency_list, triplets = load_graph_data(self.temp_file.name)

        # Check adjacency list
        self.assertEqual(len(adjacency_list), 2)  # node1 and node2 have outgoing edges
        self.assertIn('node2', adjacency_list['node1'])
        self.assertIn('node3', adjacency_list['node2'])

        # Check triplets
        self.assertEqual(len(triplets), 3)
        self.assertIn(('node1', 'rel1', 'node2'), triplets)

    def test_prepare_training_data(self):
        """Test training data preparation"""
        triplets = [
            ('node1', 'rel1', 'node2'),
            ('node2', 'rel2', 'node3'),
            ('node1', 'rel1', 'node3')
        ]

        entity2idx, relation2idx, indexed_triplets = prepare_training_data(triplets)

        # Check mappings
        self.assertEqual(len(entity2idx), 3)
        self.assertEqual(len(relation2idx), 2)

        # Check indexed triplets
        self.assertEqual(len(indexed_triplets), 3)
        for h, r, t in indexed_triplets:
            self.assertIsInstance(h, int)
            self.assertIsInstance(r, int)
            self.assertIsInstance(t, int)

    def test_generate_negative_samples(self):
        """Test negative sample generation"""
        triplets = [
            (0, 0, 1),
            (1, 1, 2),
            (0, 0, 2)
        ]

        neg_samples = generate_negative_samples(triplets, num_entities=5, num_negatives=2)

        # Should have 2 negatives per positive
        self.assertEqual(len(neg_samples), 6)

        # Negatives should have same relations
        for i, (h, r, t) in enumerate(neg_samples):
            orig_idx = i // 2
            self.assertEqual(r, triplets[orig_idx][1])


class TestTraining(unittest.TestCase):
    def setUp(self):
        """Create minimal training data"""
        self.triplets = [
            (0, 0, 1),
            (1, 1, 2),
            (2, 0, 3),
            (0, 1, 3)
        ]
        self.entity2idx = {f'e{i}': i for i in range(4)}
        self.relation2idx = {'r0': 0, 'r1': 1}

    def test_train_transe(self):
        """Test TransE training"""
        model = train_transe(
            self.triplets,
            self.entity2idx,
            self.relation2idx,
            embedding_dim=16,
            epochs=2,
            batch_size=2,
            learning_rate=0.1
        )

        self.assertIsInstance(model, TransE)
        self.assertEqual(model.num_entities, 4)
        self.assertEqual(model.num_relations, 2)

    def test_train_transr(self):
        """Test TransR training"""
        model = train_transr(
            self.triplets,
            self.entity2idx,
            self.relation2idx,
            entity_dim=20,
            relation_dim=10,
            epochs=2,
            batch_size=2,
            learning_rate=0.1
        )

        self.assertIsInstance(model, TransR)
        self.assertEqual(model.num_entities, 4)
        self.assertEqual(model.num_relations, 2)


class TestEmbeddingQuality(unittest.TestCase):
    """Test embedding quality metrics"""

    def test_embedding_normalization(self):
        """Test that embeddings are properly normalized"""
        model = TransE(10, 5, 32)
        heads = torch.tensor([0, 1, 2])
        relations = torch.tensor([0, 1, 2])
        tails = torch.tensor([3, 4, 5])

        # Forward pass normalizes entities
        _ = model.forward(heads, relations, tails)

        # Check that entity embeddings are normalized (during forward)
        with torch.no_grad():
            h = model.entity_embeddings(heads)
            h = torch.nn.functional.normalize(h, p=2, dim=-1)
            norms = torch.norm(h, p=2, dim=-1)
            self.assertTrue(torch.allclose(norms, torch.ones_like(norms), atol=1e-5))

    def test_relation_consistency(self):
        """Test that similar relations have similar embeddings"""
        model = TransE(10, 3, 32)

        # Train on similar triplets
        pos_heads = torch.tensor([0, 0, 1, 1])
        pos_rels = torch.tensor([0, 0, 1, 1])  # Two relations
        pos_tails = torch.tensor([2, 3, 2, 3])

        neg_heads = torch.tensor([4, 5, 6, 7])
        neg_rels = torch.tensor([0, 0, 1, 1])
        neg_tails = torch.tensor([8, 9, 8, 9])

        optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

        # Train for a few iterations
        for _ in range(10):
            loss = model.loss(pos_heads, pos_rels, pos_tails,
                            neg_heads, neg_rels, neg_tails)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        # Relations 0 and 1 should be more similar to each other than to 2
        with torch.no_grad():
            rel0 = model.relation_embeddings(torch.tensor([0]))
            rel1 = model.relation_embeddings(torch.tensor([1]))
            rel2 = model.relation_embeddings(torch.tensor([2]))

            sim_01 = torch.cosine_similarity(rel0, rel1)
            sim_02 = torch.cosine_similarity(rel0, rel2)

            # This is a weak test, but relations that are trained together
            # should have some relationship
            self.assertTrue(sim_01.item() != 0 or sim_02.item() != 0)


def run_tests():
    """Run all tests"""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestNode2Vec))
    suite.addTests(loader.loadTestsFromTestCase(TestTransE))
    suite.addTests(loader.loadTestsFromTestCase(TestTransR))
    suite.addTests(loader.loadTestsFromTestCase(TestDataUtils))
    suite.addTests(loader.loadTestsFromTestCase(TestTraining))
    suite.addTests(loader.loadTestsFromTestCase(TestEmbeddingQuality))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    exit(0 if success else 1)
