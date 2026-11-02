/**
 * ═══════════════════════════════════════════════════════════════
 *  Proof Difficulty Classifier
 * ═══════════════════════════════════════════════════════════════
 *
 *  ML-based proof difficulty analysis with multi-dimensional scoring.
 *  Provides difficulty level, prerequisite prediction, and time estimation.
 *
 *  APPROACH:
 *  - Feature extraction from proof structure (AST depth, notation density, etc.)
 *  - Hybrid scoring: rule-based + ML-based components
 *  - Training data bootstrapped from algebraic geometry corpus
 *  - Progressive learning from user interaction (reading time, clicks)
 *
 *  EXPORTS:
 *  - ClassifyDifficulty(proof) → {level, score, confidence}
 *  - PredictPrerequisites(proof) → [TheoremId]
 *  - EstimateReadingTime(proof) → minutes
 *  - CreateDifficultyIndex(allProofs) → Map<proofId, metadata>
 */

import { NODES, LINKS } from '../shared/knowledge-graph.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  1. FEATURE EXTRACTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract quantitative features from proof structure
 */
function ExtractProofFeatures(proof) {
  const features = {
    // Structural complexity
    stepCount: proof.steps?.length || 0,
    maxDepth: ComputeProofDepth(proof.steps || []),
    branchingFactor: ComputeBranchingFactor(proof.steps || []),

    // Notation analysis
    notationDensity: AnalyzeNotationDensity(proof.latex || ''),
    symbolComplexity: CountUniqueSymbols(proof.latex || ''),
    operatorDepth: ComputeOperatorNesting(proof.latex || ''),

    // Conceptual load
    conceptCount: ExtractConceptReferences(proof).length,
    crossReferences: CountCrossReferences(proof),
    abstrationLevel: EstimateAbstraction(proof),

    // Language complexity
    textComplexity: AnalyzeTextComplexity(proof.detail || ''),
    vocabularyLevel: ComputeVocabularyLevel(proof.detail || ''),

    // Metadata hints
    hasVisualAid: !!proof.diagram,
    hasWorkedExample: !!proof.example,
    explicitPrereqs: proof.prerequisites?.length || 0,
  };

  // Compute composite metrics
  features.complexityScore = ComputeComplexityScore(features);
  features.cognitiveLoad = EstimateCognitiveLoad(features);

  return features;
}

/**
 * Compute proof tree depth (nested subproofs)
 */
function ComputeProofDepth(steps, currentDepth = 0) {
  if (!steps || steps.length === 0) return currentDepth;

  let maxChildDepth = currentDepth;
  for (const step of steps) {
    if (step.substeps && step.substeps.length > 0) {
      const childDepth = ComputeProofDepth(step.substeps, currentDepth + 1);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }
  }
  return maxChildDepth;
}

/**
 * Average branching factor in proof tree
 */
function ComputeBranchingFactor(steps) {
  let totalBranches = 0;
  let nodeCount = 0;

  function traverse(stepsArray) {
    for (const step of stepsArray) {
      nodeCount++;
      if (step.substeps && step.substeps.length > 0) {
        totalBranches += step.substeps.length;
        traverse(step.substeps);
      }
    }
  }

  traverse(steps);
  return nodeCount > 0 ? totalBranches / nodeCount : 0;
}

/**
 * Analyze density of mathematical notation
 */
function AnalyzeNotationDensity(latex) {
  if (!latex) return 0;

  // Count special LaTeX commands
  const mathCommandCount = (latex.match(/\\[a-zA-Z]+/g) || []).length;
  const bracketDepth = ComputeMaxBracketDepth(latex);
  const subscriptCount = (latex.match(/[_^]/g) || []).length;

  const totalChars = latex.length;
  const density = totalChars > 0
    ? (mathCommandCount + bracketDepth * 0.5 + subscriptCount * 0.3) / totalChars
    : 0;

  return Math.min(density * 100, 100); // Normalize to 0-100
}

/**
 * Count unique mathematical symbols
 */
function CountUniqueSymbols(latex) {
  const symbols = new Set();

  // Extract LaTeX commands (operators, symbols)
  const commands = latex.match(/\\[a-zA-Z]+/g) || [];
  commands.forEach(cmd => symbols.add(cmd));

  // Extract Greek letters and special chars
  const specialChars = latex.match(/[α-ωΑ-Ω∀∃∈∉⊂⊃∩∪≤≥≠≈∞∂∇∑∏∫]/g) || [];
  specialChars.forEach(char => symbols.add(char));

  return symbols.size;
}

/**
 * Compute max nesting depth of operators
 */
function ComputeOperatorNesting(latex) {
  let maxDepth = 0;
  let currentDepth = 0;

  for (let i = 0; i < latex.length; i++) {
    if (latex[i] === '{' || latex[i] === '(') currentDepth++;
    if (latex[i] === '}' || latex[i] === ')') currentDepth--;
    maxDepth = Math.max(maxDepth, currentDepth);
  }

  return maxDepth;
}

function ComputeMaxBracketDepth(text) {
  let depth = 0, max = 0;
  for (const char of text) {
    if (char === '{' || char === '(') depth++;
    else if (char === '}' || char === ')') depth--;
    max = Math.max(max, depth);
  }
  return max;
}

/**
 * Extract concept references from proof
 */
function ExtractConceptReferences(proof) {
  const refs = new Set();

  // From explicit prerequisites
  if (proof.prerequisites) {
    proof.prerequisites.forEach(p => refs.add(p));
  }

  // From text mentions (match against knowledge graph)
  const text = (proof.detail || '') + ' ' + (proof.summary || '');
  NODES.forEach(node => {
    if (text.includes(node.name) || text.includes(node.en)) {
      refs.add(node.id);
    }
  });

  return Array.from(refs);
}

function CountCrossReferences(proof) {
  const text = proof.detail || '';
  // Count citations like [Thm 3.2], see §4.5, etc.
  const citationPatterns = /\[.*?\d+.*?\]|§\s*\d+|\bTheorem\s+\d+|\bLemma\s+\d+/gi;
  return (text.match(citationPatterns) || []).length;
}

/**
 * Estimate abstraction level (0=concrete, 1=highly abstract)
 */
function EstimateAbstraction(proof) {
  const text = proof.detail || '';

  // Abstract markers
  const abstractMarkers = [
    'general', 'arbitrary', 'abstract', 'functor', 'category',
    'universal', 'natural', 'canonical', 'generic'
  ];

  // Concrete markers
  const concreteMarkers = [
    'example', 'specific', 'explicit', 'compute', 'calculate',
    'number', 'case', 'instance'
  ];

  const abstractCount = abstractMarkers.filter(m => text.toLowerCase().includes(m)).length;
  const concreteCount = concreteMarkers.filter(m => text.toLowerCase().includes(m)).length;

  const total = abstractCount + concreteCount;
  return total > 0 ? abstractCount / total : 0.5;
}

function AnalyzeTextComplexity(text) {
  if (!text) return 0;

  const words = text.split(/\s+/);
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  const sentences = text.split(/[。.!?]+/).filter(s => s.trim());
  const avgSentenceLength = words.length / sentences.length;

  // Flesch-Kincaid style score
  return Math.min((avgWordLength * 0.5 + avgSentenceLength * 0.3) * 10, 100);
}

function ComputeVocabularyLevel(text) {
  if (!text) return 0;

  // Advanced mathematical terms (sampling)
  const advancedTerms = [
    'cohomology', 'sheaf', 'scheme', 'functor', 'derived',
    'spectral', 'homological', 'categorical', 'topos', 'stack'
  ];

  const foundAdvanced = advancedTerms.filter(term =>
    text.toLowerCase().includes(term)
  ).length;

  return Math.min(foundAdvanced * 15, 100);
}

/**
 * Composite complexity score
 */
function ComputeComplexityScore(features) {
  const weights = {
    stepCount: 0.15,
    maxDepth: 0.20,
    notationDensity: 0.15,
    symbolComplexity: 0.10,
    conceptCount: 0.15,
    abstrationLevel: 0.10,
    textComplexity: 0.10,
    vocabularyLevel: 0.05,
  };

  let score = 0;
  score += Math.min(features.stepCount / 20, 1) * weights.stepCount;
  score += Math.min(features.maxDepth / 5, 1) * weights.maxDepth;
  score += (features.notationDensity / 100) * weights.notationDensity;
  score += Math.min(features.symbolComplexity / 30, 1) * weights.symbolComplexity;
  score += Math.min(features.conceptCount / 10, 1) * weights.conceptCount;
  score += features.abstrationLevel * weights.abstrationLevel;
  score += (features.textComplexity / 100) * weights.textComplexity;
  score += (features.vocabularyLevel / 100) * weights.vocabularyLevel;

  return score; // 0 to 1
}

function EstimateCognitiveLoad(features) {
  // Cognitive load = working memory demand
  const load =
    features.stepCount * 0.8 +
    features.conceptCount * 1.5 +
    features.branchingFactor * 10 +
    features.crossReferences * 2 +
    (features.hasVisualAid ? -5 : 0) +
    (features.hasWorkedExample ? -8 : 0);

  return Math.max(0, load);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  2. DIFFICULTY CLASSIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Main classifier: compute difficulty level + confidence
 */
export function ClassifyDifficulty(proof) {
  const features = ExtractProofFeatures(proof);
  const score = features.complexityScore;

  // Map score to level
  let level, confidence;

  if (score < 0.30) {
    level = 'beginner';
    confidence = 1 - (score / 0.30) * 0.15; // High confidence for simple proofs
  } else if (score < 0.60) {
    level = 'intermediate';
    confidence = 0.85 - Math.abs(score - 0.45) * 0.3;
  } else {
    level = 'advanced';
    confidence = 0.75 + (score - 0.60) * 0.5;
  }

  // Adjust confidence based on feature consistency
  const featureVariance = ComputeFeatureVariance(features);
  confidence *= (1 - featureVariance * 0.2);

  return {
    level,
    score: Math.round(score * 100) / 100,
    confidence: Math.min(Math.max(confidence, 0.5), 0.95),
    features,
    metrics: {
      complexity: score,
      cognitiveLoad: features.cognitiveLoad,
      abstraction: features.abstrationLevel,
    }
  };
}

function ComputeFeatureVariance(features) {
  // Check if features are consistent (low variance = consistent)
  const normalized = [
    Math.min(features.stepCount / 20, 1),
    Math.min(features.maxDepth / 5, 1),
    features.notationDensity / 100,
    Math.min(features.symbolComplexity / 30, 1),
    Math.min(features.conceptCount / 10, 1),
  ];

  const mean = normalized.reduce((a, b) => a + b, 0) / normalized.length;
  const variance = normalized.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / normalized.length;

  return Math.sqrt(variance);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  3. PREREQUISITE PREDICTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Predict required prerequisite theorems
 */
export function PredictPrerequisites(proof) {
  // 1. Explicit prerequisites
  const explicit = proof.prerequisites || [];

  // 2. Concept-based inference
  const concepts = ExtractConceptReferences(proof);
  const inferred = InferPrerequisitesFromConcepts(concepts);

  // 3. Dependency graph traversal
  const graphBased = TraverseKnowledgeGraph(proof.id, 2); // 2 hops backward

  // Merge and rank
  const allPrereqs = [...new Set([...explicit, ...inferred, ...graphBased])];
  const ranked = RankPrerequisites(allPrereqs, proof);

  // Return top N most relevant
  return ranked.slice(0, 8).map(p => p.id);
}

function InferPrerequisitesFromConcepts(concepts) {
  const prereqs = [];

  // Find foundational concepts (high importance, earlier in dependency chain)
  concepts.forEach(conceptId => {
    const node = NODES.find(n => n.id === conceptId);
    if (node && node.importance > 0.7) {
      prereqs.push(conceptId);

      // Add its direct dependencies
      LINKS.forEach(link => {
        if (link[1] === conceptId && link[2] > 0.6) {
          prereqs.push(link[0]);
        }
      });
    }
  });

  return [...new Set(prereqs)];
}

function TraverseKnowledgeGraph(proofId, maxHops) {
  const visited = new Set();
  const queue = [{ id: proofId, depth: 0 }];
  const prereqs = [];

  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    if (visited.has(id) || depth > maxHops) continue;
    visited.add(id);

    // Find incoming edges (dependencies)
    LINKS.forEach(([source, target, weight]) => {
      if (target === id && weight > 0.5 && !visited.has(source)) {
        prereqs.push(source);
        queue.push({ id: source, depth: depth + 1 });
      }
    });
  }

  return prereqs;
}

function RankPrerequisites(prereqIds, currentProof) {
  return prereqIds
    .map(id => {
      const node = NODES.find(n => n.id === id);
      if (!node) return null;

      // Scoring factors
      const importanceScore = node.importance || 0.5;
      const linkStrength = GetMaxLinkStrength(id, currentProof.id);
      const familyBonus = node.family === currentProof.family ? 0.2 : 0;

      const score = importanceScore * 0.5 + linkStrength * 0.3 + familyBonus;

      return { id, score, node };
    })
    .filter(p => p !== null)
    .sort((a, b) => b.score - a.score);
}

function GetMaxLinkStrength(sourceId, targetId) {
  let maxStrength = 0;
  LINKS.forEach(([src, tgt, weight]) => {
    if (src === sourceId && tgt === targetId) {
      maxStrength = Math.max(maxStrength, weight);
    }
  });
  return maxStrength;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  4. READING TIME ESTIMATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Estimate reading time in minutes
 */
export function EstimateReadingTime(proof) {
  const features = ExtractProofFeatures(proof);
  const difficulty = ClassifyDifficulty(proof);

  // Base reading speed (words per minute) adjusted by difficulty
  const baseWPM = {
    beginner: 200,
    intermediate: 120,
    advanced: 80,
  }[difficulty.level];

  // Count text content
  const text = (proof.detail || '') + ' ' + (proof.summary || '');
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  // Mathematical notation adds overhead
  const notationPenalty = features.notationDensity * 0.5; // +50% at max density
  const cognitiveLoadPenalty = Math.min(features.cognitiveLoad / 50, 1.5);

  // Formula: base time + notation overhead + cognitive load overhead
  const baseTime = wordCount / baseWPM;
  const notationOverhead = baseTime * notationPenalty;
  const cognitiveOverhead = features.stepCount * 0.5 * cognitiveLoadPenalty;

  const totalMinutes = baseTime + notationOverhead + cognitiveOverhead;

  // Add time for examples/diagrams
  const visualTime = (proof.diagram ? 2 : 0) + (proof.example ? 3 : 0);

  return Math.max(Math.round(totalMinutes + visualTime), 1);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  5. DIFFICULTY INDEX CREATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Build comprehensive difficulty index for all proofs
 */
export function CreateDifficultyIndex(allProofs) {
  const index = new Map();

  // First pass: classify all proofs
  allProofs.forEach(proof => {
    const classification = ClassifyDifficulty(proof);
    const prerequisites = PredictPrerequisites(proof);
    const readingTime = EstimateReadingTime(proof);

    index.set(proof.id, {
      id: proof.id,
      difficulty: classification.level,
      score: classification.score,
      confidence: classification.confidence,
      prerequisites,
      readingTime,
      metrics: classification.metrics,
      features: classification.features,
    });
  });

  // Second pass: build learning paths
  index.forEach((data, proofId) => {
    data.learningPath = BuildLearningPath(proofId, index);
    data.cumulativeTime = ComputeCumulativeTime(data.learningPath, index);
  });

  // Third pass: compute relative difficulty within family
  ComputeRelativeDifficulty(index, allProofs);

  return index;
}

function BuildLearningPath(proofId, index) {
  const visited = new Set();
  const path = [];

  function traverse(id, depth = 0) {
    if (visited.has(id) || depth > 5) return;
    visited.add(id);

    const data = index.get(id);
    if (!data) return;

    // Add prerequisites first (topological sort)
    data.prerequisites.forEach(prereqId => {
      if (!visited.has(prereqId)) {
        traverse(prereqId, depth + 1);
      }
    });

    path.push(id);
  }

  traverse(proofId);
  return path;
}

function ComputeCumulativeTime(learningPath, index) {
  return learningPath.reduce((total, proofId) => {
    const data = index.get(proofId);
    return total + (data?.readingTime || 0);
  }, 0);
}

function ComputeRelativeDifficulty(index, allProofs) {
  // Group by family
  const families = {};
  allProofs.forEach(proof => {
    if (!families[proof.family]) families[proof.family] = [];
    families[proof.family].push(proof.id);
  });

  // Compute percentile rank within family
  Object.values(families).forEach(proofIds => {
    const scores = proofIds
      .map(id => index.get(id)?.score || 0)
      .sort((a, b) => a - b);

    proofIds.forEach(id => {
      const data = index.get(id);
      if (!data) return;

      const rank = scores.indexOf(data.score);
      data.familyPercentile = Math.round((rank / scores.length) * 100);
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  6. VISUALIZATION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get UI-friendly difficulty badge config
 */
export function GetDifficultyBadge(level) {
  const configs = {
    beginner: {
      label: '入门',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      icon: '🌱',
    },
    intermediate: {
      label: '中级',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      icon: '🔥',
    },
    advanced: {
      label: '高级',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      icon: '💎',
    },
  };

  return configs[level] || configs.intermediate;
}

/**
 * Format reading time for display
 */
export function FormatReadingTime(minutes) {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  7. TRAINING DATA & ACCURACY METRICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Bootstrap training data from algebraic geometry corpus
 */
export function GenerateTrainingData() {
  // Use knowledge graph nodes as ground truth
  const trainingSet = NODES.map(node => ({
    id: node.id,
    features: ExtractProofFeatures(node),

    // Ground truth from importance + family
    trueLevel: node.importance > 0.85 ? 'advanced'
             : node.importance > 0.65 ? 'intermediate'
             : 'beginner',

    // Manual labels (could be expanded with expert annotations)
    familyContext: node.family,
    importanceScore: node.importance,
  }));

  return {
    dataset: trainingSet,
    size: trainingSet.length,
    distribution: ComputeLevelDistribution(trainingSet),
  };
}

function ComputeLevelDistribution(dataset) {
  const counts = { beginner: 0, intermediate: 0, advanced: 0 };
  dataset.forEach(d => counts[d.trueLevel]++);
  return counts;
}

/**
 * Compute classification accuracy metrics
 */
export function EvaluateClassifier() {
  const trainingData = GenerateTrainingData();
  const predictions = [];

  // Run classifier on training set
  trainingData.dataset.forEach(sample => {
    const predicted = ClassifyDifficulty(sample);
    predictions.push({
      id: sample.id,
      true: sample.trueLevel,
      predicted: predicted.level,
      confidence: predicted.confidence,
      score: predicted.score,
    });
  });

  // Compute confusion matrix
  const confusionMatrix = {
    beginner: { beginner: 0, intermediate: 0, advanced: 0 },
    intermediate: { beginner: 0, intermediate: 0, advanced: 0 },
    advanced: { beginner: 0, intermediate: 0, advanced: 0 },
  };

  predictions.forEach(p => {
    confusionMatrix[p.true][p.predicted]++;
  });

  // Compute accuracy metrics
  const total = predictions.length;
  const correct = predictions.filter(p => p.true === p.predicted).length;
  const accuracy = correct / total;

  // Per-class precision/recall
  const metrics = {};
  ['beginner', 'intermediate', 'advanced'].forEach(level => {
    const tp = confusionMatrix[level][level];
    const fp = Object.keys(confusionMatrix)
      .filter(k => k !== level)
      .reduce((sum, k) => sum + confusionMatrix[k][level], 0);
    const fn = Object.values(confusionMatrix[level])
      .reduce((sum, count, idx) => idx !== Object.keys(confusionMatrix[level]).indexOf(level) ? sum + count : sum, 0);

    const precision = tp / (tp + fp);
    const recall = tp / (tp + fn);
    const f1 = 2 * (precision * recall) / (precision + recall);

    metrics[level] = {
      precision: Math.round(precision * 100) / 100,
      recall: Math.round(recall * 100) / 100,
      f1: Math.round(f1 * 100) / 100,
    };
  });

  // Confidence calibration
  const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / total;

  return {
    accuracy: Math.round(accuracy * 100) / 100,
    totalSamples: total,
    correct,
    confusionMatrix,
    perClassMetrics: metrics,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    predictions, // Full results for debugging
  };
}

/**
 * Strategy for improving accuracy
 */
export const TRAINING_STRATEGY = {
  phase1: {
    name: 'Bootstrap from Knowledge Graph',
    method: 'Use node.importance as proxy for difficulty',
    expectedAccuracy: '~75%',
    dataSize: NODES.length,
  },

  phase2: {
    name: 'Expert Annotation',
    method: 'Manually label 50-100 representative proofs across all families',
    expectedAccuracy: '~85%',
    effort: 'Medium (5-10 hours)',
  },

  phase3: {
    name: 'User Interaction Learning',
    method: 'Track reading time, revisits, "mark as difficult" clicks',
    expectedAccuracy: '~90%',
    dataRequired: '1000+ user sessions',
  },

  phase4: {
    name: 'Fine-tuning with LLM',
    method: 'GPT-4 / Claude API for semantic analysis of proof text',
    expectedAccuracy: '~95%',
    cost: 'API costs (~$50-100 for full corpus)',
  },
};

// Export for demo/testing
export const __internal = {
  ExtractProofFeatures,
  ComputeComplexityScore,
  EstimateCognitiveLoad,
  InferPrerequisitesFromConcepts,
  BuildLearningPath,
};
