/**
 * Bookmark and Collection UI Components
 */

import {
  AddBookmark,
  RemoveBookmark,
  GetBookmarksByFolder,
  GetAllFolders,
  CreateCollection,
  GetCollection,
  GetCollectionsByUser,
  AddItemToCollection,
  RemoveItemFromCollection,
  ShareCollection,
  HasPermission,
} from '../annotations.js';
import { sharedDB } from '../sharedDB.js';

// ============================================================================
// Bookmark Panel Component
// ============================================================================

/**
 * Create bookmark sidebar panel
 * @param {Object} options - Panel options {userId}
 * @returns {HTMLElement}
 */
export function createBookmarkPanel(options = {}) {
  const panel = document.createElement('div');
  panel.className = 'bookmark-panel';
  panel.innerHTML = `
    <div class="panel-header">
      <h3>Bookmarks</h3>
      <button class="btn-new-folder" title="New Folder">+</button>
    </div>
    <div class="folder-list" id="folder-list"></div>
  `;

  panel.style.cssText = `
    width: 280px;
    height: 100%;
    background: #f5f5f5;
    border-right: 1px solid #ddd;
    overflow-y: auto;
  `;

  // Render folders
  function renderFolders() {
    const folderList = panel.querySelector('#folder-list');
    const folders = GetAllFolders();

    if (folders.length === 0) {
      folderList.innerHTML = '<div class="empty-state">No folders yet</div>';
      return;
    }

    folderList.innerHTML = folders.map(folder => `
      <div class="folder-item" data-folder-name="${escapeHtml(folder.name)}">
        <div class="folder-header">
          <span class="folder-icon">📁</span>
          <span class="folder-name">${escapeHtml(folder.name)}</span>
          <span class="folder-count">${folder.itemCount}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers
    folderList.querySelectorAll('.folder-item').forEach(item => {
      item.addEventListener('click', () => {
        const folderName = item.dataset.folderName;
        showFolderContents(folderName, options.userId);
      });
    });
  }

  // New folder button
  panel.querySelector('.btn-new-folder').addEventListener('click', () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
      // Create empty folder by adding a placeholder
      AddBookmark('_placeholder_', folderName.trim(), { userId: options.userId });
      renderFolders();
    }
  });

  // Listen for bookmark changes
  sharedDB.on('bookmark:added', renderFolders);
  sharedDB.on('bookmark:removed', renderFolders);

  // Initial render
  renderFolders();

  return panel;
}

/**
 * Show folder contents in modal
 */
function showFolderContents(folderName, userId) {
  const bookmarks = GetBookmarksByFolder(folderName, userId);

  const modal = document.createElement('div');
  modal.className = 'folder-contents-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>📁 ${escapeHtml(folderName)}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="bookmark-list" id="bookmark-list">
          ${bookmarks.map(bookmark => `
            <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
              <div class="bookmark-info">
                <span class="bookmark-icon">🔖</span>
                <span class="bookmark-id">${escapeHtml(bookmark.itemId)}</span>
              </div>
              <button class="btn-remove-bookmark" data-id="${bookmark.id}">Remove</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
  `;

  document.body.appendChild(modal);

  // Close handlers
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());

  // Remove bookmark handlers
  modal.querySelectorAll('.btn-remove-bookmark').forEach(btn => {
    btn.addEventListener('click', () => {
      const bookmarkId = btn.dataset.id;
      if (confirm('Remove this bookmark?')) {
        RemoveBookmark(bookmarkId);
        modal.remove();
        showFolderContents(folderName, userId); // Refresh
      }
    });
  });
}

// ============================================================================
// Bookmark Action Button
// ============================================================================

/**
 * Create bookmark button for an item
 * @param {string} itemId - Item to bookmark
 * @param {Object} options - {userId}
 * @returns {HTMLElement}
 */
export function createBookmarkButton(itemId, options = {}) {
  const button = document.createElement('button');
  button.className = 'bookmark-action-button';
  button.innerHTML = '🔖 Bookmark';
  button.title = 'Add to bookmarks';

  button.style.cssText = `
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;

  button.addEventListener('click', () => {
    showBookmarkDialog(itemId, options.userId);
  });

  return button;
}

function showBookmarkDialog(itemId, userId) {
  const folders = GetAllFolders();

  const dialog = document.createElement('div');
  dialog.className = 'bookmark-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay"></div>
    <div class="dialog-content">
      <h3>Add to Folder</h3>
      <div class="folder-select-list">
        ${folders.map(folder => `
          <div class="folder-option" data-folder="${escapeHtml(folder.name)}">
            <span class="folder-icon">📁</span>
            <span class="folder-name">${escapeHtml(folder.name)}</span>
          </div>
        `).join('')}
      </div>
      <div class="new-folder-section">
        <input type="text" class="new-folder-input" placeholder="New folder name...">
        <button class="btn-create-folder">Create</button>
      </div>
      <button class="btn-cancel">Cancel</button>
    </div>
  `;

  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10001;
  `;

  document.body.appendChild(dialog);

  // Select existing folder
  dialog.querySelectorAll('.folder-option').forEach(option => {
    option.addEventListener('click', () => {
      const folderName = option.dataset.folder;
      AddBookmark(itemId, folderName, { userId });
      dialog.remove();
    });
  });

  // Create new folder
  dialog.querySelector('.btn-create-folder').addEventListener('click', () => {
    const folderName = dialog.querySelector('.new-folder-input').value.trim();
    if (folderName) {
      AddBookmark(itemId, folderName, { userId });
      dialog.remove();
    }
  });

  // Cancel
  dialog.querySelector('.btn-cancel').addEventListener('click', () => dialog.remove());
  dialog.querySelector('.dialog-overlay').addEventListener('click', () => dialog.remove());
}

// ============================================================================
// Collection Manager Component
// ============================================================================

/**
 * Create collection manager panel
 * @param {Object} options - {userId}
 * @returns {HTMLElement}
 */
export function createCollectionManager(options = {}) {
  const panel = document.createElement('div');
  panel.className = 'collection-manager';
  panel.innerHTML = `
    <div class="panel-header">
      <h3>Collections</h3>
      <button class="btn-new-collection">+ New</button>
    </div>
    <div class="collection-list" id="collection-list"></div>
  `;

  panel.style.cssText = `
    width: 100%;
    padding: 20px;
    background: white;
  `;

  // Render collections
  function renderCollections() {
    const collectionList = panel.querySelector('#collection-list');
    const collections = GetCollectionsByUser(options.userId);

    if (collections.length === 0) {
      collectionList.innerHTML = '<div class="empty-state">No collections yet</div>';
      return;
    }

    collectionList.innerHTML = collections.map(collection => `
      <div class="collection-card" data-collection-id="${collection.id}">
        <div class="collection-header">
          <h4>${escapeHtml(collection.name)}</h4>
          <span class="collection-badge">${collection.items.length} items</span>
        </div>
        <p class="collection-description">${escapeHtml(collection.description || '')}</p>
        <div class="collection-meta">
          <span class="collection-visibility">${collection.isPublic ? '🌍 Public' : '🔒 Private'}</span>
          <span class="collection-collaborators">${collection.collaborators.length} collaborators</span>
        </div>
        <div class="collection-actions">
          <button class="btn-view" data-id="${collection.id}">View</button>
          <button class="btn-share" data-id="${collection.id}">Share</button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    collectionList.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => {
        showCollectionDetails(btn.dataset.id);
      });
    });

    collectionList.querySelectorAll('.btn-share').forEach(btn => {
      btn.addEventListener('click', () => {
        showShareDialog(btn.dataset.id);
      });
    });
  }

  // New collection button
  panel.querySelector('.btn-new-collection').addEventListener('click', () => {
    showCreateCollectionDialog(options.userId);
  });

  // Listen for changes
  sharedDB.on('collection:created', renderCollections);
  sharedDB.on('collection:updated', renderCollections);
  sharedDB.on('collection:deleted', renderCollections);

  // Initial render
  renderCollections();

  return panel;
}

function showCreateCollectionDialog(userId) {
  const dialog = document.createElement('div');
  dialog.className = 'create-collection-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay"></div>
    <div class="dialog-content">
      <h3>Create Collection</h3>
      <div class="form-group">
        <label>Name:</label>
        <input type="text" class="collection-name-input" placeholder="My Collection">
      </div>
      <div class="form-group">
        <label>Description:</label>
        <textarea class="collection-description-input" placeholder="Optional description..."></textarea>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" class="collection-public-checkbox">
          Make public
        </label>
      </div>
      <div class="dialog-actions">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-create">Create</button>
      </div>
    </div>
  `;

  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10001;
  `;

  document.body.appendChild(dialog);

  dialog.querySelector('.btn-cancel').addEventListener('click', () => dialog.remove());
  dialog.querySelector('.dialog-overlay').addEventListener('click', () => dialog.remove());

  dialog.querySelector('.btn-create').addEventListener('click', () => {
    const name = dialog.querySelector('.collection-name-input').value.trim();
    const description = dialog.querySelector('.collection-description-input').value.trim();
    const isPublic = dialog.querySelector('.collection-public-checkbox').checked;

    if (name) {
      CreateCollection(name, [], { description, ownerId: userId, isPublic });
      dialog.remove();
    }
  });
}

function showCollectionDetails(collectionId) {
  const collection = GetCollection(collectionId);
  if (!collection) return;

  const modal = document.createElement('div');
  modal.className = 'collection-details-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>${escapeHtml(collection.name)}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p class="collection-description">${escapeHtml(collection.description || 'No description')}</p>
        <div class="collection-items">
          <h4>Items (${collection.items.length})</h4>
          <div class="item-list">
            ${collection.items.map(itemId => `
              <div class="item-card">
                <span class="item-id">${escapeHtml(itemId)}</span>
                <button class="btn-remove-item" data-item="${itemId}">Remove</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());

  modal.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      RemoveItemFromCollection(collectionId, btn.dataset.item);
      modal.remove();
      showCollectionDetails(collectionId); // Refresh
    });
  });
}

function showShareDialog(collectionId) {
  const dialog = document.createElement('div');
  dialog.className = 'share-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay"></div>
    <div class="dialog-content">
      <h3>Share Collection</h3>
      <div class="form-group">
        <label>User ID:</label>
        <input type="text" class="user-id-input" placeholder="Enter user ID">
      </div>
      <div class="form-group">
        <label>Role:</label>
        <select class="role-select">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
      </div>
      <div class="dialog-actions">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-share">Share</button>
      </div>
    </div>
  `;

  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10002;
  `;

  document.body.appendChild(dialog);

  dialog.querySelector('.btn-cancel').addEventListener('click', () => dialog.remove());
  dialog.querySelector('.dialog-overlay').addEventListener('click', () => dialog.remove());

  dialog.querySelector('.btn-share').addEventListener('click', () => {
    const userId = dialog.querySelector('.user-id-input').value.trim();
    const role = dialog.querySelector('.role-select').value;

    if (userId) {
      ShareCollection(collectionId, [{ userId, role }]);
      alert('Collection shared successfully!');
      dialog.remove();
    }
  });
}

// ============================================================================
// Collection Add Button
// ============================================================================

/**
 * Create button to add item to collection
 * @param {string} itemId
 * @param {Object} options - {userId}
 * @returns {HTMLElement}
 */
export function createAddToCollectionButton(itemId, options = {}) {
  const button = document.createElement('button');
  button.className = 'add-to-collection-button';
  button.innerHTML = '📚 Add to Collection';
  button.title = 'Add to collection';

  button.style.cssText = `
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;

  button.addEventListener('click', () => {
    showAddToCollectionDialog(itemId, options.userId);
  });

  return button;
}

function showAddToCollectionDialog(itemId, userId) {
  const collections = GetCollectionsByUser(userId);

  const dialog = document.createElement('div');
  dialog.className = 'add-to-collection-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay"></div>
    <div class="dialog-content">
      <h3>Add to Collection</h3>
      <div class="collection-select-list">
        ${collections.map(collection => `
          <div class="collection-option" data-collection-id="${collection.id}">
            <span class="collection-name">${escapeHtml(collection.name)}</span>
            <span class="collection-count">${collection.items.length} items</span>
          </div>
        `).join('')}
      </div>
      <button class="btn-cancel">Cancel</button>
    </div>
  `;

  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10001;
  `;

  document.body.appendChild(dialog);

  dialog.querySelectorAll('.collection-option').forEach(option => {
    option.addEventListener('click', () => {
      const collectionId = option.dataset.collectionId;
      AddItemToCollection(collectionId, itemId);
      alert('Item added to collection!');
      dialog.remove();
    });
  });

  dialog.querySelector('.btn-cancel').addEventListener('click', () => dialog.remove());
  dialog.querySelector('.dialog-overlay').addEventListener('click', () => dialog.remove());
}

// ============================================================================
// Utility Functions
// ============================================================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// Export
// ============================================================================

export default {
  createBookmarkPanel,
  createBookmarkButton,
  createCollectionManager,
  createAddToCollectionButton,
};
