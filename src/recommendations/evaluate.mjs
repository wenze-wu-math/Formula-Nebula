/**
 * ═══════════════════════════════════════════════════════════════
 *  Evaluation Script for Collaborative Filtering Model
 * ═══════════════════════════════════════════════════════════════
 *
 * Comprehensive evaluation metrics including:
 * - Prediction accuracy (RMSE, MAE, R²)
 * - Ranking metrics (Precision@K, Recall@K, NDCG)
 * - Coverage and diversity
 * - User and item analysis
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CollaborativeFilteringEngine } from './collaborative.js';
import { generateSimulatedData, trainTestSplit } from './train.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Evaluation metrics calculator
 */
class RecommenderEvaluator {
  constructor(engine, testData, allInteractions) {
    this.engine = engine;
    this.testData = testData;
    this.allInteractions = allInteractions;
  }

  /**
   * Calculate RMSE (Root Mean Squared Error)
   */
  calculateRMSE() {
    let sumSquaredError = 0;
    let count = 0;

    this.testData.forEach(({ userId, theoremId, rating }) => {
      const predicted = this.engine.predict(userId, theoremId);
      const error = rating - predicted;
      sumSquaredError += error * error;
      count++;
    });

    return Math.sqrt(sumSquaredError / count);
  }

  /**
   * Calculate MAE (Mean Absolute Error)
   */
  calculateMAE() {
    let sumAbsoluteError = 0;
    let count = 0;

    this.testData.forEach(({ userId, theoremId, rating }) => {
      const predicted = this.engine.predict(userId, theoremId);
      const error = Math.abs(rating - predicted);
      sumAbsoluteError += error;
      count++;
    });

    return sumAbsoluteError / count;
  }

  /**
   * Calculate R² (Coefficient of Determination)
   */
  calculateR2() {
    const meanActual = this.testData.reduce((sum, d) => sum + d.rating, 0) / this.testData.length;

    let ssRes = 0;
    let ssTot = 0;

    this.testData.forEach(({ userId, theoremId, rating }) => {
      const predicted = this.engine.predict(userId, theoremId);
      ssRes += Math.pow(rating - predicted, 2);
      ssTot += Math.pow(rating - meanActual, 2);
    });

    return 1 - (ssRes / ssTot);
  }

  /**
   * Calculate Precision@K
   */
  calculatePrecisionAtK(k = 10, threshold = 4.0) {
    const users = [...new Set(this.testData.map(d => d.userId))];
    const precisions = [];

    users.forEach(userId => {
      // Get user's test items they liked
      const likedItems = new Set(
        this.testData
          .filter(d => d.userId === userId && d.rating >= threshold)
          .map(d => d.theoremId)
      );

      if (likedItems.size === 0) return;

      // Get recommendations
      const recommendations = this.engine.recommend(userId, k, true);
      const recommendedItems = recommendations.map(r => r.theoremId);

      // Count hits
      const hits = recommendedItems.filter(item => likedItems.has(item)).length;
      precisions.push(hits / k);
    });

    return precisions.length > 0
      ? precisions.reduce((sum, p) => sum + p, 0) / precisions.length
      : 0;
  }

  /**
   * Calculate Recall@K
   */
  calculateRecallAtK(k = 10, threshold = 4.0) {
    const users = [...new Set(this.testData.map(d => d.userId))];
    const recalls = [];

    users.forEach(userId => {
      // Get user's test items they liked
      const likedItems = new Set(
        this.testData
          .filter(d => d.userId === userId && d.rating >= threshold)
          .map(d => d.theoremId)
      );

      if (likedItems.size === 0) return;

      // Get recommendations
      const recommendations = this.engine.recommend(userId, k, true);
      const recommendedItems = recommendations.map(r => r.theoremId);

      // Count hits
      const hits = recommendedItems.filter(item => likedItems.has(item)).length;
      recalls.push(hits / likedItems.size);
    });

    return recalls.length > 0
      ? recalls.reduce((sum, r) => sum + r, 0) / recalls.length
      : 0;
  }

  /**
   * Calculate F1@K
   */
  calculateF1AtK(k = 10, threshold = 4.0) {
    const precision = this.calculatePrecisionAtK(k, threshold);
    const recall = this.calculateRecallAtK(k, threshold);

    if (precision + recall === 0) return 0;
    return 2 * (precision * recall) / (precision + recall);
  }

  /**
   * Calculate NDCG@K (Normalized Discounted Cumulative Gain)
   */
  calculateNDCGAtK(k = 10) {
    const users = [...new Set(this.testData.map(d => d.userId))];
    const ndcgs = [];

    users.forEach(userId => {
      // Get user's test items with ratings
      const testRatings = new Map(
        this.testData
          .filter(d => d.userId === userId)
          .map(d => [d.theoremId, d.rating])
      );

      if (testRatings.size === 0) return;

      // Get recommendations
      const recommendations = this.engine.recommend(userId, k, true);

      // Calculate DCG
      let dcg = 0;
      recommendations.forEach((rec, idx) => {
        const relevance = testRatings.get(rec.theoremId) || 0;
        dcg += relevance / Math.log2(idx + 2); // idx+2 because log2(1)=0
      });

      // Calculate ideal DCG
      const sortedRatings = Array.from(testRatings.values())
        .sort((a, b) => b - a)
        .slice(0, k);

      let idcg = 0;
      sortedRatings.forEach((rating, idx) => {
        idcg += rating / Math.log2(idx + 2);
      });

      if (idcg > 0) {
        ndcgs.push(dcg / idcg);
      }
    });

    return ndcgs.length > 0
      ? ndcgs.reduce((sum, n) => sum + n, 0) / ndcgs.length
      : 0;
  }

  /**
   * Calculate catalog coverage
   */
  calculateCoverage(k = 10) {
    const users = [...new Set(this.allInteractions.map(d => d.userId))];
    const recommendedItems = new Set();
    const allItems = new Set(this.allInteractions.map(d => d.theoremId));

    users.forEach(userId => {
      const recommendations = this.engine.recommend(userId, k, true);
      recommendations.forEach(rec => recommendedItems.add(rec.theoremId));
    });

    return recommendedItems.size / allItems.size;
  }

  /**
   * Calculate diversity (average pairwise dissimilarity)
   */
  calculateDiversity(k = 10) {
    const users = [...new Set(this.allInteractions.map(d => d.userId))].slice(0, 20); // Sample
    const diversities = [];

    users.forEach(userId => {
      const recommendations = this.engine.recommend(userId, k, true);

      if (recommendations.length < 2) return;

      let sumDissimilarity = 0;
      let count = 0;

      for (let i = 0; i < recommendations.length; i++) {
        for (let j = i + 1; j < recommendations.length; j++) {
          const item1 = recommendations[i].theoremId;
          const item2 = recommendations[j].theoremId;

          const similarTheorems = this.engine.findSimilarTheorems(item1, k);
          const similarity = similarTheorems.find(s => s.theoremId === item2)?.similarity || 0;

          sumDissimilarity += (1 - similarity);
          count++;
        }
      }

      if (count > 0) {
        diversities.push(sumDissimilarity / count);
      }
    });

    return diversities.length > 0
      ? diversities.reduce((sum, d) => sum + d, 0) / diversities.length
      : 0;
  }

  /**
   * Analyze cold start problem
   */
  analyzeColdStart() {
    // Group users by number of interactions
    const userInteractionCounts = new Map();

    this.allInteractions.forEach(({ userId }) => {
      userInteractionCounts.set(userId, (userInteractionCounts.get(userId) || 0) + 1);
    });

    const coldStartThreshold = 5;
    const warmStartThreshold = 20;

    const coldUsers = [];
    const warmUsers = [];
    const activeUsers = [];

    userInteractionCounts.forEach((count, userId) => {
      if (count < coldStartThreshold) {
        coldUsers.push(userId);
      } else if (count < warmStartThreshold) {
        warmUsers.push(userId);
      } else {
        activeUsers.push(userId);
      }
    });

    // Calculate metrics for each group
    const calculateGroupMetrics = (userList) => {
      const groupTest = this.testData.filter(d => userList.includes(d.userId));
      if (groupTest.length === 0) return null;

      let sumSquaredError = 0;
      groupTest.forEach(({ userId, theoremId, rating }) => {
        const predicted = this.engine.predict(userId, theoremId);
        const error = rating - predicted;
        sumSquaredError += error * error;
      });

      return {
        count: userList.length,
        testSize: groupTest.length,
        rmse: Math.sqrt(sumSquaredError / groupTest.length)
      };
    };

    return {
      cold: calculateGroupMetrics(coldUsers),
      warm: calculateGroupMetrics(warmUsers),
      active: calculateGroupMetrics(activeUsers)
    };
  }

  /**
   * Run complete evaluation
   */
  runCompleteEvaluation() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Collaborative Filtering Model Evaluation');
    console.log('═══════════════════════════════════════════════════════\n');

    // Prediction accuracy metrics
    console.log('1. Prediction Accuracy Metrics:');
    const rmse = this.calculateRMSE();
    const mae = this.calculateMAE();
    const r2 = this.calculateR2();

    console.log(`   RMSE (Root Mean Squared Error):  ${rmse.toFixed(4)}`);
    console.log(`   MAE (Mean Absolute Error):       ${mae.toFixed(4)}`);
    console.log(`   R² (Coefficient of Determination): ${r2.toFixed(4)}`);
    console.log('');

    // Ranking metrics
    console.log('2. Ranking Metrics:');
    const precisionAt5 = this.calculatePrecisionAtK(5);
    const precisionAt10 = this.calculatePrecisionAtK(10);
    const recallAt5 = this.calculateRecallAtK(5);
    const recallAt10 = this.calculateRecallAtK(10);
    const f1At5 = this.calculateF1AtK(5);
    const f1At10 = this.calculateF1AtK(10);
    const ndcgAt5 = this.calculateNDCGAtK(5);
    const ndcgAt10 = this.calculateNDCGAtK(10);

    console.log(`   Precision@5:  ${precisionAt5.toFixed(4)}`);
    console.log(`   Precision@10: ${precisionAt10.toFixed(4)}`);
    console.log(`   Recall@5:     ${recallAt5.toFixed(4)}`);
    console.log(`   Recall@10:    ${recallAt10.toFixed(4)}`);
    console.log(`   F1@5:         ${f1At5.toFixed(4)}`);
    console.log(`   F1@10:        ${f1At10.toFixed(4)}`);
    console.log(`   NDCG@5:       ${ndcgAt5.toFixed(4)}`);
    console.log(`   NDCG@10:      ${ndcgAt10.toFixed(4)}`);
    console.log('');

    // Coverage and diversity
    console.log('3. Coverage and Diversity:');
    const coverage = this.calculateCoverage(10);
    const diversity = this.calculateDiversity(10);

    console.log(`   Catalog Coverage:     ${(coverage * 100).toFixed(2)}%`);
    console.log(`   Recommendation Diversity: ${diversity.toFixed(4)}`);
    console.log('');

    // Cold start analysis
    console.log('4. Cold Start Analysis:');
    const coldStartAnalysis = this.analyzeColdStart();

    if (coldStartAnalysis.cold) {
      console.log(`   Cold Users (<5 interactions):`);
      console.log(`     Count: ${coldStartAnalysis.cold.count}`);
      console.log(`     RMSE: ${coldStartAnalysis.cold.rmse.toFixed(4)}`);
    }

    if (coldStartAnalysis.warm) {
      console.log(`   Warm Users (5-20 interactions):`);
      console.log(`     Count: ${coldStartAnalysis.warm.count}`);
      console.log(`     RMSE: ${coldStartAnalysis.warm.rmse.toFixed(4)}`);
    }

    if (coldStartAnalysis.active) {
      console.log(`   Active Users (>20 interactions):`);
      console.log(`     Count: ${coldStartAnalysis.active.count}`);
      console.log(`     RMSE: ${coldStartAnalysis.active.rmse.toFixed(4)}`);
    }

    console.log('\n═══════════════════════════════════════════════════════');

    return {
      accuracy: { rmse, mae, r2 },
      ranking: {
        precision: { at5: precisionAt5, at10: precisionAt10 },
        recall: { at5: recallAt5, at10: recallAt10 },
        f1: { at5: f1At5, at10: f1At10 },
        ndcg: { at5: ndcgAt5, at10: ndcgAt10 }
      },
      coverage: { catalog: coverage },
      diversity: { average: diversity },
      coldStart: coldStartAnalysis
    };
  }
}

/**
 * Compare different model configurations
 */
async function compareConfigurations() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Configuration Comparison');
  console.log('═══════════════════════════════════════════════════════\n');

  // Generate data once
  const data = generateSimulatedData({
    numUsers: 100,
    numTheorems: 50,
    sparsity: 0.15
  });

  const { train, test } = trainTestSplit(data.interactions, 0.2);

  const configurations = [
    {
      name: 'User-Based Only',
      config: {
        latentFactors: 10,
        iterations: 50,
        hybridWeights: { userBased: 1.0, itemBased: 0.0, matrixFactor: 0.0 }
      }
    },
    {
      name: 'Item-Based Only',
      config: {
        latentFactors: 10,
        iterations: 50,
        hybridWeights: { userBased: 0.0, itemBased: 1.0, matrixFactor: 0.0 }
      }
    },
    {
      name: 'Matrix Factorization Only',
      config: {
        latentFactors: 15,
        iterations: 100,
        hybridWeights: { userBased: 0.0, itemBased: 0.0, matrixFactor: 1.0 }
      }
    },
    {
      name: 'Hybrid (Balanced)',
      config: {
        latentFactors: 15,
        iterations: 100,
        hybridWeights: { userBased: 0.33, itemBased: 0.33, matrixFactor: 0.34 }
      }
    },
    {
      name: 'Hybrid (MF-Heavy)',
      config: {
        latentFactors: 20,
        iterations: 100,
        hybridWeights: { userBased: 0.2, itemBased: 0.3, matrixFactor: 0.5 }
      }
    }
  ];

  const results = [];

  for (const { name, config } of configurations) {
    console.log(`\nTraining: ${name}`);
    console.log('─'.repeat(50));

    const engine = new CollaborativeFilteringEngine(config);
    engine.train(train);

    const evaluator = new RecommenderEvaluator(engine, test, data.interactions);

    const rmse = evaluator.calculateRMSE();
    const mae = evaluator.calculateMAE();
    const precision = evaluator.calculatePrecisionAtK(10);
    const ndcg = evaluator.calculateNDCGAtK(10);
    const coverage = evaluator.calculateCoverage(10);

    console.log(`  RMSE: ${rmse.toFixed(4)}`);
    console.log(`  MAE: ${mae.toFixed(4)}`);
    console.log(`  Precision@10: ${precision.toFixed(4)}`);
    console.log(`  NDCG@10: ${ndcg.toFixed(4)}`);
    console.log(`  Coverage: ${(coverage * 100).toFixed(2)}%`);

    results.push({
      name,
      metrics: { rmse, mae, precision, ndcg, coverage }
    });
  }

  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  Configuration Comparison Summary');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('Configuration             | RMSE   | MAE    | P@10   | NDCG@10 | Coverage');
  console.log('─'.repeat(80));

  results.forEach(({ name, metrics }) => {
    const namePadded = name.padEnd(24);
    console.log(
      `${namePadded} | ${metrics.rmse.toFixed(4)} | ${metrics.mae.toFixed(4)} | ` +
      `${metrics.precision.toFixed(4)} | ${metrics.ndcg.toFixed(4)}  | ${(metrics.coverage * 100).toFixed(1)}%`
    );
  });

  console.log('\n');

  return results;
}

/**
 * Main evaluation function
 */
async function main() {
  // Load or train model
  const modelPath = path.join(__dirname, 'model.json');
  const dataPath = path.join(__dirname, 'training_data.json');

  let engine;
  let trainingData;

  if (fs.existsSync(modelPath) && fs.existsSync(dataPath)) {
    console.log('Loading saved model...\n');

    const savedModel = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    trainingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    engine = new CollaborativeFilteringEngine();
    engine.importModel(savedModel);
  } else {
    console.log('No saved model found. Training new model...\n');

    const data = generateSimulatedData({
      numUsers: 100,
      numTheorems: 50,
      sparsity: 0.15
    });

    trainingData = data;

    const { train, test } = trainTestSplit(data.interactions, 0.2);

    engine = new CollaborativeFilteringEngine({
      latentFactors: 15,
      iterations: 100,
      hybridWeights: { userBased: 0.3, itemBased: 0.3, matrixFactor: 0.4 }
    });

    engine.train(train);
    trainingData.testData = test;
  }

  // Run evaluation
  const { train, test } = trainTestSplit(trainingData.interactions, 0.2);
  const evaluator = new RecommenderEvaluator(engine, test, trainingData.interactions);
  const results = evaluator.runCompleteEvaluation();

  // Save evaluation results
  const resultsPath = path.join(__dirname, 'evaluation_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nEvaluation results saved to: ${resultsPath}`);

  // Run configuration comparison
  console.log('\n\n');
  await compareConfigurations();

  return results;
}

// Run if called directly
const isMainModule = () => {
  try {
    return process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
  } catch {
    return false;
  }
};

if (isMainModule()) {
  main().catch(console.error);
}

export { main, RecommenderEvaluator, compareConfigurations };
