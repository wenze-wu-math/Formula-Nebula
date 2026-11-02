# Theorem Recommendation System using Collaborative Filtering

## Overview

This module implements a **hybrid collaborative filtering** recommendation system for mathematical theorems, designed to provide personalized theorem recommendations based on user interactions and preferences.

## Architecture

### 1. Core Components

#### CollaborativeFilteringEngine (`collaborative.js`)
The main recommendation engine implementing three complementary approaches:

1. **User-Based Collaborative Filtering**
   - Finds similar users based on their interaction patterns
   - Recommends theorems liked by similar users
   - Uses cosine similarity for user matching

2. **Item-Based Collaborative Filtering**
   - Finds similar theorems based on user co-interactions
   - Recommends theorems similar to ones the user liked
   - Uses cosine similarity for theorem matching

3. **Matrix Factorization (SVD)**
   - Decomposes user-theorem interaction matrix into latent factors
   - Learns hidden features representing user preferences and theorem characteristics
   - Uses Stochastic Gradient Descent (SGD) for optimization
   - Includes user and item biases for better accuracy

4. **Hybrid Recommendation**
   - Combines all three methods with configurable weights
   - Default: 30% user-based, 30% item-based, 40% matrix factorization
   - Provides more robust and accurate recommendations

### 2. Key Features

#### User-Theorem Interaction Matrix
- Sparse matrix representation of user ratings
- Efficient indexing using Maps for fast lookups
- Handles missing values (unrated theorems)

#### Similarity Computation
- Cosine similarity for both users and theorems
- Minimum interaction threshold to ensure reliable similarities
- Pre-computed similarity matrices for fast recommendation generation

#### Hybrid Prediction
- Weighted combination of multiple prediction methods
- Rating normalization and clamping to valid range [0, 5]
- Handles cold start scenarios with global mean fallback

## Training Pipeline

### Training Script (`train.mjs`)

#### Data Generation
Simulates realistic user-theorem interactions with:
- **User Personas**: beginner, intermediate, advanced, expert
- **Theorem Categories**: foundation, scheme, cohomology, curve, advanced
- **Difficulty Matching**: ratings based on skill-difficulty alignment
- **Interest Boost**: higher ratings for theorems in user's interest areas
- **Configurable Sparsity**: realistic sparse interaction patterns

#### Training Process
1. Generate simulated user-theorem interaction data
2. Split data into train (80%) and test (20%) sets
3. Build user-theorem interaction matrix
4. Train matrix factorization model using SGD
5. Compute user and theorem similarity matrices
6. Validate on test set
7. Save trained model and metadata

#### Example Output
```
Generated:
  - 100 users
  - 25 theorems
  - 158 interactions
  - Sparsity: 6.32%

Test Set Performance:
  RMSE: 0.3063
  MAE:  0.2661
```

## Evaluation Framework

### Evaluation Script (`evaluate.mjs`)

#### Prediction Accuracy Metrics

**RMSE (Root Mean Squared Error)**
- Measures prediction error magnitude
- Lower is better (0 = perfect predictions)
- Typical range: 0.2-0.5 for this domain

**MAE (Mean Absolute Error)**
- Average absolute prediction error
- More interpretable than RMSE
- Typical range: 0.2-0.4

**R² (Coefficient of Determination)**
- Explains variance in ratings
- Range: -∞ to 1 (1 = perfect fit)
- Negative values indicate poor fit

#### Ranking Metrics

**Precision@K**
- Fraction of recommended theorems that user actually likes
- Measures recommendation accuracy
- Formula: (# relevant items in top K) / K

**Recall@K**
- Fraction of user's liked theorems that appear in recommendations
- Measures coverage of relevant items
- Formula: (# relevant items in top K) / (total relevant items)

**F1@K**
- Harmonic mean of Precision and Recall
- Balances both metrics
- Formula: 2 × (Precision × Recall) / (Precision + Recall)

**NDCG@K (Normalized Discounted Cumulative Gain)**
- Considers ranking order and rating magnitudes
- Discounts lower-ranked items
- Range: 0-1 (1 = perfect ranking)

#### Coverage and Diversity

**Catalog Coverage**
- Percentage of all theorems that get recommended
- Measures recommendation diversity
- Higher is better for discovery

**Recommendation Diversity**
- Average pairwise dissimilarity of recommendations
- Prevents filter bubbles
- Range: 0-1 (1 = maximum diversity)

#### Cold Start Analysis
Groups users by interaction count:
- **Cold**: <5 interactions
- **Warm**: 5-20 interactions
- **Active**: >20 interactions

Analyzes model performance for each group to identify cold start issues.

### Configuration Comparison

The evaluation script compares five configurations:

1. **User-Based Only**: Pure user similarity approach
2. **Item-Based Only**: Pure theorem similarity approach
3. **Matrix Factorization Only**: Pure latent factor approach
4. **Hybrid (Balanced)**: Equal weights for all methods
5. **Hybrid (MF-Heavy)**: Emphasizes matrix factorization

## Performance Results

### Best Configuration: Hybrid (Balanced)

```
Prediction Accuracy:
  RMSE: 0.7430
  MAE:  0.3685

Ranking Metrics:
  Precision@10: 0.0480
  NDCG@10:      0.2434

Coverage & Diversity:
  Catalog Coverage: 58.3%
  Diversity:        1.0000
```

### Key Findings

1. **Hybrid approaches outperform single-method approaches**
   - Better NDCG scores indicate improved ranking quality
   - Balanced weights provide best overall performance

2. **Matrix factorization provides best coverage**
   - MF-only and MF-heavy configs achieve 66.7% coverage
   - Discovers theorems that might not have similar users/items

3. **Trade-offs between accuracy and diversity**
   - User/item-based methods have lower RMSE for known interactions
   - Matrix factorization better generalizes to unseen theorems

4. **Cold start challenge**
   - Most users (99%) have <5 interactions
   - Model maintains reasonable RMSE (0.267) even for cold users
   - Hybrid approach helps mitigate cold start through multiple signals

## Usage

### Training a Model

```javascript
import { main as train } from './train.mjs';

// Train with default configuration
const results = await train();

// Access trained model and metrics
console.log(`RMSE: ${results.metrics.rmse}`);
console.log(`MAE: ${results.metrics.mae}`);
```

### Loading and Using a Trained Model

```javascript
import { CollaborativeFilteringEngine } from './collaborative.js';
import fs from 'fs';

// Load saved model
const savedModel = JSON.parse(fs.readFileSync('./model.json', 'utf8'));
const engine = new CollaborativeFilteringEngine();
engine.importModel(savedModel);

// Get recommendations for a user
const recommendations = engine.recommend('user_123', 10);
console.log(recommendations);
// [
//   { theoremId: 'sheaf-definition', score: 4.879 },
//   { theoremId: 'jacobian', score: 4.873 },
//   ...
// ]

// Predict rating for a specific theorem
const predictedRating = engine.predict('user_123', 'riemann-roch');
console.log(`Predicted rating: ${predictedRating.toFixed(2)}`);

// Find similar theorems
const similar = engine.findSimilarTheorems('grothendieck-riemann-roch', 5);
console.log(similar);
// [
//   { theoremId: 'serre-duality', similarity: 0.85 },
//   { theoremId: 'hirzebruch-riemann-roch', similarity: 0.82 },
//   ...
// ]

// Find similar users
const similarUsers = engine.findSimilarUsers('user_123', 5);
console.log(similarUsers);
```

### Running Evaluation

```javascript
import { main as evaluate } from './evaluate.mjs';

// Run complete evaluation
const results = await evaluate();

// Results include:
// - accuracy: { rmse, mae, r2 }
// - ranking: { precision, recall, f1, ndcg }
// - coverage: { catalog }
// - diversity: { average }
// - coldStart: { cold, warm, active }
```

### Custom Configuration

```javascript
const engine = new CollaborativeFilteringEngine({
  latentFactors: 20,          // Number of latent features
  learningRate: 0.01,         // SGD learning rate
  regularization: 0.02,       // L2 regularization
  iterations: 100,            // Training iterations
  minInteractions: 3,         // Min for similarity
  neighborhoodSize: 10,       // K nearest neighbors
  hybridWeights: {
    userBased: 0.25,          // User-based weight
    itemBased: 0.25,          // Item-based weight
    matrixFactor: 0.50        // Matrix factorization weight
  }
});
```

## Model Persistence

### Exported Model Structure

```json
{
  "config": { ... },
  "userFactors": [[...]],      // User latent factors
  "itemFactors": [[...]],      // Theorem latent factors
  "userBiases": [...],         // User rating biases
  "itemBiases": [...],         // Theorem rating biases
  "globalMean": 3.5,           // Global average rating
  "userIndex": [...],          // User ID mappings
  "itemIndex": [...],          // Theorem ID mappings
  "userSimilarity": [[...]],   // User similarity matrix
  "itemSimilarity": [[...]]    // Theorem similarity matrix
}
```

### File Outputs

- **model.json**: Complete trained model (~128KB)
- **training_data.json**: Training dataset and metadata (~40KB)
- **evaluation_results.json**: Performance metrics (~1KB)

## Algorithm Details

### Matrix Factorization (SVD)

**Objective**: Minimize prediction error
```
min Σ (r_ui - r̂_ui)² + λ(||p_u||² + ||q_i||²)
```

Where:
- `r_ui`: actual rating of user u for theorem i
- `r̂_ui`: predicted rating
- `p_u`: user latent factors
- `q_i`: theorem latent factors
- `λ`: regularization parameter

**Prediction**:
```
r̂_ui = μ + b_u + b_i + p_u · q_i
```

Where:
- `μ`: global mean rating
- `b_u`: user bias
- `b_i`: theorem bias
- `p_u · q_i`: dot product of latent factors

### User-Based Collaborative Filtering

**Similarity**:
```
sim(u, v) = cos(R_u, R_v) = (R_u · R_v) / (||R_u|| ||R_v||)
```

**Prediction**:
```
r̂_ui = Σ(sim(u,v) × r_vi) / Σ|sim(u,v)|
```
(sum over k nearest neighbors who rated theorem i)

### Item-Based Collaborative Filtering

**Similarity**:
```
sim(i, j) = cos(R_i, R_j) = (R_i · R_j) / (||R_i|| ||R_j||)
```

**Prediction**:
```
r̂_ui = Σ(sim(i,j) × r_uj) / Σ|sim(i,j)|
```
(sum over k most similar theorems that user u rated)

### Hybrid Combination

```
r̂_ui = w_ub × r̂_ui^UB + w_ib × r̂_ui^IB + w_mf × r̂_ui^MF
```

Where:
- `w_ub`, `w_ib`, `w_mf`: weights for each method
- Sum of weights = 1.0

## Future Enhancements

### Short-term
1. **Content-based features**: Incorporate theorem metadata (difficulty, category, prerequisites)
2. **Implicit feedback**: Track view time, bookmarks, navigation patterns
3. **Temporal dynamics**: Model changing user preferences over time
4. **Deep learning**: Neural collaborative filtering for complex patterns

### Long-term
1. **Context-aware recommendations**: Consider learning path, current topic
2. **Multi-armed bandits**: Balance exploration vs exploitation
3. **Explanation generation**: Why this theorem was recommended
4. **Group recommendations**: For study groups or classes
5. **Transfer learning**: Leverage external theorem databases

## References

1. **Matrix Factorization**: Koren, Y., Bell, R., & Volinsky, C. (2009). Matrix Factorization Techniques for Recommender Systems.
2. **Collaborative Filtering**: Sarwar, B., et al. (2001). Item-based collaborative filtering recommendation algorithms.
3. **Hybrid Methods**: Burke, R. (2002). Hybrid Recommender Systems: Survey and Experiments.
4. **Evaluation Metrics**: Gunawardana, A., & Shani, G. (2015). Evaluating Recommender Systems.

## License

Part of the Formula Nebula project.
