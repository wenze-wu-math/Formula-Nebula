# Curriculum Learning Research Study
## Optimal Learning Paths Through Mathematical Knowledge Graphs

**Research System Version:** 1.0  
**Date:** November 2026  
**Status:** Complete Implementation with Evaluation Framework

---

## Executive Summary

This document presents a comprehensive curriculum learning system for mathematical education, combining:

1. **Prerequisite Graph Extraction** — Automated DAG construction from theorem dependencies
2. **A* Path Optimization** — Pedagogically-informed heuristic search across knowledge space
3. **Personalized Difficulty Adjustment** — Flow theory-based adaptive learning
4. **Spaced Repetition Scheduling** — Enhanced SM-2+ algorithm for optimal review timing
5. **Human Baseline Evaluation** — Systematic comparison against expert instructor curricula

The system has been evaluated across multiple dimensions against human instructors, demonstrating comparable or superior performance in path efficiency, difficulty progression, and predicted learning outcomes.

---

## 1. System Architecture

### 1.1 Component Overview

```
CurriculumLearningSystem
├── PrerequisiteGraph
│   ├── Graph extraction & analysis
│   ├── Betweenness centrality computation
│   ├── Critical path detection
│   └── Topological sorting
│
├── OptimalPathFinder (A* Search)
│   ├── Multi-strategy search (difficulty/time/engagement)
│   ├── Pedagogical cost functions
│   ├── Heuristic distance estimation
│   └── Alternative path generation
│
├── DifficultyAdjuster
│   ├── Performance analysis
│   ├── Flow state computation (Csikszentmihalyi)
│   ├── Adaptive difficulty targeting
│   └── Personalized recommendations
│
└── Integration with:
    ├── SpacedRepetitionScheduler (SM-2+)
    ├── MultiObjectiveOptimizer (Pareto fronts)
    ├── HumanBaselineEvaluator
    └── LearningOutcomePredictor
```

### 1.2 Data Flow

```
User Profile + Goal Theorem
    ↓
Prerequisite Graph Analysis
    ↓
A* Search with Pedagogical Heuristics
    ↓
Difficulty Adjustment (Flow Theory)
    ↓
Spaced Repetition Schedule
    ↓
Learning Outcome Prediction
    ↓
Human Baseline Comparison
```

---

## 2. Prerequisite Graph Extraction

### 2.1 Algorithm

**Input:** Knowledge graph with theorem dependencies  
**Output:** Directed acyclic graph (DAG) of prerequisites

**Process:**
1. Build bidirectional adjacency lists from dependencies
2. Compute graph metrics (centrality, paths, depth)
3. Detect cycles (should be none in proper prerequisite structure)
4. Identify foundation theorems (source nodes) and advanced theorems (sinks)

### 2.2 Metrics Computed

| Metric | Description | Educational Significance |
|--------|-------------|------------------------|
| **In-degree** | Number of prerequisites | Indicates concept complexity |
| **Out-degree** | Number of dependent theorems | Measures foundational importance |
| **Betweenness Centrality** | How often node appears in shortest paths | Identifies "gateway" concepts |
| **Critical Paths** | Longest dependency chains | Highlights deep learning sequences |
| **Learning Depth** | Distance from foundational axioms | Estimates abstraction level |

### 2.3 Example Output

```
📊 Graph Metrics:
  Total nodes: 847
  Total edges: 2,341
  Average in-degree: 2.76
  Average out-degree: 2.76
  Foundation theorems: 23
  Advanced theorems: 156

🔝 Central Nodes:
  1. Fundamental Theorem of Algebra (centrality: 184.3)
  2. Completeness of Real Numbers (centrality: 167.8)
  3. Mean Value Theorem (centrality: 149.2)
```

---

## 3. Optimal Path Finding (A* Search)

### 3.1 Search Algorithm

**A* with Pedagogical Heuristics**

