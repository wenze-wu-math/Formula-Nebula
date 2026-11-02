#!/bin/bash

# Knowledge Graph Embedding Demo Script
# This script demonstrates the complete workflow:
# 1. Train embeddings using different models
# 2. Evaluate on link prediction and classification
# 3. Generate visualizations

set -e

echo "========================================"
echo "Knowledge Graph Embedding Demo"
echo "========================================"
echo ""

# Create output directories
mkdir -p output/embeddings
mkdir -p output/evaluations
mkdir -p output/visualizations

# Sample data paths
GRAPH_DATA="sample_data.json"
TEST_DATA="sample_test_data.json"

# ============================================
# Step 1: Train Node2Vec
# ============================================
echo "[1/6] Training Node2Vec embeddings..."
python train.py \
  --model node2vec \
  --input "$GRAPH_DATA" \
  --output output/embeddings/node2vec_128d.pt \
  --dim 128 \
  --epochs 5 \
  --walk-length 40 \
  --num-walks 10 \
  --p 1.0 \
  --q 1.0

echo "✓ Node2Vec training complete"
echo ""

# ============================================
# Step 2: Train TransE
# ============================================
echo "[2/6] Training TransE embeddings..."
python train.py \
  --model transe \
  --input "$GRAPH_DATA" \
  --output output/embeddings/transe_128d.pt \
  --dim 128 \
  --epochs 50 \
  --lr 0.01 \
  --batch-size 8 \
  --margin 1.0

echo "✓ TransE training complete"
echo ""

# ============================================
# Step 3: Train TransR
# ============================================
echo "[3/6] Training TransR embeddings..."
python train.py \
  --model transr \
  --input "$GRAPH_DATA" \
  --output output/embeddings/transr_100d.pt \
  --dim 100 \
  --epochs 50 \
  --lr 0.01 \
  --batch-size 8 \
  --margin 1.0

echo "✓ TransR training complete"
echo ""

# ============================================
# Step 4: Evaluate Node2Vec
# ============================================
echo "[4/6] Evaluating Node2Vec..."
node evaluate.mjs \
  --embeddings output/embeddings/node2vec_128d.pt \
  --test-data "$TEST_DATA" \
  --model-type node2vec \
  --output output/evaluations/node2vec_eval.json

echo "✓ Node2Vec evaluation complete"
echo ""

# ============================================
# Step 5: Evaluate TransE
# ============================================
echo "[5/6] Evaluating TransE..."
node evaluate.mjs \
  --embeddings output/embeddings/transe_128d.pt \
  --test-data "$TEST_DATA" \
  --model-type transe \
  --output output/evaluations/transe_eval.json

echo "✓ TransE evaluation complete"
echo ""

# ============================================
# Step 6: Evaluate TransR
# ============================================
echo "[6/6] Evaluating TransR..."
node evaluate.mjs \
  --embeddings output/embeddings/transr_100d.pt \
  --test-data "$TEST_DATA" \
  --model-type transr \
  --output output/evaluations/transr_eval.json

echo "✓ TransR evaluation complete"
echo ""

# ============================================
# Display Results Summary
# ============================================
echo "========================================"
echo "Training & Evaluation Complete!"
echo "========================================"
echo ""
echo "Output files:"
echo "  Embeddings: output/embeddings/"
echo "  Evaluations: output/evaluations/"
echo ""
echo "To visualize embeddings:"
echo "  1. Open visualize.html in your browser"
echo "  2. Load one of the embedding files from output/embeddings/"
echo "  3. Click 'Run Visualization'"
echo ""
echo "Evaluation results:"
for eval_file in output/evaluations/*.json; do
  if [ -f "$eval_file" ]; then
    echo ""
    echo "$(basename $eval_file):"
    cat "$eval_file" | grep -E '"mrr"|"hits_at_1"|"accuracy"|"f1_score"' | head -5
  fi
done
echo ""
echo "Done!"
