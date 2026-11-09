/**
 * ═══════════════════════════════════════════════════════════════
 *  Training Script for Collaborative Filtering Model
 * ═══════════════════════════════════════════════════════════════
 *
 * Generates simulated user-theorem interaction data and trains
 * the collaborative filtering recommendation model.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CollaborativeFilteringEngine } from './collaborative.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate simulated user-theorem interaction data
 */
function generateSimulatedData(config = {}) {
  const numUsers = config.numUsers || 100;
  const numTheorems = config.numTheorems || 50;
  const sparsity = config.sparsity || 0.1; // 10% of possible interactions

  // Define theorem categories with different difficulty levels
  const theoremCategories = {
    foundation: ['zariski-topology', 'ideal-variety', 'hilbert-basis', 'nullstellensatz', 'noetherian-ring'],
    scheme: ['affine-scheme', 'proj-construction', 'sheaf-definition', 'ringed-space', 'scheme-morphism'],
    cohomology: ['sheaf-cohomology', 'cech-cohomology', 'derived-functor', 'ext-tor', 'spectral-sequence'],
    curve: ['riemann-roch', 'genus-formula', 'canonical-divisor', 'weierstrass', 'jacobian'],
    advanced: ['grothendieck-riemann-roch', 'serre-duality', 'hirzebruch-riemann-roch', 'atiyah-singer', 'mumford-tate']
  };

  const allTheorems = Object.values(theoremCategories).flat();
  const theoremDifficulty = {};

  // Assign difficulty scores
  Object.entries(theoremCategories).forEach(([_category, theorems], catIdx) => {
    theorems.forEach(theorem => {
      theoremDifficulty[theorem] = (catIdx + 1) * 2; // 2-10 difficulty
    });
  });

  // Define user personas with different skill levels and interests
  const userPersonas = [
    { level: 'beginner', interests: ['foundation'], activityLevel: 0.7 },
    { level: 'intermediate', interests: ['foundation', 'scheme'], activityLevel: 0.6 },
    { level: 'advanced', interests: ['scheme', 'cohomology', 'curve'], activityLevel: 0.5 },
    { level: 'expert', interests: ['cohomology', 'curve', 'advanced'], activityLevel: 0.4 }
  ];

  const interactions = [];
  const users = [];

  // Generate users
  for (let i = 0; i < numUsers; i++) {
    const persona = userPersonas[Math.floor(Math.random() * userPersonas.length)];
    users.push({
      userId: `user_${i}`,
      level: persona.level,
      interests: persona.interests,
      activityLevel: persona.activityLevel
    });
  }

  // Generate interactions
  users.forEach(user => {
    const { userId, level, interests, activityLevel } = user;

    // Determine how many theorems this user interacts with
    const numInteractions = Math.floor(
      allTheorems.length * sparsity * activityLevel * (0.5 + Math.random())
    );

    // Select theorems based on user's interests
    const relevantTheorems = interests.flatMap(interest => theoremCategories[interest]);
    const selectedTheorems = new Set();

    // Add relevant theorems
    for (let i = 0; i < numInteractions * 0.7 && i < relevantTheorems.length; i++) {
      const theorem = relevantTheorems[Math.floor(Math.random() * relevantTheorems.length)];
      selectedTheorems.add(theorem);
    }

    // Add some random exploration
    while (selectedTheorems.size < numInteractions) {
      const theorem = allTheorems[Math.floor(Math.random() * allTheorems.length)];
      selectedTheorems.add(theorem);
    }

    // Generate ratings based on user level and theorem difficulty
    const userSkillLevel = userPersonas.findIndex(p => p.level === level) + 1;

    selectedTheorems.forEach(theoremId => {
      const difficulty = theoremDifficulty[theoremId] || 5;

      // Base rating: higher if theorem matches skill level
      let baseRating = 3.0;
      const skillMatch = Math.abs(userSkillLevel * 2 - difficulty);

      if (skillMatch <= 2) {
        baseRating = 4.5; // Good match
      } else if (skillMatch <= 4) {
        baseRating = 3.5; // Okay match
      } else if (skillMatch > 6) {
        baseRating = 2.0; // Poor match
      }

      // Add noise
      const noise = (Math.random() - 0.5) * 1.5;
      const rating = Math.max(1, Math.min(5, baseRating + noise));

      // Add interest boost
      const isInterested = interests.some(interest =>
        theoremCategories[interest].includes(theoremId)
      );

      const finalRating = isInterested
        ? Math.min(5, rating + 0.5)
        : rating;

      interactions.push({
        userId,
        theoremId,
        rating: Math.round(finalRating * 10) / 10, // Round to 1 decimal
        timestamp: Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000) // Random time in past year
      });
    });
  });

  return {
    interactions,
    users,
    theorems: allTheorems.map(id => ({
      theoremId: id,
      difficulty: theoremDifficulty[id] || 5,
      category: Object.keys(theoremCategories).find(cat =>
        theoremCategories[cat].includes(id)
      )
    }))
  };
}

/**
 * Split data into train and test sets
 */
function trainTestSplit(interactions, testRatio = 0.2) {
  const shuffled = [...interactions].sort(() => Math.random() - 0.5);
  const splitIdx = Math.floor(shuffled.length * (1 - testRatio));

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx)
  };
}

/**
 * Main training function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Collaborative Filtering Training');
  console.log('═══════════════════════════════════════════════════════\n');

  // Generate simulated data
  console.log('Step 1: Generating simulated user-theorem interaction data...');
  const data = generateSimulatedData({
    numUsers: 100,
    numTheorems: 50,
    sparsity: 0.15
  });

  console.log(`Generated:`);
  console.log(`  - ${data.users.length} users`);
  console.log(`  - ${data.theorems.length} theorems`);
  console.log(`  - ${data.interactions.length} interactions`);
  console.log(`  - Sparsity: ${(data.interactions.length / (data.users.length * data.theorems.length) * 100).toFixed(2)}%\n`);

  // Split into train/test
  console.log('Step 2: Splitting data into train/test sets...');
  const { train, test } = trainTestSplit(data.interactions, 0.2);
  console.log(`  - Train: ${train.length} interactions`);
  console.log(`  - Test: ${test.length} interactions\n`);

  // Train model
  console.log('Step 3: Training collaborative filtering model...');
  const engine = new CollaborativeFilteringEngine({
    latentFactors: 15,
    learningRate: 0.01,
    regularization: 0.02,
    iterations: 100,
    minInteractions: 3,
    neighborhoodSize: 10,
    hybridWeights: {
      userBased: 0.3,
      itemBased: 0.3,
      matrixFactor: 0.4
    }
  });

  engine.train(train);
  console.log('\n');

  // Test predictions
  console.log('Step 4: Testing model predictions...');
  let totalError = 0;
  let absoluteError = 0;
  let count = 0;

  test.forEach(({ userId, theoremId, rating }) => {
    const predicted = engine.predict(userId, theoremId);
    const error = rating - predicted;

    totalError += error * error;
    absoluteError += Math.abs(error);
    count++;

    if (count <= 5) {
      console.log(`  User: ${userId}, Theorem: ${theoremId}`);
      console.log(`    Actual: ${rating.toFixed(2)}, Predicted: ${predicted.toFixed(2)}, Error: ${error.toFixed(2)}`);
    }
  });

  const rmse = Math.sqrt(totalError / count);
  const mae = absoluteError / count;

  console.log('\nTest Set Performance:');
  console.log(`  RMSE: ${rmse.toFixed(4)}`);
  console.log(`  MAE:  ${mae.toFixed(4)}\n`);

  // Generate sample recommendations
  console.log('Step 5: Generating sample recommendations...');
  const sampleUsers = data.users.slice(0, 3);

  sampleUsers.forEach(user => {
    const recommendations = engine.recommend(user.userId, 5);
    console.log(`\nUser: ${user.userId} (${user.level}, interests: ${user.interests.join(', ')})`);
    console.log('Top 5 Recommendations:');
    recommendations.forEach((rec, idx) => {
      const theoremInfo = data.theorems.find(t => t.theoremId === rec.theoremId);
      console.log(`  ${idx + 1}. ${rec.theoremId} (${theoremInfo?.category || 'unknown'}) - Score: ${rec.score.toFixed(3)}`);
    });
  });

  // Save model
  console.log('\n\nStep 6: Saving trained model...');
  const modelPath = path.join(__dirname, 'model.json');
  const dataPath = path.join(__dirname, 'training_data.json');

  fs.writeFileSync(modelPath, JSON.stringify(engine.exportModel(), null, 2));
  fs.writeFileSync(dataPath, JSON.stringify({
    users: data.users,
    theorems: data.theorems,
    interactions: data.interactions,
    trainSize: train.length,
    testSize: test.length,
    metrics: { rmse, mae }
  }, null, 2));

  console.log(`Model saved to: ${modelPath}`);
  console.log(`Training data saved to: ${dataPath}`);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Training Complete!');
  console.log('═══════════════════════════════════════════════════════');

  return {
    model: engine.exportModel(),
    metrics: { rmse, mae },
    data: {
      users: data.users,
      theorems: data.theorems,
      trainSize: train.length,
      testSize: test.length
    }
  };
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

export { main, generateSimulatedData, trainTestSplit };
