/**
 * Annotation and Bookmark System
 * Features: Highlights, sticky notes, collections, sharing, discussions
 */

import { nanoid } from 'nanoid';
import { sharedDB } from './sharedDB.js';

// ============================================================================
// Data Models
// ============================================================================

/**
 * Annotation data structure
 * @typedef {Object} Annotation
 * @property {string} id - Unique annotation ID
 * @property {string} itemId - Reference to formula/theorem item
 * @property {Object} region - Highlighted region {x, y, width, height}
 * @property {string} text - Annotation text content
 * @property {string} color - Highlight color (hex)
 * @property {string} userId - Creator user ID
 * @property {number} createdAt - Timestamp
 * @property {number} updatedAt - Timestamp
 * @property {string[]} tags - Optional tags
 */

/**
 * Bookmark data structure
 * @typedef {Object} Bookmark
 * @property {string} id - Unique bookmark ID
 * @property {string} itemId - Reference to formula/theorem item
 * @property {string} folderName - Folder/category name
 * @property {string} userId - User ID
 * @property {number} createdAt - Timestamp
 * @property {Object} metadata - Additional metadata
 */

/**
 * Collection data structure
 * @typedef {Object} Collection
 * @property {string} id - Unique collection ID
 * @property {string} name - Collection name
 * @property {string} description - Optional description
 * @property {string[]} items - Array of item IDs
 * @property {string} ownerId - Owner user ID
 * @property {Object[]} collaborators - Array of {userId, role}
 * @property {boolean} isPublic - Public/private flag
 * @property {number} createdAt - Timestamp
 * @property {number} updatedAt - Timestamp
 * @property {string[]} tags - Optional tags
 */

/**
 * Permission data structure
 * @typedef {Object} Permission
 * @property {string} collectionId - Collection ID
 * @property {string} userId - User ID
 * @property {string} role - 'owner' | 'editor' | 'viewer'
 * @property {number} grantedAt - Timestamp
 */

/**
 * Discussion thread data structure
 * @typedef {Object} Comment
 * @property {string} id - Unique comment ID
 * @property {string} annotationId - Parent annotation ID
 * @property {string} userId - Commenter user ID
 * @property {string} text - Comment text
 * @property {string} parentId - Parent comment ID (for nested threads)
 * @property {number} createdAt - Timestamp
 * @property {number} updatedAt - Timestamp
 * @property {Object[]} reactions - Array of {userId, emoji}
 */

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  ANNOTATIONS: 'annotations',
  BOOKMARKS: 'bookmarks',
  COLLECTIONS: 'collections',
  PERMISSIONS: 'permissions',
  COMMENTS: 'comments',
  FOLDERS: 'bookmark_folders',
};

// ============================================================================
// Annotation Functions
// ============================================================================

/**
 * Create a new annotation with highlighted region
 * @param {string} itemId - Formula/theorem item ID
 * @param {Object} region - Highlight region {x, y, width, height}
 * @param {string} text - Annotation text
 * @param {string} color - Highlight color (default: yellow)
 * @param {Object} options - Additional options {userId, tags}
 * @returns {string} annotationId
 */
export function CreateAnnotation(itemId, region, text, color = '#FFEB3B', options = {}) {
  if (!itemId || !region || !text) {
    throw new Error('itemId, region, and text are required');
  }

  const annotationId = nanoid();
  const now = Date.now();

  const annotation = {
    id: annotationId,
    itemId,
    region: {
      x: region.x || 0,
      y: region.y || 0,
      width: region.width || 0,
      height: region.height || 0,
    },
    text,
    color,
    userId: options.userId || 'anonymous',
    createdAt: now,
    updatedAt: now,
    tags: options.tags || [],
  };

  // Store in SharedDB
  const annotations = sharedDB.get(STORAGE_KEYS.ANNOTATIONS) || {};
  annotations[annotationId] = annotation;
  sharedDB.set(STORAGE_KEYS.ANNOTATIONS, annotations);

  // Emit event for real-time sync
  sharedDB.emit('annotation:created', annotation);

  return annotationId;
}

/**
 * Get annotation by ID
 * @param {string} annotationId
 * @returns {Annotation|null}
 */
export function GetAnnotation(annotationId) {
  const annotations = sharedDB.get(STORAGE_KEYS.ANNOTATIONS) || {};
  return annotations[annotationId] || null;
}

/**
 * Get all annotations for an item
 * @param {string} itemId
 * @returns {Annotation[]}
 */
export function GetAnnotationsByItem(itemId) {
  const annotations = sharedDB.get(STORAGE_KEYS.ANNOTATIONS) || {};
  return Object.values(annotations).filter(ann => ann.itemId === itemId);
}

/**
 * Update annotation
 * @param {string} annotationId
 * @param {Object} updates - Fields to update
 * @returns {boolean}
 */
export function UpdateAnnotation(annotationId, updates) {
  const annotations = sharedDB.get(STORAGE_KEYS.ANNOTATIONS) || {};
  const annotation = annotations[annotationId];

  if (!annotation) {
    return false;
  }

  const updatedAnnotation = {
    ...annotation,
    ...updates,
    id: annotationId, // Prevent ID change
    updatedAt: Date.now(),
  };

  annotations[annotationId] = updatedAnnotation;
  sharedDB.set(STORAGE_KEYS.ANNOTATIONS, annotations);
  sharedDB.emit('annotation:updated', updatedAnnotation);

  return true;
}

/**
 * Delete annotation
 * @param {string} annotationId
 * @returns {boolean}
 */
export function DeleteAnnotation(annotationId) {
  const annotations = sharedDB.get(STORAGE_KEYS.ANNOTATIONS) || {};

  if (!annotations[annotationId]) {
    return false;
  }

  delete annotations[annotationId];
  sharedDB.set(STORAGE_KEYS.ANNOTATIONS, annotations);

  // Also delete associated comments
  const comments = sharedDB.get(STORAGE_KEYS.COMMENTS) || {};
  const updatedComments = Object.fromEntries(
    Object.entries(comments).filter(([_, comment]) => comment.annotationId !== annotationId)
  );
  sharedDB.set(STORAGE_KEYS.COMMENTS, updatedComments);

  sharedDB.emit('annotation:deleted', { annotationId });

  return true;
}

// ============================================================================
// Bookmark Functions
// ============================================================================

/**
 * Add bookmark to a folder
 * @param {string} itemId - Formula/theorem item ID
 * @param {string} folderName - Folder/category name
 * @param {Object} options - Additional options {userId, metadata}
 * @returns {string} bookmarkId
 */
export function AddBookmark(itemId, folderName, options = {}) {
  if (!itemId || !folderName) {
    throw new Error('itemId and folderName are required');
  }

  const bookmarkId = nanoid();
  const now = Date.now();

  const bookmark = {
    id: bookmarkId,
    itemId,
    folderName,
    userId: options.userId || 'anonymous',
    createdAt: now,
    metadata: options.metadata || {},
  };

  // Store bookmark
  const bookmarks = sharedDB.get(STORAGE_KEYS.BOOKMARKS) || {};
  bookmarks[bookmarkId] = bookmark;
  sharedDB.set(STORAGE_KEYS.BOOKMARKS, bookmarks);

  // Update folder list
  const folders = sharedDB.get(STORAGE_KEYS.FOLDERS) || {};
  if (!folders[folderName]) {
    folders[folderName] = {
      name: folderName,
      createdAt: now,
      itemCount: 0,
    };
  }
  folders[folderName].itemCount++;
  sharedDB.set(STORAGE_KEYS.FOLDERS, folders);

  sharedDB.emit('bookmark:added', bookmark);

  return bookmarkId;
}

/**
 * Get bookmark by ID
 * @param {string} bookmarkId
 * @returns {Bookmark|null}
 */
export function GetBookmark(bookmarkId) {
  const bookmarks = sharedDB.get(STORAGE_KEYS.BOOKMARKS) || {};
  return bookmarks[bookmarkId] || null;
}

/**
 * Get all bookmarks in a folder
 * @param {string} folderName
 * @param {string} userId - Optional user filter
 * @returns {Bookmark[]}
 */
export function GetBookmarksByFolder(folderName, userId = null) {
  const bookmarks = sharedDB.get(STORAGE_KEYS.BOOKMARKS) || {};
  return Object.values(bookmarks).filter(
    bm => bm.folderName === folderName && (!userId || bm.userId === userId)
  );
}

/**
 * Get all folders
 * @returns {Object[]} Array of folder objects
 */
export function GetAllFolders() {
  const folders = sharedDB.get(STORAGE_KEYS.FOLDERS) || {};
  return Object.values(folders);
}

/**
 * Remove bookmark
 * @param {string} bookmarkId
 * @returns {boolean}
 */
export function RemoveBookmark(bookmarkId) {
  const bookmarks = sharedDB.get(STORAGE_KEYS.BOOKMARKS) || {};
  const bookmark = bookmarks[bookmarkId];

  if (!bookmark) {
    return false;
  }

  // Update folder count
  const folders = sharedDB.get(STORAGE_KEYS.FOLDERS) || {};
  if (folders[bookmark.folderName]) {
    folders[bookmark.folderName].itemCount--;
    if (folders[bookmark.folderName].itemCount <= 0) {
      delete folders[bookmark.folderName];
    }
    sharedDB.set(STORAGE_KEYS.FOLDERS, folders);
  }

  delete bookmarks[bookmarkId];
  sharedDB.set(STORAGE_KEYS.BOOKMARKS, bookmarks);
  sharedDB.emit('bookmark:removed', { bookmarkId });

  return true;
}

// ============================================================================
// Collection Functions
// ============================================================================

/**
 * Create a new collection
 * @param {string} name - Collection name
 * @param {string[]} items - Array of item IDs
 * @param {Object} options - Additional options {description, ownerId, tags, isPublic}
 * @returns {string} collectionId
 */
export function CreateCollection(name, items = [], options = {}) {
  if (!name) {
    throw new Error('Collection name is required');
  }

  const collectionId = nanoid();
  const now = Date.now();

  const collection = {
    id: collectionId,
    name,
    description: options.description || '',
    items: Array.isArray(items) ? items : [],
    ownerId: options.ownerId || 'anonymous',
    collaborators: [],
    isPublic: options.isPublic || false,
    createdAt: now,
    updatedAt: now,
    tags: options.tags || [],
  };

  // Store collection
  const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};
  collections[collectionId] = collection;
  sharedDB.set(STORAGE_KEYS.COLLECTIONS, collections);

  // Create owner permission
  AddPermission(collectionId, collection.ownerId, 'owner');

  sharedDB.emit('collection:created', collection);

  return collectionId;
}

/**
 * Get collection by ID
 * @param {string} collectionId
 * @returns {Collection|null}
 */
export function GetCollection(collectionId) {
  const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};
  return collections[collectionId] || null;
}

/**
 * Get all collections for a user
 * @param {string} userId
 * @returns {Collection[]}
 */
export function GetCollectionsByUser(userId) {
  const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};
  const permissions = sharedDB.get(STORAGE_KEYS.PERMISSIONS) || {};

  return Object.values(collections).filter(col => {
    const permKey = `${col.id}:${userId}`;
    return col.ownerId === userId || permissions[permKey];
  });
}

/**
 * Update collection
 * @param {string} collectionId
 * @param {Object} updates - Fields to update
 * @returns {boolean}
 */
export function UpdateCollection(collectionId, updates) {
  const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};
  const collection = collections[collectionId];

  if (!collection) {
    return false;
  }

  const updatedCollection = {
    ...collection,
    ...updates,
    id: collectionId, // Prevent ID change
    updatedAt: Date.now(),
  };

  collections[collectionId] = updatedCollection;
  sharedDB.set(STORAGE_KEYS.COLLECTIONS, collections);
  sharedDB.emit('collection:updated', updatedCollection);

  return true;
}

/**
 * Add item to collection
 * @param {string} collectionId
 * @param {string} itemId
 * @returns {boolean}
 */
export function AddItemToCollection(collectionId, itemId) {
  const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};
  const collection = collections[collectionId];

  if (!collection || collection.items.includes(itemId)) {
    return false;
  }

  collection.items.push(itemId);
  collection.updatedAt = Date.now();
  sharedDB.set(STORAGE_KEYS.COLLECTIONS, collections);
  sharedDB.emit('collection:item_added', { collectionId, itemId });

  return true;
}

/**
 * Remove item from collection
 * @param {string} collectionId
 * @param {string} itemId
 * @returns {boolean}
 */
export function RemoveItemFromCollection(collectionId, itemId) {
  const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};
  const collection = collections[collectionId];

  if (!collection) {
    return false;
  }

  collection.items = collection.items.filter(id => id !== itemId);
  collection.updatedAt = Date.now();
  sharedDB.set(STORAGE_KEYS.COLLECTIONS, collections);
  sharedDB.emit('collection:item_removed', { collectionId, itemId });

  return true;
}

/**
 * Delete collection
 * @param {string} collectionId
 * @returns {boolean}
 */
export function DeleteCollection(collectionId) {
  const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};

  if (!collections[collectionId]) {
    return false;
  }

  delete collections[collectionId];
  sharedDB.set(STORAGE_KEYS.COLLECTIONS, collections);

  // Remove all permissions
  const permissions = sharedDB.get(STORAGE_KEYS.PERMISSIONS) || {};
  const updatedPermissions = Object.fromEntries(
    Object.entries(permissions).filter(([key, _]) => !key.startsWith(`${collectionId}:`))
  );
  sharedDB.set(STORAGE_KEYS.PERMISSIONS, updatedPermissions);

  sharedDB.emit('collection:deleted', { collectionId });

  return true;
}

// ============================================================================
// Permission/Sharing Functions
// ============================================================================

/**
 * Add permission (internal helper)
 * @private
 */
function AddPermission(collectionId, userId, role) {
  const permissions = sharedDB.get(STORAGE_KEYS.PERMISSIONS) || {};
  const permKey = `${collectionId}:${userId}`;

  permissions[permKey] = {
    collectionId,
    userId,
    role,
    grantedAt: Date.now(),
  };

  sharedDB.set(STORAGE_KEYS.PERMISSIONS, permissions);
}

/**
 * Share collection with users
 * @param {string} collectionId
 * @param {Array} users - Array of {userId, role} objects
 * @returns {Permission[]} Array of created permissions
 */
export function ShareCollection(collectionId, users) {
  const collection = GetCollection(collectionId);

  if (!collection) {
    throw new Error('Collection not found');
  }

  const permissions = [];

  users.forEach(({ userId, role = 'viewer' }) => {
    if (!userId) return;

    // Validate role
    const validRoles = ['owner', 'editor', 'viewer'];
    const validRole = validRoles.includes(role) ? role : 'viewer';

    AddPermission(collectionId, userId, validRole);

    permissions.push({
      collectionId,
      userId,
      role: validRole,
      grantedAt: Date.now(),
    });

    // Add to collaborators list
    const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};
    const col = collections[collectionId];
    if (col && !col.collaborators.find(c => c.userId === userId)) {
      col.collaborators.push({ userId, role: validRole });
      sharedDB.set(STORAGE_KEYS.COLLECTIONS, collections);
    }
  });

  sharedDB.emit('collection:shared', { collectionId, permissions });

  return permissions;
}

/**
 * Get permissions for a collection
 * @param {string} collectionId
 * @returns {Permission[]}
 */
export function GetCollectionPermissions(collectionId) {
  const permissions = sharedDB.get(STORAGE_KEYS.PERMISSIONS) || {};
  return Object.values(permissions).filter(perm => perm.collectionId === collectionId);
}

/**
 * Check if user has permission for collection
 * @param {string} collectionId
 * @param {string} userId
 * @param {string} requiredRole - Minimum required role
 * @returns {boolean}
 */
export function HasPermission(collectionId, userId, requiredRole = 'viewer') {
  const collection = GetCollection(collectionId);

  if (!collection) {
    return false;
  }

  // Owner has all permissions
  if (collection.ownerId === userId) {
    return true;
  }

  // Public collections allow viewing
  if (collection.isPublic && requiredRole === 'viewer') {
    return true;
  }

  const permissions = sharedDB.get(STORAGE_KEYS.PERMISSIONS) || {};
  const permKey = `${collectionId}:${userId}`;
  const permission = permissions[permKey];

  if (!permission) {
    return false;
  }

  // Role hierarchy: owner > editor > viewer
  const roleLevel = { owner: 3, editor: 2, viewer: 1 };
  return roleLevel[permission.role] >= roleLevel[requiredRole];
}

/**
 * Revoke permission
 * @param {string} collectionId
 * @param {string} userId
 * @returns {boolean}
 */
export function RevokePermission(collectionId, userId) {
  const permissions = sharedDB.get(STORAGE_KEYS.PERMISSIONS) || {};
  const permKey = `${collectionId}:${userId}`;

  if (!permissions[permKey]) {
    return false;
  }

  delete permissions[permKey];
  sharedDB.set(STORAGE_KEYS.PERMISSIONS, permissions);

  // Remove from collaborators
  const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};
  const collection = collections[collectionId];
  if (collection) {
    collection.collaborators = collection.collaborators.filter(c => c.userId !== userId);
    sharedDB.set(STORAGE_KEYS.COLLECTIONS, collections);
  }

  sharedDB.emit('permission:revoked', { collectionId, userId });

  return true;
}

// ============================================================================
// Discussion Thread Functions
// ============================================================================

/**
 * Add comment to annotation thread
 * @param {string} annotationId
 * @param {string} commentText
 * @param {Object} options - Additional options {userId, parentId}
 * @returns {Object} Discussion object with comment
 */
export function ThreadComment(annotationId, commentText, options = {}) {
  if (!annotationId || !commentText) {
    throw new Error('annotationId and commentText are required');
  }

  const annotation = GetAnnotation(annotationId);
  if (!annotation) {
    throw new Error('Annotation not found');
  }

  const commentId = nanoid();
  const now = Date.now();

  const comment = {
    id: commentId,
    annotationId,
    userId: options.userId || 'anonymous',
    text: commentText,
    parentId: options.parentId || null,
    createdAt: now,
    updatedAt: now,
    reactions: [],
  };

  // Store comment
  const comments = sharedDB.get(STORAGE_KEYS.COMMENTS) || {};
  comments[commentId] = comment;
  sharedDB.set(STORAGE_KEYS.COMMENTS, comments);

  sharedDB.emit('comment:added', comment);

  // Return discussion object
  return {
    comment,
    thread: GetDiscussionThread(annotationId),
  };
}

/**
 * Get all comments for an annotation
 * @param {string} annotationId
 * @returns {Comment[]}
 */
export function GetDiscussionThread(annotationId) {
  const comments = sharedDB.get(STORAGE_KEYS.COMMENTS) || {};
  return Object.values(comments)
    .filter(comment => comment.annotationId === annotationId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Update comment
 * @param {string} commentId
 * @param {string} newText
 * @returns {boolean}
 */
export function UpdateComment(commentId, newText) {
  const comments = sharedDB.get(STORAGE_KEYS.COMMENTS) || {};
  const comment = comments[commentId];

  if (!comment) {
    return false;
  }

  comment.text = newText;
  comment.updatedAt = Date.now();
  sharedDB.set(STORAGE_KEYS.COMMENTS, comments);
  sharedDB.emit('comment:updated', comment);

  return true;
}

/**
 * Delete comment
 * @param {string} commentId
 * @returns {boolean}
 */
export function DeleteComment(commentId) {
  const comments = sharedDB.get(STORAGE_KEYS.COMMENTS) || {};

  if (!comments[commentId]) {
    return false;
  }

  // Also delete child comments
  const childComments = Object.values(comments).filter(c => c.parentId === commentId);
  childComments.forEach(child => delete comments[child.id]);

  delete comments[commentId];
  sharedDB.set(STORAGE_KEYS.COMMENTS, comments);
  sharedDB.emit('comment:deleted', { commentId });

  return true;
}

/**
 * Add reaction to comment
 * @param {string} commentId
 * @param {string} emoji
 * @param {string} userId
 * @returns {boolean}
 */
export function AddReaction(commentId, emoji, userId = 'anonymous') {
  const comments = sharedDB.get(STORAGE_KEYS.COMMENTS) || {};
  const comment = comments[commentId];

  if (!comment) {
    return false;
  }

  // Check if user already reacted with this emoji
  const existingReaction = comment.reactions.find(
    r => r.userId === userId && r.emoji === emoji
  );

  if (existingReaction) {
    return false;
  }

  comment.reactions.push({ userId, emoji });
  sharedDB.set(STORAGE_KEYS.COMMENTS, comments);
  sharedDB.emit('reaction:added', { commentId, userId, emoji });

  return true;
}

/**
 * Remove reaction from comment
 * @param {string} commentId
 * @param {string} emoji
 * @param {string} userId
 * @returns {boolean}
 */
export function RemoveReaction(commentId, emoji, userId = 'anonymous') {
  const comments = sharedDB.get(STORAGE_KEYS.COMMENTS) || {};
  const comment = comments[commentId];

  if (!comment) {
    return false;
  }

  const initialLength = comment.reactions.length;
  comment.reactions = comment.reactions.filter(
    r => !(r.userId === userId && r.emoji === emoji)
  );

  if (comment.reactions.length === initialLength) {
    return false;
  }

  sharedDB.set(STORAGE_KEYS.COMMENTS, comments);
  sharedDB.emit('reaction:removed', { commentId, userId, emoji });

  return true;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Search annotations by text
 * @param {string} query
 * @param {Object} filters - Optional filters {itemId, userId, color}
 * @returns {Annotation[]}
 */
export function SearchAnnotations(query, filters = {}) {
  const annotations = sharedDB.get(STORAGE_KEYS.ANNOTATIONS) || {};
  const lowerQuery = query.toLowerCase();

  return Object.values(annotations).filter(ann => {
    const matchesQuery = ann.text.toLowerCase().includes(lowerQuery) ||
      ann.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

    const matchesFilters =
      (!filters.itemId || ann.itemId === filters.itemId) &&
      (!filters.userId || ann.userId === filters.userId) &&
      (!filters.color || ann.color === filters.color);

    return matchesQuery && matchesFilters;
  });
}

/**
 * Get statistics for user activity
 * @param {string} userId
 * @returns {Object} Statistics object
 */
export function GetUserStatistics(userId) {
  const annotations = sharedDB.get(STORAGE_KEYS.ANNOTATIONS) || {};
  const bookmarks = sharedDB.get(STORAGE_KEYS.BOOKMARKS) || {};
  const collections = sharedDB.get(STORAGE_KEYS.COLLECTIONS) || {};
  const comments = sharedDB.get(STORAGE_KEYS.COMMENTS) || {};

  return {
    annotationCount: Object.values(annotations).filter(a => a.userId === userId).length,
    bookmarkCount: Object.values(bookmarks).filter(b => b.userId === userId).length,
    collectionCount: Object.values(collections).filter(c => c.ownerId === userId).length,
    commentCount: Object.values(comments).filter(c => c.userId === userId).length,
  };
}

/**
 * Export collection data
 * @param {string} collectionId
 * @returns {Object} Complete collection data with items and metadata
 */
export function ExportCollection(collectionId) {
  const collection = GetCollection(collectionId);
  if (!collection) {
    return null;
  }

  const permissions = GetCollectionPermissions(collectionId);

  return {
    collection,
    permissions,
    exportedAt: Date.now(),
    version: '1.0',
  };
}

/**
 * Import collection data
 * @param {Object} data - Exported collection data
 * @param {string} ownerId - New owner ID
 * @returns {string} New collection ID
 */
export function ImportCollection(data, ownerId) {
  if (!data || !data.collection) {
    throw new Error('Invalid collection data');
  }

  const { collection } = data;

  return CreateCollection(collection.name, collection.items, {
    description: collection.description,
    ownerId,
    tags: collection.tags,
    isPublic: false, // Import as private by default
  });
}

// ============================================================================
// Export all functions
// ============================================================================

export default {
  // Annotations
  CreateAnnotation,
  GetAnnotation,
  GetAnnotationsByItem,
  UpdateAnnotation,
  DeleteAnnotation,
  SearchAnnotations,

  // Bookmarks
  AddBookmark,
  GetBookmark,
  GetBookmarksByFolder,
  GetAllFolders,
  RemoveBookmark,

  // Collections
  CreateCollection,
  GetCollection,
  GetCollectionsByUser,
  UpdateCollection,
  AddItemToCollection,
  RemoveItemFromCollection,
  DeleteCollection,
  ExportCollection,
  ImportCollection,

  // Permissions
  ShareCollection,
  GetCollectionPermissions,
  HasPermission,
  RevokePermission,

  // Discussions
  ThreadComment,
  GetDiscussionThread,
  UpdateComment,
  DeleteComment,
  AddReaction,
  RemoveReaction,

  // Utilities
  GetUserStatistics,
};
