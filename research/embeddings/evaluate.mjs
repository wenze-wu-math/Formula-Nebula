/**
 * Knowledge Graph Embedding Evaluation Module
 *
 * Evaluates trained embeddings on:
 * 1. Link Prediction (predicting missing edges)
 * 2. Triple Classification (classifying if a triplet is valid)
 * 3. Entity Clustering (measuring embedding quality)
 * 4. Semantic Coherence (measuring relation consistency)
 *
 * Usage:
 *   node evaluate.mjs --embeddings embeddings.pt --test-data test.json
 */

import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have same dimension');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (norm1 * norm2);
}

/**
 * Calculate L2 (Euclidean) distance
 */
function l2Distance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have same dimension');
  }

  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calculate L1 (Manhattan) distance
 */
function l1Distance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have same dimension');
  }

  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += Math.abs(vec1[i] - vec2[i]);
  }

  return sum;
}

/**
 * Load embeddings from checkpoint file
 */
function loadEmbeddings(filepath) {
  // This is a placeholder - in practice, you'd need to parse PyTorch .pt files
  // For now, assuming JSON format or converted format
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  return data;
}

/**
 * Load test data (triplets for evaluation)
 */
function loadTestData(filepath) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  return data;
}

// ============================================================================
// Link Prediction Evaluation
// ============================================================================

class LinkPredictionEvaluator {
  constructor(embeddings, modelType = 'transe') {
    this.embeddings = embeddings;
    this.modelType = modelType;
    this.entity2idx = embeddings.entity2idx || {};
    this.relation2idx = embeddings.relation2idx || {};
    this.idx2entity = Object.fromEntries(
      Object.entries(this.entity2idx).map(([k, v]) => [v, k])
    );
    this.idx2relation = Object.fromEntries(
      Object.entries(this.relation2idx).map(([k, v]) => [v, k])
    );
  }

  /**
   * Score a triplet (head, relation, tail) using the embedding model
   */
  scoreTriplet(head, relation, tail) {
    const headIdx = this.entity2idx[head];
    const relIdx = this.relation2idx[relation];
    const tailIdx = this.entity2idx[tail];

    if (headIdx === undefined || relIdx === undefined || tailIdx === undefined) {
      return Infinity; // Unknown entities get worst score
    }

    if (this.modelType === 'node2vec') {
      // For Node2Vec, use cosine similarity
      const headEmb = this.embeddings.embeddings[head];
      const tailEmb = this.embeddings.embeddings[tail];
      return -cosineSimilarity(headEmb, tailEmb); // Negative for ranking
    } else if (this.modelType === 'transe') {
      // TransE: ||h + r - t||
      const headEmb = this.embeddings.embeddings.entities[headIdx];
      const relEmb = this.embeddings.embeddings.relations[relIdx];
      const tailEmb = this.embeddings.embeddings.entities[tailIdx];

      const translated = headEmb.map((val, i) => val + relEmb[i] - tailEmb[i]);
      return l2Distance(translated, new Array(translated.length).fill(0));
    } else if (this.modelType === 'transr') {
      // TransR: Project entities, then score
      // Simplified version - full implementation would use projection matrices
      const headEmb = this.embeddings.embeddings.entities[headIdx];
      const relEmb = this.embeddings.embeddings.relations[relIdx];
      const tailEmb = this.embeddings.embeddings.entities[tailIdx];

      const translated = headEmb.map((val, i) => val + relEmb[i % relEmb.length] - tailEmb[i]);
      return l2Distance(translated, new Array(translated.length).fill(0));
    }

    return Infinity;
  }

  /**
   * Predict the tail entity given head and relation
   * Returns top-k candidates with scores
   */
  predictTail(head, relation, k = 10) {
    const candidates = [];

    for (const [entity, idx] of Object.entries(this.entity2idx)) {
      const score = this.scoreTriplet(head, relation, entity);
      candidates.push({ entity, score });
    }

    // Sort by score (lower is better for distance-based models)
    candidates.sort((a, b) => a.score - b.score);

    return candidates.slice(0, k);
  }

  /**
   * Predict the head entity given relation and tail
   * Returns top-k candidates with scores
   */
  predictHead(relation, tail, k = 10) {
    const candidates = [];

    for (const [entity, idx] of Object.entries(this.entity2idx)) {
      const score = this.scoreTriplet(entity, relation, tail);
      candidates.push({ entity, score });
    }

    candidates.sort((a, b) => a.score - b.score);
    return candidates.slice(0, k);
  }

  /**
   * Evaluate link prediction on test set
   * Metrics: MRR (Mean Reciprocal Rank), Hits@K
   */
  evaluateLinkPrediction(testTriplets, k = 10) {
    let totalReciprocalRank = 0;
    let hitsAt1 = 0;
    let hitsAt3 = 0;
    let hitsAt10 = 0;
    let numTests = 0;

    console.log(`Evaluating link prediction on ${testTriplets.length} triplets...`);

    for (const triplet of testTriplets) {
      const [head, relation, tail] = triplet;

      // Predict tail
      const predictions = this.predictTail(head, relation, 100);
      const rank = predictions.findIndex(p => p.entity === tail) + 1;

      if (rank > 0) {
        totalReciprocalRank += 1 / rank;
        if (rank === 1) hitsAt1++;
        if (rank <= 3) hitsAt3++;
        if (rank <= 10) hitsAt10++;
        numTests++;
      }
    }

    const mrr = totalReciprocalRank / numTests;
    const hits1 = hitsAt1 / numTests;
    const hits3 = hitsAt3 / numTests;
    const hits10 = hitsAt10 / numTests;

    return {
      mrr,
      hits_at_1: hits1,
      hits_at_3: hits3,
      hits_at_10: hits10,
      num_tests: numTests
    };
  }
}

// ============================================================================
// Triple Classification Evaluation
// ============================================================================

class TripleClassificationEvaluator {
  constructor(embeddings, modelType = 'transe', threshold = null) {
    this.embeddings = embeddings;
    this.modelType = modelType;
    this.threshold = threshold;
    this.linkPredictor = new LinkPredictionEvaluator(embeddings, modelType);
  }

  /**
   * Determine optimal threshold from validation set
   */
  findOptimalThreshold(validTriplets, negativeTriplets) {
    const scores = [];

    // Collect scores for positive triplets
    for (const triplet of validTriplets) {
      const score = this.linkPredictor.scoreTriplet(...triplet);
      scores.push({ score, label: 1 });
    }

    // Collect scores for negative triplets
    for (const triplet of negativeTriplets) {
      const score = this.linkPredictor.scoreTriplet(...triplet);
      scores.push({ score, label: 0 });
    }

    // Sort by score
    scores.sort((a, b) => a.score - b.score);

    // Find threshold that maximizes accuracy
    let bestAccuracy = 0;
    let bestThreshold = 0;

    for (let i = 0; i < scores.length; i++) {
      const threshold = scores[i].score;
      let correct = 0;

      for (const item of scores) {
        const predicted = item.score <= threshold ? 1 : 0;
        if (predicted === item.label) correct++;
      }

      const accuracy = correct / scores.length;
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestThreshold = threshold;
      }
    }

    this.threshold = bestThreshold;
    return { threshold: bestThreshold, accuracy: bestAccuracy };
  }

  /**
   * Classify triplets as valid or invalid
   */
  evaluateClassification(testTriplets, negativeTestTriplets) {
    if (this.threshold === null) {
      throw new Error('Threshold not set. Call findOptimalThreshold first.');
    }

    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    // Evaluate positive triplets
    for (const triplet of testTriplets) {
      const score = this.linkPredictor.scoreTriplet(...triplet);
      const predicted = score <= this.threshold ? 1 : 0;

      if (predicted === 1) {
        truePositives++;
      } else {
        falseNegatives++;
      }
    }

    // Evaluate negative triplets
    for (const triplet of negativeTestTriplets) {
      const score = this.linkPredictor.scoreTriplet(...triplet);
      const predicted = score <= this.threshold ? 1 : 0;

      if (predicted === 0) {
        trueNegatives++;
      } else {
        falsePositives++;
      }
    }

    const accuracy = (truePositives + trueNegatives) /
                     (truePositives + trueNegatives + falsePositives + falseNegatives);
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1 = 2 * (precision * recall) / (precision + recall) || 0;

    return {
      accuracy,
      precision,
      recall,
      f1_score: f1,
      true_positives: truePositives,
      false_positives: falsePositives,
      true_negatives: trueNegatives,
      false_negatives: falseNegatives
    };
  }
}

// ============================================================================
// Clustering Quality Evaluation
// ============================================================================

class ClusteringEvaluator {
  constructor(embeddings) {
    this.embeddings = embeddings;
  }

  /**
   * Find k-nearest neighbors for an entity
   */
  findKNN(entityId, k = 5) {
    const targetEmb = this.embeddings.embeddings[entityId];
    if (!targetEmb) {
      return [];
    }

    const similarities = [];

    for (const [otherEntity, otherEmb] of Object.entries(this.embeddings.embeddings)) {
      if (otherEntity === entityId) continue;

      const similarity = cosineSimilarity(targetEmb, otherEmb);
      similarities.push({ entity: otherEntity, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, k);
  }

  /**
   * Calculate average intra-cluster similarity
   * (for entities that should be related)
   */
  calculateIntraClusterSimilarity(clusters) {
    let totalSimilarity = 0;
    let numPairs = 0;

    for (const cluster of clusters) {
      for (let i = 0; i < cluster.length; i++) {
        for (let j = i + 1; j < cluster.length; j++) {
          const emb1 = this.embeddings.embeddings[cluster[i]];
          const emb2 = this.embeddings.embeddings[cluster[j]];

          if (emb1 && emb2) {
            totalSimilarity += cosineSimilarity(emb1, emb2);
            numPairs++;
          }
        }
      }
    }

    return numPairs > 0 ? totalSimilarity / numPairs : 0;
  }

  /**
   * Evaluate embedding quality using silhouette score
   * (simplified version)
   */
  calculateSilhouetteScore(clusters) {
    // Implementation of silhouette coefficient
    // Measures how similar an entity is to its own cluster vs other clusters
    // Range: [-1, 1], higher is better

    // This is a simplified placeholder
    return 0.5; // Would need full implementation
  }
}

// ============================================================================
// Relation Semantic Coherence Evaluation
// ============================================================================

class SemanticCoherenceEvaluator {
  constructor(embeddings, modelType = 'transe') {
    this.embeddings = embeddings;
    this.modelType = modelType;
  }

  /**
   * Calculate consistency of a relation across different entity pairs
   * Good embeddings should give similar relation vectors for the same relation type
   */
  evaluateRelationConsistency(triplets) {
    const relationGroups = {};

    // Group triplets by relation
    for (const [head, relation, tail] of triplets) {
      if (!relationGroups[relation]) {
        relationGroups[relation] = [];
      }
      relationGroups[relation].push([head, tail]);
    }

    const results = {};

    for (const [relation, pairs] of Object.entries(relationGroups)) {
      if (this.modelType === 'node2vec') {
        // For Node2Vec, calculate average similarity between connected pairs
        let totalSim = 0;
        let count = 0;

        for (const [head, tail] of pairs) {
          const headEmb = this.embeddings.embeddings[head];
          const tailEmb = this.embeddings.embeddings[tail];

          if (headEmb && tailEmb) {
            totalSim += cosineSimilarity(headEmb, tailEmb);
            count++;
          }
        }

        results[relation] = {
          average_similarity: count > 0 ? totalSim / count : 0,
          num_pairs: count
        };
      } else {
        // For TransE/TransR, calculate variance in implied relation vectors
        const impliedRelations = [];

        for (const [head, tail] of pairs) {
          const headIdx = this.embeddings.entity2idx[head];
          const tailIdx = this.embeddings.entity2idx[tail];

          if (headIdx !== undefined && tailIdx !== undefined) {
            const headEmb = this.embeddings.embeddings.entities[headIdx];
            const tailEmb = this.embeddings.embeddings.entities[tailIdx];

            // Implied relation: tail - head
            const impliedRel = tailEmb.map((val, i) => val - headEmb[i]);
            impliedRelations.push(impliedRel);
          }
        }

        // Calculate variance (lower variance = more consistent)
        if (impliedRelations.length > 1) {
          const mean = new Array(impliedRelations[0].length).fill(0);
          for (const rel of impliedRelations) {
            for (let i = 0; i < rel.length; i++) {
              mean[i] += rel[i];
            }
          }
          mean.forEach((val, i) => mean[i] = val / impliedRelations.length);

          let variance = 0;
          for (const rel of impliedRelations) {
            variance += l2Distance(rel, mean) ** 2;
          }
          variance /= impliedRelations.length;

          results[relation] = {
            variance: variance,
            num_pairs: impliedRelations.length
          };
        }
      }
    }

    return results;
  }
}

// ============================================================================
// Main Evaluation Runner
// ============================================================================

async function runEvaluation(embeddingsPath, testDataPath, options = {}) {
  console.log('Loading embeddings...');
  const embeddings = loadEmbeddings(embeddingsPath);

  console.log('Loading test data...');
  const testData = loadTestData(testDataPath);

  const modelType = embeddings.model_type || options.modelType || 'transe';

  const results = {
    model_type: modelType,
    timestamp: new Date().toISOString()
  };

  // Link Prediction Evaluation
  if (testData.test_triplets) {
    console.log('\n=== Link Prediction Evaluation ===');
    const linkPredictor = new LinkPredictionEvaluator(embeddings, modelType);
    const linkPredResults = linkPredictor.evaluateLinkPrediction(testData.test_triplets);

    console.log(`MRR: ${linkPredResults.mrr.toFixed(4)}`);
    console.log(`Hits@1: ${linkPredResults.hits_at_1.toFixed(4)}`);
    console.log(`Hits@3: ${linkPredResults.hits_at_3.toFixed(4)}`);
    console.log(`Hits@10: ${linkPredResults.hits_at_10.toFixed(4)}`);

    results.link_prediction = linkPredResults;
  }

  // Triple Classification Evaluation
  if (testData.valid_triplets && testData.negative_triplets) {
    console.log('\n=== Triple Classification Evaluation ===');
    const classifier = new TripleClassificationEvaluator(embeddings, modelType);

    console.log('Finding optimal threshold...');
    const thresholdResult = classifier.findOptimalThreshold(
      testData.valid_triplets,
      testData.negative_triplets
    );
    console.log(`Optimal threshold: ${thresholdResult.threshold.toFixed(4)}`);

    const classResults = classifier.evaluateClassification(
      testData.test_triplets,
      testData.negative_test_triplets
    );

    console.log(`Accuracy: ${classResults.accuracy.toFixed(4)}`);
    console.log(`Precision: ${classResults.precision.toFixed(4)}`);
    console.log(`Recall: ${classResults.recall.toFixed(4)}`);
    console.log(`F1 Score: ${classResults.f1_score.toFixed(4)}`);

    results.triple_classification = classResults;
  }

  // Clustering Quality
  if (testData.clusters) {
    console.log('\n=== Clustering Quality Evaluation ===');
    const clusteringEval = new ClusteringEvaluator(embeddings);
    const intraClusterSim = clusteringEval.calculateIntraClusterSimilarity(testData.clusters);

    console.log(`Intra-cluster similarity: ${intraClusterSim.toFixed(4)}`);

    results.clustering = {
      intra_cluster_similarity: intraClusterSim
    };
  }

  // Semantic Coherence
  if (testData.test_triplets) {
    console.log('\n=== Semantic Coherence Evaluation ===');
    const coherenceEval = new SemanticCoherenceEvaluator(embeddings, modelType);
    const coherenceResults = coherenceEval.evaluateRelationConsistency(testData.test_triplets);

    console.log('Relation consistency:');
    for (const [relation, stats] of Object.entries(coherenceResults)) {
      console.log(`  ${relation}: ${JSON.stringify(stats)}`);
    }

    results.semantic_coherence = coherenceResults;
  }

  // Save results
  const outputPath = options.output || embeddingsPath.replace('.pt', '_evaluation.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nEvaluation results saved to ${outputPath}`);

  return results;
}

// ============================================================================
// CLI Interface
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    embeddings: null,
    testData: null,
    output: null,
    modelType: 'transe'
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--embeddings':
        options.embeddings = args[++i];
        break;
      case '--test-data':
        options.testData = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--model-type':
        options.modelType = args[++i];
        break;
      case '--help':
        console.log(`
Usage: node evaluate.mjs [options]

Options:
  --embeddings <path>    Path to embeddings file (required)
  --test-data <path>     Path to test data JSON (required)
  --output <path>        Output path for evaluation results
  --model-type <type>    Model type (node2vec, transe, transr)
  --help                 Show this help message
        `);
        process.exit(0);
    }
  }

  if (!options.embeddings || !options.testData) {
    console.error('Error: --embeddings and --test-data are required');
    process.exit(1);
  }

  return options;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs();
  runEvaluation(options.embeddings, options.testData, options)
    .catch(error => {
      console.error('Evaluation failed:', error);
      process.exit(1);
    });
}

export {
  LinkPredictionEvaluator,
  TripleClassificationEvaluator,
  ClusteringEvaluator,
  SemanticCoherenceEvaluator,
  cosineSimilarity,
  l2Distance,
  l1Distance,
  runEvaluation
};
