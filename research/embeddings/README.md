# Knowledge Graph Embedding Research

This module implements and evaluates multiple knowledge graph embedding techniques for theorem representation and link prediction.

## Overview

Knowledge graph embeddings transform discrete graph structures (theorems, relations) into continuous vector spaces, enabling:
- **Semantic similarity computation** between theorems
- **Link prediction** for discovering implicit relations
- **Clustering and categorization** of mathematical concepts
- **Transfer learning** for downstream mathematical reasoning tasks

## Implemented Models

### 1. Node2Vec
**Paper:** Grover & Leskovec (2016) - "node2vec: Scalable Feature Learning for Networks"

- **Approach:** Random walk-based embeddings using Skip-gram objective
- **Parameters:**
  - `p` (return parameter): Controls likelihood of revisiting nodes (default: 1.0)
  - `q` (in-out parameter): BFS vs DFS exploration trade-off (default: 1.0)
  - `walk_length`: Length of each random walk (default: 80)
  - `num_walks`: Number of walks per node (default: 10)
- **Best for:** General-purpose node embeddings, capturing structural equivalence

### 2. TransE (Translating Embeddings)
**Paper:** Bordes et al. (2013) - "Translating Embeddings for Modeling Multi-relational Data"

- **Approach:** Models relations as translations in embedding space: `h + r ≈ t`
- **Loss:** Margin-based ranking loss
- **Best for:** Simple, interpretable relation modeling; works well for hierarchical relations (e.g., "is-a", "implies")

### 3. TransR
**Paper:** Lin et al. (2015) - "Learning Entity and Relation Embeddings for Knowledge Graph Completion"

- **Approach:** Projects entities into relation-specific spaces before applying translation
- **Advantages:** Captures relation-specific semantics better than TransE
- **Best for:** Complex relations requiring different semantic spaces

## Usage

### Training Embeddings

```bash
# Train Node2Vec
python train.py --model node2vec \
  --input data/theorem_graph.json \
  --output embeddings/node2vec_128d.pt \
  --dim 128 \
  --epochs 5 \
  --walk-length 80 \
  --num-walks 10 \
  --p 1.0 \
  --q 1.0

# Train TransE
python train.py --model transe \
  --input data/theorem_graph.json \
  --output embeddings/transe_128d.pt \
  --dim 128 \
  --epochs 100 \
  --lr 0.01 \
  --batch-size 128 \
  --margin 1.0

# Train TransR
python train.py --model transr \
  --input data/theorem_graph.json \
  --output embeddings/transr_100d.pt \
  --dim 100 \
  --epochs 100 \
  --lr 0.01 \
  --batch-size 128
```

### Input Format

The training script expects a JSON file with the following structure:

```json
{
  "nodes": [
    {"id": "pythagorean_theorem", "label": "Pythagorean Theorem"},
    {"id": "triangle_inequality", "label": "Triangle Inequality"}
  ],
  "edges": [
    {
      "source": "pythagorean_theorem",
      "target": "triangle_inequality",
      "relation": "related_to"
    }
  ]
}
```

### Evaluation

```bash
# Evaluate embeddings on link prediction
node evaluate.mjs \
  --embeddings embeddings/transe_128d.pt \
  --test-data data/test_triplets.json \
  --output results/evaluation.json
```

### Test Data Format

```json
{
  "test_triplets": [
    ["head_entity", "relation", "tail_entity"]
  ],
  "valid_triplets": [
    ["head_entity", "relation", "tail_entity"]
  ],
  "negative_triplets": [
    ["head_entity", "relation", "wrong_tail"]
  ],
  "clusters": [
    ["entity1", "entity2", "entity3"],
    ["entity4", "entity5"]
  ]
}
```

### Visualization

Open `visualize.html` in a browser:

1. Load an embeddings file (JSON format)
2. Choose dimensionality reduction method (t-SNE, PCA, UMAP)
3. Adjust parameters (perplexity for t-SNE)
4. Click "Run Visualization"
5. Interact with the visualization:
   - **Pan:** Click and drag
   - **Zoom:** Mouse wheel
   - **Select node:** Click on a point
   - **Search:** Use the search box in the sidebar

## Evaluation Metrics

### Link Prediction
- **MRR (Mean Reciprocal Rank):** Average of 1/rank for correct predictions
- **Hits@K:** Percentage of correct predictions in top K candidates
  - Hits@1: Exact match rate
  - Hits@3: Top 3 accuracy
  - Hits@10: Top 10 accuracy

### Triple Classification
- **Accuracy:** Correct classifications / total classifications
- **Precision:** True positives / (true positives + false positives)
- **Recall:** True positives / (true positives + false negatives)
- **F1 Score:** Harmonic mean of precision and recall

### Clustering Quality
- **Intra-cluster similarity:** Average cosine similarity within clusters
- **Silhouette score:** Measure of cluster separation

### Semantic Coherence
- **Relation consistency:** Variance in implied relation vectors
- Lower variance indicates more consistent relation modeling

## Model Selection Guidelines

| Task | Recommended Model | Reason |
|------|-------------------|--------|
| Structural similarity | Node2Vec | Captures graph topology |
| Hierarchical relations | TransE | Simple, interpretable |
| Complex relations | TransR | Relation-specific spaces |
| General-purpose | TransE | Good balance |

## Performance Considerations

### Training Time
- **Node2Vec:** O(n × w × l) where n=nodes, w=walks, l=length
- **TransE:** O(e × b × i) where e=edges, b=batch size, i=iterations
- **TransR:** Similar to TransE but ~2-3x slower due to projections

### Memory
- **Node2Vec:** O(n × d) for embeddings
- **TransE:** O((n + r) × d) where r=relations
- **TransR:** O((n + r × d) × d) due to projection matrices

### Recommendations
- Start with 128-dimensional embeddings
- For large graphs (>100K nodes), use Node2Vec with fewer walks
- For relation-heavy graphs, prefer TransE/TransR
- Use GPU for TransE/TransR training with batch_size ≥ 512

## Advanced Techniques

### Hyperparameter Tuning
- **Embedding dimension:** 64-256 typical range; higher for complex graphs
- **Learning rate:** 0.001-0.1; use learning rate scheduling for convergence
- **Margin (TransE/TransR):** 0.5-2.0; higher for clearer separation
- **Perplexity (t-SNE):** 5-50; use ~n/3 for small datasets

### Negative Sampling
- Current implementation: Random entity corruption
- Advanced: Type-constrained negatives (respect entity types)
- Adversarial: Hard negative mining (sample from near-misses)

### Ensemble Methods
Combine multiple models for better predictions:

```python
# Average embeddings from multiple models
final_embedding = (node2vec_emb + transe_emb + transr_emb) / 3

# Weighted voting for link prediction
score = 0.4 * score_transe + 0.3 * score_transr + 0.3 * score_node2vec
```

## References

1. Grover, A., & Leskovec, J. (2016). node2vec: Scalable feature learning for networks. KDD.
2. Bordes, A., et al. (2013). Translating embeddings for modeling multi-relational data. NIPS.
3. Lin, Y., et al. (2015). Learning entity and relation embeddings for knowledge graph completion. AAAI.
4. Wang, Q., et al. (2017). Knowledge graph embedding: A survey of approaches and applications. TKDE.

## Future Work

- [ ] Implement RotatE, ComplEx embeddings
- [ ] Add attention mechanisms for relation modeling
- [ ] Integrate with neural theorem provers
- [ ] Add temporal dimension for evolving knowledge graphs
- [ ] Implement graph neural network variants (R-GCN, CompGCN)
- [ ] Add multi-hop reasoning capabilities
- [ ] Integrate with LLM embeddings for hybrid approach

## Dependencies

```bash
pip install torch numpy tqdm
```

For evaluation:
```bash
npm install
```

## License

MIT License - see LICENSE file for details
