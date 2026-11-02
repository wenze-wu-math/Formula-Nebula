/**
 * ═══════════════════════════════════════════════════════════════
 *  Collaborative Filtering Recommendation Engine
 * ═══════════════════════════════════════════════════════════════
 *
 * Implements hybrid recommendation system combining:
 * - User-based collaborative filtering
 * - Item (theorem) based collaborative filtering
 * - Matrix factorization (SVD)
 * - Content-based features
 */

/**
 * Matrix utilities
 */
class Matrix {
  constructor(rows, cols, data = null) {
    this.rows = rows;
    this.cols = cols;
    if (data) {
      this.data = data;
    } else {
      this.data = [];
      for (let i = 0; i < rows; i++) {
        this.data[i] = new Array(cols).fill(0);
      }
    }
  }

  get(i, j) {
    return this.data[i][j];
  }

  set(i, j, value) {
    this.data[i][j] = value;
  }

  transpose() {
    const result = new Matrix(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.set(j, i, this.get(i, j));
      }
    }
    return result;
  }

  multiply(other) {
    if (this.cols !== other.rows) {
      throw new Error('Matrix dimensions do not match for multiplication');
    }
    const result = new Matrix(this.rows, other.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.get(i, k) * other.get(k, j);
        }
        result.set(i, j, sum);
      }
    }
    return result;
  }

  scale(scalar) {
    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.set(i, j, this.get(i, j) * scalar);
      }
    }
    return result;
  }
}

/**
 * Collaborative Filtering Engine
 */
export class CollaborativeFilteringEngine {
  constructor(config = {}) {
    this.config = {
      latentFactors: config.latentFactors || 20,
      learningRate: config.learningRate || 0.01,
      regularization: config.regularization || 0.02,
      iterations: config.iterations || 100,
      minInteractions: config.minInteractions || 3,
      neighborhoodSize: config.neighborhoodSize || 10,
      hybridWeights: config.hybridWeights || {
        userBased: 0.3,
        itemBased: 0.3,
        matrixFactor: 0.4
      },
      ...config
    };

    // Model components
    this.userFactors = null;
    this.itemFactors = null;
    this.userBiases = null;
    this.itemBiases = null;
    this.globalMean = 0;

    // Lookup tables
    this.userIndex = new Map();
    this.itemIndex = new Map();
    this.interactions = [];

    // Similarity matrices
    this.userSimilarity = null;
    this.itemSimilarity = null;
  }

  /**
   * Build user-theorem interaction matrix from training data
   */
  buildInteractionMatrix(interactions) {
    this.interactions = interactions;

    // Build index mappings
    const users = new Set(interactions.map(i => i.userId));
    const items = new Set(interactions.map(i => i.theoremId));

    let userIdx = 0;
    users.forEach(user => {
      this.userIndex.set(user, userIdx);
      userIdx++;
    });

    let itemIdx = 0;
    items.forEach(item => {
      this.itemIndex.set(item, itemIdx);
      itemIdx++;
    });

    // Create interaction matrix
    const numUsers = this.userIndex.size;
    const numItems = this.itemIndex.size;
    const matrix = new Matrix(numUsers, numItems);

    interactions.forEach(({ userId, theoremId, rating }) => {
      const uIdx = this.userIndex.get(userId);
      const iIdx = this.itemIndex.get(theoremId);

      if (uIdx !== undefined && iIdx !== undefined) {
        matrix.set(uIdx, iIdx, rating);
      }
    });

    // Calculate global mean
    let sum = 0;
    let count = 0;
    for (let i = 0; i < numUsers; i++) {
      for (let j = 0; j < numItems; j++) {
        const val = matrix.get(i, j);
        if (val > 0) {
          sum += val;
          count++;
        }
      }
    }
    this.globalMean = count > 0 ? sum / count : 0;

    return matrix;
  }

  /**
   * Matrix Factorization using Stochastic Gradient Descent (SVD)
   */
  trainMatrixFactorization(matrix) {
    const numUsers = matrix.rows;
    const numItems = matrix.cols;
    const k = this.config.latentFactors;

    // Initialize factor matrices with small random values
    this.userFactors = new Matrix(numUsers, k);
    this.itemFactors = new Matrix(numItems, k);

    for (let i = 0; i < numUsers; i++) {
      for (let j = 0; j < k; j++) {
        this.userFactors.set(i, j, Math.random() * 0.01);
      }
    }

    for (let i = 0; i < numItems; i++) {
      for (let j = 0; j < k; j++) {
        this.itemFactors.set(i, j, Math.random() * 0.01);
      }
    }

    // Initialize biases
    this.userBiases = Array(numUsers).fill(0);
    this.itemBiases = Array(numItems).fill(0);

    // SGD iterations
    const lr = this.config.learningRate;
    const reg = this.config.regularization;

    for (let iter = 0; iter < this.config.iterations; iter++) {
      let totalError = 0;
      let count = 0;

      // Iterate over all known ratings
      for (let u = 0; u < numUsers; u++) {
        for (let i = 0; i < numItems; i++) {
          const actual = matrix.get(u, i);
          if (actual === 0) continue; // Skip missing values

          // Compute prediction
          let predicted = this.globalMean + this.userBiases[u] + this.itemBiases[i];
          for (let f = 0; f < k; f++) {
            predicted += this.userFactors.get(u, f) * this.itemFactors.get(i, f);
          }

          // Compute error
          const error = actual - predicted;
          totalError += error * error;
          count++;

          // Update biases
          this.userBiases[u] += lr * (error - reg * this.userBiases[u]);
          this.itemBiases[i] += lr * (error - reg * this.itemBiases[i]);

          // Update factors
          for (let f = 0; f < k; f++) {
            const userFactor = this.userFactors.get(u, f);
            const itemFactor = this.itemFactors.get(i, f);

            this.userFactors.set(u, f,
              userFactor + lr * (error * itemFactor - reg * userFactor));
            this.itemFactors.set(i, f,
              itemFactor + lr * (error * userFactor - reg * itemFactor));
          }
        }
      }

      const rmse = Math.sqrt(totalError / count);
      if (iter % 10 === 0) {
        console.log(`Iteration ${iter}: RMSE = ${rmse.toFixed(4)}`);
      }
    }
  }

  /**
   * Compute cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Compute user similarity matrix
   */
  computeUserSimilarity(matrix) {
    const numUsers = matrix.rows;
    this.userSimilarity = new Matrix(numUsers, numUsers);

    for (let i = 0; i < numUsers; i++) {
      for (let j = i; j < numUsers; j++) {
        if (i === j) {
          this.userSimilarity.set(i, j, 1.0);
          continue;
        }

        const vec1 = [];
        const vec2 = [];

        for (let k = 0; k < matrix.cols; k++) {
          const v1 = matrix.get(i, k);
          const v2 = matrix.get(j, k);
          if (v1 > 0 && v2 > 0) {
            vec1.push(v1);
            vec2.push(v2);
          }
        }

        const sim = vec1.length >= this.config.minInteractions
          ? this.cosineSimilarity(vec1, vec2)
          : 0;

        this.userSimilarity.set(i, j, sim);
        this.userSimilarity.set(j, i, sim);
      }
    }
  }

  /**
   * Compute item (theorem) similarity matrix
   */
  computeItemSimilarity(matrix) {
    const numItems = matrix.cols;
    this.itemSimilarity = new Matrix(numItems, numItems);

    for (let i = 0; i < numItems; i++) {
      for (let j = i; j < numItems; j++) {
        if (i === j) {
          this.itemSimilarity.set(i, j, 1.0);
          continue;
        }

        const vec1 = [];
        const vec2 = [];

        for (let k = 0; k < matrix.rows; k++) {
          const v1 = matrix.get(k, i);
          const v2 = matrix.get(k, j);
          if (v1 > 0 && v2 > 0) {
            vec1.push(v1);
            vec2.push(v2);
          }
        }

        const sim = vec1.length >= this.config.minInteractions
          ? this.cosineSimilarity(vec1, vec2)
          : 0;

        this.itemSimilarity.set(i, j, sim);
        this.itemSimilarity.set(j, i, sim);
      }
    }
  }

  /**
   * Train the complete model
   */
  train(interactions) {
    console.log('Building interaction matrix...');
    const matrix = this.buildInteractionMatrix(interactions);

    console.log('Training matrix factorization...');
    this.trainMatrixFactorization(matrix);

    console.log('Computing user similarity...');
    this.computeUserSimilarity(matrix);

    console.log('Computing item similarity...');
    this.computeItemSimilarity(matrix);

    console.log('Training complete!');
  }

  /**
   * User-based collaborative filtering prediction
   */
  predictUserBased(userId, theoremId) {
    const userIdx = this.userIndex.get(userId);
    const itemIdx = this.itemIndex.get(theoremId);

    if (userIdx === undefined || itemIdx === undefined) {
      return this.globalMean;
    }

    // Find similar users who have rated this theorem
    const similarities = [];
    const ratings = [];

    for (const [otherUserId, otherUserIdx] of this.userIndex.entries()) {
      if (otherUserId === userId) continue;

      const sim = this.userSimilarity.get(userIdx, otherUserIdx);
      if (sim <= 0) continue;

      // Check if other user has rated this item
      const rating = this.interactions.find(
        i => i.userId === otherUserId && i.theoremId === theoremId
      )?.rating;

      if (rating) {
        similarities.push(sim);
        ratings.push(rating);
      }
    }

    // Take top-k neighbors
    const k = Math.min(this.config.neighborhoodSize, similarities.length);
    const indices = similarities
      .map((sim, idx) => ({ sim, idx }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, k);

    if (indices.length === 0) {
      return this.globalMean;
    }

    let weightedSum = 0;
    let weightSum = 0;

    indices.forEach(({ sim, idx }) => {
      weightedSum += sim * ratings[idx];
      weightSum += sim;
    });

    return weightSum > 0 ? weightedSum / weightSum : this.globalMean;
  }

  /**
   * Item-based collaborative filtering prediction
   */
  predictItemBased(userId, theoremId) {
    const userIdx = this.userIndex.get(userId);
    const itemIdx = this.itemIndex.get(theoremId);

    if (userIdx === undefined || itemIdx === undefined) {
      return this.globalMean;
    }

    // Find similar theorems that this user has rated
    const similarities = [];
    const ratings = [];

    for (const [otherTheoremId, otherItemIdx] of this.itemIndex.entries()) {
      if (otherTheoremId === theoremId) continue;

      const sim = this.itemSimilarity.get(itemIdx, otherItemIdx);
      if (sim <= 0) continue;

      // Check if user has rated this other theorem
      const rating = this.interactions.find(
        i => i.userId === userId && i.theoremId === otherTheoremId
      )?.rating;

      if (rating) {
        similarities.push(sim);
        ratings.push(rating);
      }
    }

    // Take top-k neighbors
    const k = Math.min(this.config.neighborhoodSize, similarities.length);
    const indices = similarities
      .map((sim, idx) => ({ sim, idx }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, k);

    if (indices.length === 0) {
      return this.globalMean;
    }

    let weightedSum = 0;
    let weightSum = 0;

    indices.forEach(({ sim, idx }) => {
      weightedSum += sim * ratings[idx];
      weightSum += sim;
    });

    return weightSum > 0 ? weightedSum / weightSum : this.globalMean;
  }

  /**
   * Matrix factorization prediction
   */
  predictMatrixFactorization(userId, theoremId) {
    const userIdx = this.userIndex.get(userId);
    const itemIdx = this.itemIndex.get(theoremId);

    if (userIdx === undefined || itemIdx === undefined) {
      return this.globalMean;
    }

    let predicted = this.globalMean + this.userBiases[userIdx] + this.itemBiases[itemIdx];

    for (let f = 0; f < this.config.latentFactors; f++) {
      predicted += this.userFactors.get(userIdx, f) * this.itemFactors.get(itemIdx, f);
    }

    return predicted;
  }

  /**
   * Hybrid prediction combining all methods
   */
  predict(userId, theoremId) {
    const weights = this.config.hybridWeights;

    const userBasedPred = this.predictUserBased(userId, theoremId);
    const itemBasedPred = this.predictItemBased(userId, theoremId);
    const mfPred = this.predictMatrixFactorization(userId, theoremId);

    const hybridPred =
      weights.userBased * userBasedPred +
      weights.itemBased * itemBasedPred +
      weights.matrixFactor * mfPred;

    // Clamp to valid rating range
    return Math.max(0, Math.min(5, hybridPred));
  }

  /**
   * Recommend top-N theorems for a user
   */
  recommend(userId, n = 10, excludeInteracted = true) {
    const userIdx = this.userIndex.get(userId);
    if (userIdx === undefined) {
      return [];
    }

    // Get all theorems user hasn't interacted with (or all if not excluding)
    const interactedTheorems = new Set(
      this.interactions
        .filter(i => i.userId === userId)
        .map(i => i.theoremId)
    );

    const candidates = [];

    for (const [theoremId, itemIdx] of this.itemIndex.entries()) {
      if (excludeInteracted && interactedTheorems.has(theoremId)) {
        continue;
      }

      const score = this.predict(userId, theoremId);
      candidates.push({ theoremId, score });
    }

    // Sort by score and return top-N
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, n);
  }

  /**
   * Find similar theorems to a given theorem
   */
  findSimilarTheorems(theoremId, n = 10) {
    const itemIdx = this.itemIndex.get(theoremId);
    if (itemIdx === undefined) {
      return [];
    }

    const similarities = [];

    for (const [otherTheoremId, otherItemIdx] of this.itemIndex.entries()) {
      if (otherTheoremId === theoremId) continue;

      const sim = this.itemSimilarity.get(itemIdx, otherItemIdx);
      similarities.push({ theoremId: otherTheoremId, similarity: sim });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, n);
  }

  /**
   * Find similar users to a given user
   */
  findSimilarUsers(userId, n = 10) {
    const userIdx = this.userIndex.get(userId);
    if (userIdx === undefined) {
      return [];
    }

    const similarities = [];

    for (const [otherUserId, otherUserIdx] of this.userIndex.entries()) {
      if (otherUserId === userId) continue;

      const sim = this.userSimilarity.get(userIdx, otherUserIdx);
      similarities.push({ userId: otherUserId, similarity: sim });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, n);
  }

  /**
   * Export model for persistence
   */
  exportModel() {
    return {
      config: this.config,
      userFactors: this.userFactors.data,
      itemFactors: this.itemFactors.data,
      userBiases: this.userBiases,
      itemBiases: this.itemBiases,
      globalMean: this.globalMean,
      userIndex: Array.from(this.userIndex.entries()),
      itemIndex: Array.from(this.itemIndex.entries()),
      userSimilarity: this.userSimilarity.data,
      itemSimilarity: this.itemSimilarity.data
    };
  }

  /**
   * Import model from saved state
   */
  importModel(saved) {
    this.config = saved.config;
    this.userFactors = new Matrix(saved.userFactors.length, saved.userFactors[0].length, saved.userFactors);
    this.itemFactors = new Matrix(saved.itemFactors.length, saved.itemFactors[0].length, saved.itemFactors);
    this.userBiases = saved.userBiases;
    this.itemBiases = saved.itemBiases;
    this.globalMean = saved.globalMean;
    this.userIndex = new Map(saved.userIndex);
    this.itemIndex = new Map(saved.itemIndex);
    this.userSimilarity = new Matrix(saved.userSimilarity.length, saved.userSimilarity[0].length, saved.userSimilarity);
    this.itemSimilarity = new Matrix(saved.itemSimilarity.length, saved.itemSimilarity[0].length, saved.itemSimilarity);
  }
}
