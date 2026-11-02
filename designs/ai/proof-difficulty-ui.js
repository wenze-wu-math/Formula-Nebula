/**
 * ═══════════════════════════════════════════════════════════════
 *  UI Integration for Proof Difficulty Classifier
 * ═══════════════════════════════════════════════════════════════
 *
 *  React/Vue-agnostic UI helpers for rendering difficulty badges,
 *  reading time estimates, and prerequisite chains in the UI.
 */

import {
  ClassifyDifficulty,
  PredictPrerequisites,
  EstimateReadingTime,
  GetDifficultyBadge,
  FormatReadingTime,
} from './proof-difficulty.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  1. PROOF CARD ENHANCEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Render difficulty badge on proof card
 */
export function RenderDifficultyBadge(proof, container) {
  const classification = ClassifyDifficulty(proof);
  const badge = GetDifficultyBadge(classification.level);

  const badgeEl = document.createElement('div');
  badgeEl.className = 'difficulty-badge';
  badgeEl.innerHTML = `
    <span class="badge-icon">${badge.icon}</span>
    <span class="badge-label">${badge.label}</span>
    <span class="badge-confidence">${Math.round(classification.confidence * 100)}%</span>
  `;

  badgeEl.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    background: ${badge.bgColor};
    color: ${badge.color};
    border: 1px solid ${badge.color}40;
  `;

  container.appendChild(badgeEl);
  return badgeEl;
}

/**
 * Render reading time indicator
 */
export function RenderReadingTime(proof, container) {
  const minutes = EstimateReadingTime(proof);
  const formatted = FormatReadingTime(minutes);

  const timeEl = document.createElement('div');
  timeEl.className = 'reading-time';
  timeEl.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
    <span>${formatted}</span>
  `;

  timeEl.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #94a8c4;
  `;

  container.appendChild(timeEl);
  return timeEl;
}

/**
 * Render prerequisite tags
 */
export function RenderPrerequisites(proof, container, onClick) {
  const prereqIds = PredictPrerequisites(proof);

  const prereqContainer = document.createElement('div');
  prereqContainer.className = 'prerequisites-container';
  prereqContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  `;

  if (prereqIds.length === 0) {
    prereqContainer.innerHTML = '<span style="color: #94a8c4; font-size: 12px;">无前置要求</span>';
  } else {
    prereqIds.slice(0, 5).forEach(prereqId => {
      const tag = document.createElement('button');
      tag.className = 'prerequisite-tag';
      tag.textContent = prereqId;
      tag.style.cssText = `
        padding: 4px 10px;
        font-size: 11px;
        border: 1px solid rgba(120, 215, 255, 0.3);
        background: rgba(120, 215, 255, 0.1);
        color: #78d7ff;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      `;

      tag.addEventListener('mouseenter', () => {
        tag.style.background = 'rgba(120, 215, 255, 0.2)';
        tag.style.borderColor = 'rgba(120, 215, 255, 0.6)';
      });

      tag.addEventListener('mouseleave', () => {
        tag.style.background = 'rgba(120, 215, 255, 0.1)';
        tag.style.borderColor = 'rgba(120, 215, 255, 0.3)';
      });

      if (onClick) {
        tag.addEventListener('click', () => onClick(prereqId));
      }

      prereqContainer.appendChild(tag);
    });

    if (prereqIds.length > 5) {
      const moreTag = document.createElement('span');
      moreTag.textContent = `+${prereqIds.length - 5} 更多`;
      moreTag.style.cssText = `
        font-size: 11px;
        color: #94a8c4;
        padding: 4px 8px;
      `;
      prereqContainer.appendChild(moreTag);
    }
  }

  container.appendChild(prereqContainer);
  return prereqContainer;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  2. TIMELINE VISUALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Render difficulty gradient on timeline
 */
export function RenderTimelineDifficulty(proofs, timeline) {
  // Create gradient overlay on timeline based on difficulty
  const difficultyOverlay = document.createElement('div');
  difficultyOverlay.className = 'timeline-difficulty-overlay';
  difficultyOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    pointer-events: none;
    z-index: 10;
  `;

  // Build gradient stops
  const gradientStops = proofs
    .map((proof, idx) => {
      const classification = ClassifyDifficulty(proof);
      const position = (idx / proofs.length) * 100;
      const color = GetDifficultyColor(classification.level);
      return `${color} ${position}%`;
    })
    .join(', ');

  difficultyOverlay.style.background = `linear-gradient(90deg, ${gradientStops})`;
  timeline.appendChild(difficultyOverlay);

  return difficultyOverlay;
}

function GetDifficultyColor(level) {
  return {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  }[level] || '#94a8c4';
}

/**
 * Add difficulty markers on timeline dots
 */
export function AddTimelineMarkers(proofElements) {
  proofElements.forEach(el => {
    const proofId = el.dataset.proofId;
    // In real app, fetch proof from store
    // For now, just add visual marker

    const marker = document.createElement('div');
    marker.className = 'difficulty-marker';
    marker.style.cssText = `
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 2px solid white;
      z-index: 5;
    `;

    // Color based on stored classification
    const stored = sessionStorage.getItem(`difficulty:${proofId}`);
    if (stored) {
      const { level } = JSON.parse(stored);
      marker.style.background = GetDifficultyColor(level);
      el.style.position = 'relative';
      el.appendChild(marker);
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  3. DETAIL PANEL ENHANCEMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Render comprehensive difficulty analysis in detail panel
 */
export function RenderDifficultyAnalysis(proof, container) {
  const classification = ClassifyDifficulty(proof);
  const badge = GetDifficultyBadge(classification.level);

  const panel = document.createElement('div');
  panel.className = 'difficulty-analysis';
  panel.innerHTML = `
    <div class="analysis-header">
      <div class="difficulty-badge-large">
        <span class="badge-icon-large">${badge.icon}</span>
        <div class="badge-info">
          <div class="badge-level">${badge.label}</div>
          <div class="badge-confidence">可信度: ${Math.round(classification.confidence * 100)}%</div>
        </div>
      </div>
      <div class="reading-time-large">
        <div class="time-value">${EstimateReadingTime(proof)}</div>
        <div class="time-label">分钟</div>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric">
        <div class="metric-label">复杂度</div>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${classification.metrics.complexity * 100}%; background: ${badge.color};"></div>
        </div>
        <div class="metric-value">${Math.round(classification.metrics.complexity * 100)}</div>
      </div>

      <div class="metric">
        <div class="metric-label">认知负荷</div>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${Math.min(classification.metrics.cognitiveLoad / 100, 1) * 100}%; background: #f59e0b;"></div>
        </div>
        <div class="metric-value">${Math.round(classification.metrics.cognitiveLoad)}</div>
      </div>

      <div class="metric">
        <div class="metric-label">抽象程度</div>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${classification.metrics.abstraction * 100}%; background: #8b5cf6;"></div>
        </div>
        <div class="metric-value">${Math.round(classification.metrics.abstraction * 100)}</div>
      </div>
    </div>

    <div class="feature-breakdown">
      <div class="feature-title">特征分析</div>
      <div class="feature-list">
        ${RenderFeatureList(classification.features)}
      </div>
    </div>
  `;

  panel.style.cssText = `
    background: rgba(12, 17, 29, 0.4);
    border: 1px solid rgba(148, 178, 220, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin: 16px 0;
  `;

  AddAnalysisStyles();
  container.appendChild(panel);
  return panel;
}

function RenderFeatureList(features) {
  const items = [
    { label: '证明步骤', value: features.stepCount, icon: '📊' },
    { label: '最大深度', value: features.maxDepth, icon: '🌳' },
    { label: '符号复杂度', value: features.symbolComplexity, icon: '∑' },
    { label: '概念数量', value: features.conceptCount, icon: '💡' },
    { label: '引用次数', value: features.crossReferences, icon: '🔗' },
  ];

  return items
    .map(item => `
      <div class="feature-item">
        <span class="feature-icon">${item.icon}</span>
        <span class="feature-label">${item.label}</span>
        <span class="feature-value">${item.value}</span>
      </div>
    `)
    .join('');
}

function AddAnalysisStyles() {
  if (document.getElementById('difficulty-analysis-styles')) return;

  const style = document.createElement('style');
  style.id = 'difficulty-analysis-styles';
  style.textContent = `
    .analysis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .difficulty-badge-large {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .badge-icon-large {
      font-size: 40px;
    }

    .badge-level {
      font-size: 18px;
      font-weight: 700;
      color: #f5f8ff;
    }

    .badge-confidence {
      font-size: 12px;
      color: #94a8c4;
    }

    .reading-time-large {
      text-align: right;
    }

    .time-value {
      font-size: 32px;
      font-weight: 700;
      color: #78d7ff;
      line-height: 1;
    }

    .time-label {
      font-size: 12px;
      color: #94a8c4;
      margin-top: 4px;
    }

    .metrics-grid {
      display: grid;
      gap: 12px;
      margin-bottom: 20px;
    }

    .metric {
      display: grid;
      grid-template-columns: 80px 1fr 40px;
      align-items: center;
      gap: 12px;
    }

    .metric-label {
      font-size: 12px;
      color: #94a8c4;
    }

    .metric-bar {
      height: 8px;
      background: rgba(148, 178, 220, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .metric-fill {
      height: 100%;
      transition: width 0.6s ease;
    }

    .metric-value {
      font-size: 12px;
      font-weight: 600;
      color: #f5f8ff;
      text-align: right;
    }

    .feature-breakdown {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(148, 178, 220, 0.2);
    }

    .feature-title {
      font-size: 13px;
      font-weight: 600;
      color: #94a8c4;
      margin-bottom: 12px;
    }

    .feature-list {
      display: grid;
      gap: 8px;
    }

    .feature-item {
      display: grid;
      grid-template-columns: 24px 1fr auto;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .feature-icon {
      font-size: 16px;
    }

    .feature-label {
      color: #94a8c4;
    }

    .feature-value {
      font-weight: 600;
      color: #f5f8ff;
    }
  `;

  document.head.appendChild(style);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  4. LEARNING PATH VISUALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Render prerequisite chain as interactive graph
 */
export function RenderLearningPath(proof, container, onNodeClick) {
  const prereqIds = PredictPrerequisites(proof);

  const pathContainer = document.createElement('div');
  pathContainer.className = 'learning-path';
  pathContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: rgba(12, 17, 29, 0.3);
    border-radius: 12px;
    margin: 16px 0;
  `;

  const title = document.createElement('div');
  title.textContent = '推荐学习路径';
  title.style.cssText = `
    font-size: 14px;
    font-weight: 600;
    color: #f5f8ff;
    margin-bottom: 8px;
  `;
  pathContainer.appendChild(title);

  if (prereqIds.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = '这是一个基础定理，无需前置知识！';
    empty.style.cssText = `
      font-size: 13px;
      color: #94a8c4;
      font-style: italic;
    `;
    pathContainer.appendChild(empty);
  } else {
    prereqIds.forEach((prereqId, idx) => {
      const node = CreatePathNode(prereqId, idx + 1, onNodeClick);
      pathContainer.appendChild(node);
    });

    const current = CreatePathNode(proof.id, prereqIds.length + 1, null, true);
    pathContainer.appendChild(current);
  }

  container.appendChild(pathContainer);
  return pathContainer;
}

function CreatePathNode(proofId, step, onClick, isCurrent = false) {
  const node = document.createElement('div');
  node.className = 'path-node';
  node.innerHTML = `
    <div class="path-step">${step}</div>
    <div class="path-content">
      <div class="path-id">${proofId}</div>
      ${isCurrent ? '<div class="path-current">当前定理</div>' : ''}
    </div>
    ${!isCurrent ? '<div class="path-arrow">→</div>' : ''}
  `;

  node.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: ${isCurrent ? 'rgba(120, 215, 255, 0.15)' : 'rgba(148, 178, 220, 0.05)'};
    border: 1px solid ${isCurrent ? 'rgba(120, 215, 255, 0.4)' : 'rgba(148, 178, 220, 0.2)'};
    border-radius: 8px;
    cursor: ${isCurrent ? 'default' : 'pointer'};
    transition: all 0.2s;
  `;

  if (!isCurrent && onClick) {
    node.addEventListener('mouseenter', () => {
      node.style.background = 'rgba(120, 215, 255, 0.1)';
      node.style.borderColor = 'rgba(120, 215, 255, 0.3)';
    });

    node.addEventListener('mouseleave', () => {
      node.style.background = 'rgba(148, 178, 220, 0.05)';
      node.style.borderColor = 'rgba(148, 178, 220, 0.2)';
    });

    node.addEventListener('click', () => onClick(proofId));
  }

  return node;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  5. UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Cache classification results in sessionStorage
 */
export function CacheClassification(proof) {
  const classification = ClassifyDifficulty(proof);
  sessionStorage.setItem(
    `difficulty:${proof.id}`,
    JSON.stringify(classification)
  );
  return classification;
}

/**
 * Retrieve cached classification
 */
export function GetCachedClassification(proofId) {
  const cached = sessionStorage.getItem(`difficulty:${proofId}`);
  return cached ? JSON.parse(cached) : null;
}

/**
 * Batch process multiple proofs for performance
 */
export function BatchClassify(proofs, onProgress) {
  const results = new Map();
  const total = proofs.length;

  proofs.forEach((proof, idx) => {
    const classification = ClassifyDifficulty(proof);
    results.set(proof.id, classification);

    if (onProgress) {
      onProgress((idx + 1) / total);
    }
  });

  return results;
}
