/**
 * Annotation UI Components
 * Visual components for highlighting, sticky notes, and annotations
 */

import {
  CreateAnnotation,
  GetAnnotationsByItem,
  UpdateAnnotation,
  DeleteAnnotation,
  ThreadComment,
  GetDiscussionThread,
} from '../annotations.js';
import { sharedDB } from '../sharedDB.js';

// ============================================================================
// Highlight Overlay Component
// ============================================================================

/**
 * Create highlight overlay for annotation regions
 * @param {HTMLElement} container - Parent container element
 * @param {string} itemId - Formula/theorem item ID
 * @returns {Object} Highlight manager
 */
export function createHighlightOverlay(container, itemId) {
  const overlay = document.createElement('div');
  overlay.className = 'annotation-overlay';
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  `;
  container.style.position = 'relative';
  container.appendChild(overlay);

  // Render all annotations
  function renderAnnotations() {
    overlay.innerHTML = '';
    const annotations = GetAnnotationsByItem(itemId);

    annotations.forEach(annotation => {
      const highlight = createHighlightElement(annotation);
      overlay.appendChild(highlight);
    });
  }

  // Create single highlight element
  function createHighlightElement(annotation) {
    const highlight = document.createElement('div');
    highlight.className = 'annotation-highlight';
    highlight.dataset.annotationId = annotation.id;
    highlight.style.cssText = `
      position: absolute;
      left: ${annotation.region.x}px;
      top: ${annotation.region.y}px;
      width: ${annotation.region.width}px;
      height: ${annotation.region.height}px;
      background-color: ${annotation.color};
      opacity: 0.3;
      border: 2px solid ${annotation.color};
      pointer-events: auto;
      cursor: pointer;
      transition: opacity 0.2s;
    `;

    highlight.addEventListener('mouseenter', () => {
      highlight.style.opacity = '0.5';
      showAnnotationTooltip(highlight, annotation);
    });

    highlight.addEventListener('mouseleave', () => {
      highlight.style.opacity = '0.3';
      hideAnnotationTooltip();
    });

    highlight.addEventListener('click', (e) => {
      e.stopPropagation();
      showAnnotationDetails(annotation);
    });

    return highlight;
  }

  // Listen for annotation changes
  sharedDB.on('annotation:created', renderAnnotations);
  sharedDB.on('annotation:updated', renderAnnotations);
  sharedDB.on('annotation:deleted', renderAnnotations);

  // Initial render
  renderAnnotations();

  return {
    refresh: renderAnnotations,
    destroy: () => {
      sharedDB.off('annotation:created', renderAnnotations);
      sharedDB.off('annotation:updated', renderAnnotations);
      sharedDB.off('annotation:deleted', renderAnnotations);
      overlay.remove();
    },
  };
}

// ============================================================================
// Annotation Tooltip
// ============================================================================

let currentTooltip = null;

function showAnnotationTooltip(element, annotation) {
  hideAnnotationTooltip();

  const tooltip = document.createElement('div');
  tooltip.className = 'annotation-tooltip';
  tooltip.innerHTML = `
    <div class="tooltip-content">
      <div class="tooltip-text">${escapeHtml(annotation.text)}</div>
      <div class="tooltip-meta">
        <span class="tooltip-user">${escapeHtml(annotation.userId)}</span>
        <span class="tooltip-date">${formatDate(annotation.createdAt)}</span>
      </div>
    </div>
  `;

  tooltip.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    max-width: 300px;
    font-size: 14px;
  `;

  document.body.appendChild(tooltip);

  // Position tooltip
  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${rect.bottom + 8}px`;

  currentTooltip = tooltip;
}

function hideAnnotationTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

// ============================================================================
// Annotation Details Panel
// ============================================================================

function showAnnotationDetails(annotation) {
  const panel = document.createElement('div');
  panel.className = 'annotation-details-panel';
  panel.innerHTML = `
    <div class="panel-overlay"></div>
    <div class="panel-content">
      <div class="panel-header">
        <h3>Annotation</h3>
        <button class="panel-close">&times;</button>
      </div>
      <div class="panel-body">
        <div class="annotation-info">
          <div class="color-picker-wrapper">
            <label>Highlight Color:</label>
            <input type="color" class="color-picker" value="${annotation.color}">
          </div>
          <div class="annotation-text-wrapper">
            <label>Note:</label>
            <textarea class="annotation-text">${escapeHtml(annotation.text)}</textarea>
          </div>
          <div class="annotation-meta">
            <span>Created by ${escapeHtml(annotation.userId)}</span>
            <span>${formatDate(annotation.createdAt)}</span>
          </div>
        </div>
        <div class="discussion-section">
          <h4>Discussion (${GetDiscussionThread(annotation.id).length})</h4>
          <div class="comment-list" id="comment-list-${annotation.id}"></div>
          <div class="comment-input-wrapper">
            <textarea class="comment-input" placeholder="Add a comment..."></textarea>
            <button class="comment-submit">Post</button>
          </div>
        </div>
        <div class="panel-actions">
          <button class="btn-save">Save Changes</button>
          <button class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  `;

  panel.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
  `;

  document.body.appendChild(panel);

  // Render comments
  renderComments(annotation.id);

  // Event listeners
  panel.querySelector('.panel-close').addEventListener('click', () => panel.remove());
  panel.querySelector('.panel-overlay').addEventListener('click', () => panel.remove());

  panel.querySelector('.btn-save').addEventListener('click', () => {
    const newText = panel.querySelector('.annotation-text').value;
    const newColor = panel.querySelector('.color-picker').value;
    UpdateAnnotation(annotation.id, { text: newText, color: newColor });
    panel.remove();
  });

  panel.querySelector('.btn-delete').addEventListener('click', () => {
    if (confirm('Delete this annotation?')) {
      DeleteAnnotation(annotation.id);
      panel.remove();
    }
  });

  panel.querySelector('.comment-submit').addEventListener('click', () => {
    const commentText = panel.querySelector('.comment-input').value.trim();
    if (commentText) {
      ThreadComment(annotation.id, commentText);
      panel.querySelector('.comment-input').value = '';
      renderComments(annotation.id);
    }
  });
}

function renderComments(annotationId) {
  const commentList = document.getElementById(`comment-list-${annotationId}`);
  if (!commentList) return;

  const comments = GetDiscussionThread(annotationId);
  commentList.innerHTML = comments.map(comment => `
    <div class="comment-item" data-comment-id="${comment.id}">
      <div class="comment-header">
        <span class="comment-user">${escapeHtml(comment.userId)}</span>
        <span class="comment-date">${formatDate(comment.createdAt)}</span>
      </div>
      <div class="comment-text">${escapeHtml(comment.text)}</div>
      <div class="comment-reactions">
        ${comment.reactions.map(r => `<span class="reaction">${r.emoji}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// ============================================================================
// Annotation Creator Tool
// ============================================================================

/**
 * Create annotation tool for selecting regions
 * @param {HTMLElement} container - Parent container
 * @param {string} itemId - Item ID
 * @param {Object} options - Tool options
 * @returns {Object} Tool controller
 */
export function createAnnotationTool(container, itemId, options = {}) {
  let isSelecting = false;
  let startX, startY;
  let selectionBox = null;

  function startSelection(e) {
    if (!isSelecting) return;

    const rect = container.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    selectionBox = document.createElement('div');
    selectionBox.className = 'annotation-selection-box';
    selectionBox.style.cssText = `
      position: absolute;
      border: 2px dashed ${options.color || '#FFEB3B'};
      background: ${options.color || '#FFEB3B'}22;
      pointer-events: none;
      z-index: 9999;
    `;
    container.appendChild(selectionBox);
  }

  function updateSelection(e) {
    if (!selectionBox) return;

    const rect = container.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionBox.style.left = `${x}px`;
    selectionBox.style.top = `${y}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
  }

  function endSelection(e) {
    if (!selectionBox) return;

    const rect = container.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const region = {
      x: Math.min(startX, currentX),
      y: Math.min(startY, currentY),
      width: Math.abs(currentX - startX),
      height: Math.abs(currentY - startY),
    };

    selectionBox.remove();
    selectionBox = null;

    // Only create annotation if region is significant
    if (region.width > 10 && region.height > 10) {
      promptForAnnotation(itemId, region, options.color);
    }
  }

  function activate() {
    isSelecting = true;
    container.style.cursor = 'crosshair';
    container.addEventListener('mousedown', startSelection);
    container.addEventListener('mousemove', updateSelection);
    container.addEventListener('mouseup', endSelection);
  }

  function deactivate() {
    isSelecting = false;
    container.style.cursor = '';
    container.removeEventListener('mousedown', startSelection);
    container.removeEventListener('mousemove', updateSelection);
    container.removeEventListener('mouseup', endSelection);
    if (selectionBox) {
      selectionBox.remove();
      selectionBox = null;
    }
  }

  return {
    activate,
    deactivate,
    isActive: () => isSelecting,
  };
}

function promptForAnnotation(itemId, region, color) {
  const modal = document.createElement('div');
  modal.className = 'annotation-prompt-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <h3>Add Annotation</h3>
      <textarea class="annotation-input" placeholder="Enter your note..."></textarea>
      <div class="modal-actions">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-create">Create</button>
      </div>
    </div>
  `;

  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10001;
  `;

  document.body.appendChild(modal);

  modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());

  modal.querySelector('.btn-create').addEventListener('click', () => {
    const text = modal.querySelector('.annotation-input').value.trim();
    if (text) {
      CreateAnnotation(itemId, region, text, color);
      modal.remove();
    }
  });

  modal.querySelector('.annotation-input').focus();
}

// ============================================================================
// Utility Functions
// ============================================================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// Export
// ============================================================================

export default {
  createHighlightOverlay,
  createAnnotationTool,
};
