# Annotation and Bookmark System Documentation

## Overview

The Formula Nebula annotation system provides a comprehensive solution for highlighting, annotating, bookmarking, and organizing mathematical formulas and theorems. The system includes real-time collaboration features, discussion threads, and collection sharing.

## Architecture

```
src/
├── annotations.js           # Core business logic and data management
├── components/
│   ├── AnnotationUI.js     # Highlight overlays and annotation tools
│   └── BookmarkUI.js       # Bookmark and collection interfaces
├── styles/
│   └── annotations.css     # Complete styling for all components
└── sharedDB.js             # Shared state management (required dependency)
```

## Data Models

### 1. Annotation

Represents a highlighted region with attached notes.

```javascript
{
  id: string,              // Unique annotation ID (nanoid)
  itemId: string,          // Reference to formula/theorem
  region: {
    x: number,            // Left position (px)
    y: number,            // Top position (px)
    width: number,        // Width (px)
    height: number        // Height (px)
  },
  text: string,           // Annotation text content
  color: string,          // Highlight color (hex)
  userId: string,         // Creator user ID
  createdAt: number,      // Unix timestamp
  updatedAt: number,      // Unix timestamp
  tags: string[]          // Optional tags
}
```

### 2. Bookmark

Represents a saved item organized in folders.

```javascript
{
  id: string,             // Unique bookmark ID
  itemId: string,         // Reference to formula/theorem
  folderName: string,     // Folder/category name
  userId: string,         // User ID
  createdAt: number,      // Unix timestamp
  metadata: object        // Additional metadata
}
```

### 3. Collection

Represents a curated set of related items.

```javascript
{
  id: string,                    // Unique collection ID
  name: string,                  // Collection name
  description: string,           // Optional description
  items: string[],               // Array of item IDs
  ownerId: string,               // Owner user ID
  collaborators: Array<{         // Collaborator list
    userId: string,
    role: 'owner' | 'editor' | 'viewer'
  }>,
  isPublic: boolean,             // Public/private flag
  createdAt: number,             // Unix timestamp
  updatedAt: number,             // Unix timestamp
  tags: string[]                 // Optional tags
}
```

### 4. Permission

Represents access rights to collections.

```javascript
{
  collectionId: string,                    // Collection ID
  userId: string,                          // User ID
  role: 'owner' | 'editor' | 'viewer',    // Permission level
  grantedAt: number                        // Unix timestamp
}
```

### 5. Comment

Represents a discussion thread entry.

```javascript
{
  id: string,              // Unique comment ID
  annotationId: string,    // Parent annotation ID
  userId: string,          // Commenter user ID
  text: string,            // Comment text
  parentId: string | null, // Parent comment ID (for nesting)
  createdAt: number,       // Unix timestamp
  updatedAt: number,       // Unix timestamp
  reactions: Array<{       // Reaction list
    userId: string,
    emoji: string
  }>
}
```

## Core API Functions

### Annotation Functions

#### `CreateAnnotation(itemId, region, text, color, options)`
Creates a new annotation with a highlighted region.

```javascript
const annotationId = CreateAnnotation(
  'theorem-123',
  { x: 10, y: 20, width: 200, height: 50 },
  'This is an important part!',
  '#FFEB3B',
  { userId: 'user-1', tags: ['important'] }
);
```

**Returns:** `string` - Annotation ID

#### `GetAnnotation(annotationId)`
Retrieves a single annotation by ID.

```javascript
const annotation = GetAnnotation('ann-xyz');
```

**Returns:** `Annotation | null`

#### `GetAnnotationsByItem(itemId)`
Gets all annotations for a specific item.

```javascript
const annotations = GetAnnotationsByItem('theorem-123');
```

**Returns:** `Annotation[]`

#### `UpdateAnnotation(annotationId, updates)`
Updates annotation fields.

```javascript
UpdateAnnotation('ann-xyz', {
  text: 'Updated note',
  color: '#4CAF50'
});
```

**Returns:** `boolean` - Success status

#### `DeleteAnnotation(annotationId)`
Deletes an annotation and its associated comments.

```javascript
DeleteAnnotation('ann-xyz');
```

**Returns:** `boolean` - Success status

#### `SearchAnnotations(query, filters)`
Searches annotations by text content.

```javascript
const results = SearchAnnotations('important', {
  itemId: 'theorem-123',
  userId: 'user-1',
  color: '#FFEB3B'
});
```

**Returns:** `Annotation[]`

### Bookmark Functions

#### `AddBookmark(itemId, folderName, options)`
Adds an item to a bookmark folder.

```javascript
const bookmarkId = AddBookmark(
  'theorem-123',
  'Geometry Essentials',
  { userId: 'user-1' }
);
```

**Returns:** `string` - Bookmark ID

#### `GetBookmarksByFolder(folderName, userId)`
Gets all bookmarks in a specific folder.

```javascript
const bookmarks = GetBookmarksByFolder('Geometry Essentials', 'user-1');
```

**Returns:** `Bookmark[]`

#### `GetAllFolders()`
Retrieves all bookmark folders.

```javascript
const folders = GetAllFolders();
// [{ name: 'Geometry', createdAt: 1234567890, itemCount: 5 }, ...]
```

**Returns:** `Object[]`

#### `RemoveBookmark(bookmarkId)`
Removes a bookmark.

```javascript
RemoveBookmark('bookmark-xyz');
```

**Returns:** `boolean` - Success status

### Collection Functions

#### `CreateCollection(name, items, options)`
Creates a new collection.

```javascript
const collectionId = CreateCollection(
  'Calculus Fundamentals',
  ['theorem-1', 'theorem-2'],
  {
    description: 'Essential calculus theorems',
    ownerId: 'user-1',
    isPublic: false,
    tags: ['calculus', 'fundamentals']
  }
);
```

**Returns:** `string` - Collection ID

#### `GetCollection(collectionId)`
Retrieves a collection by ID.

```javascript
const collection = GetCollection('collection-xyz');
```

**Returns:** `Collection | null`

#### `GetCollectionsByUser(userId)`
Gets all collections accessible by a user.

```javascript
const collections = GetCollectionsByUser('user-1');
```

**Returns:** `Collection[]`

#### `UpdateCollection(collectionId, updates)`
Updates collection metadata.

```javascript
UpdateCollection('collection-xyz', {
  name: 'Updated Name',
  description: 'New description',
  isPublic: true
});
```

**Returns:** `boolean` - Success status

#### `AddItemToCollection(collectionId, itemId)`
Adds an item to a collection.

```javascript
AddItemToCollection('collection-xyz', 'theorem-456');
```

**Returns:** `boolean` - Success status

#### `RemoveItemFromCollection(collectionId, itemId)`
Removes an item from a collection.

```javascript
RemoveItemFromCollection('collection-xyz', 'theorem-456');
```

**Returns:** `boolean` - Success status

#### `DeleteCollection(collectionId)`
Deletes a collection and all its permissions.

```javascript
DeleteCollection('collection-xyz');
```

**Returns:** `boolean` - Success status

#### `ExportCollection(collectionId)`
Exports collection data for backup or transfer.

```javascript
const exportData = ExportCollection('collection-xyz');
// { collection: {...}, permissions: [...], exportedAt: 1234567890, version: '1.0' }
```

**Returns:** `Object | null`

#### `ImportCollection(data, ownerId)`
Imports a previously exported collection.

```javascript
const newCollectionId = ImportCollection(exportData, 'user-2');
```

**Returns:** `string` - New collection ID

### Permission/Sharing Functions

#### `ShareCollection(collectionId, users)`
Shares a collection with multiple users.

```javascript
const permissions = ShareCollection('collection-xyz', [
  { userId: 'user-2', role: 'editor' },
  { userId: 'user-3', role: 'viewer' }
]);
```

**Returns:** `Permission[]`

**Roles:**
- `owner` - Full control (delete, edit, share)
- `editor` - Add/remove items, edit metadata
- `viewer` - Read-only access

#### `GetCollectionPermissions(collectionId)`
Gets all permissions for a collection.

```javascript
const permissions = GetCollectionPermissions('collection-xyz');
```

**Returns:** `Permission[]`

#### `HasPermission(collectionId, userId, requiredRole)`
Checks if a user has specific permissions.

```javascript
const canEdit = HasPermission('collection-xyz', 'user-2', 'editor');
```

**Returns:** `boolean`

#### `RevokePermission(collectionId, userId)`
Removes a user's access to a collection.

```javascript
RevokePermission('collection-xyz', 'user-2');
```

**Returns:** `boolean` - Success status

### Discussion Thread Functions

#### `ThreadComment(annotationId, commentText, options)`
Adds a comment to an annotation's discussion thread.

```javascript
const result = ThreadComment(
  'ann-xyz',
  'Great observation!',
  { userId: 'user-2', parentId: 'comment-123' } // parentId for nested replies
);
// Returns: { comment: {...}, thread: [...] }
```

**Returns:** `Object` - Comment and full thread

#### `GetDiscussionThread(annotationId)`
Retrieves all comments for an annotation.

```javascript
const thread = GetDiscussionThread('ann-xyz');
```

**Returns:** `Comment[]`

#### `UpdateComment(commentId, newText)`
Updates comment text.

```javascript
UpdateComment('comment-123', 'Updated comment text');
```

**Returns:** `boolean` - Success status

#### `DeleteComment(commentId)`
Deletes a comment and all its replies.

```javascript
DeleteComment('comment-123');
```

**Returns:** `boolean` - Success status

#### `AddReaction(commentId, emoji, userId)`
Adds an emoji reaction to a comment.

```javascript
AddReaction('comment-123', '👍', 'user-1');
```

**Returns:** `boolean` - Success status

#### `RemoveReaction(commentId, emoji, userId)`
Removes a reaction from a comment.

```javascript
RemoveReaction('comment-123', '👍', 'user-1');
```

**Returns:** `boolean` - Success status

### Utility Functions

#### `GetUserStatistics(userId)`
Gets aggregate statistics for a user's activity.

```javascript
const stats = GetUserStatistics('user-1');
// { annotationCount: 5, bookmarkCount: 12, collectionCount: 3, commentCount: 8 }
```

**Returns:** `Object` - Statistics

## UI Components

### Annotation Components

#### `createHighlightOverlay(container, itemId)`
Creates a visual overlay for displaying annotation highlights.

```javascript
import { createHighlightOverlay } from './components/AnnotationUI.js';

const overlay = createHighlightOverlay(formulaElement, 'theorem-123');

// Later: overlay.refresh() to update
// Clean up: overlay.destroy()
```

**Returns:** `{ refresh: Function, destroy: Function }`

#### `createAnnotationTool(container, itemId, options)`
Creates an interactive tool for selecting regions to annotate.

```javascript
import { createAnnotationTool } from './components/AnnotationUI.js';

const tool = createAnnotationTool(
  formulaElement,
  'theorem-123',
  { color: '#FFEB3B' }
);

tool.activate();   // Enable selection mode
tool.deactivate(); // Disable selection mode
tool.isActive();   // Check status
```

**Returns:** `{ activate: Function, deactivate: Function, isActive: Function }`

### Bookmark Components

#### `createBookmarkPanel(options)`
Creates a sidebar panel for managing bookmark folders.

```javascript
import { createBookmarkPanel } from './components/BookmarkUI.js';

const panel = createBookmarkPanel({ userId: 'user-1' });
document.getElementById('sidebar').appendChild(panel);
```

**Returns:** `HTMLElement`

#### `createBookmarkButton(itemId, options)`
Creates a button for adding items to bookmarks.

```javascript
import { createBookmarkButton } from './components/BookmarkUI.js';

const button = createBookmarkButton('theorem-123', { userId: 'user-1' });
toolbar.appendChild(button);
```

**Returns:** `HTMLElement`

### Collection Components

#### `createCollectionManager(options)`
Creates a panel for managing collections.

```javascript
import { createCollectionManager } from './components/BookmarkUI.js';

const manager = createCollectionManager({ userId: 'user-1' });
document.getElementById('content').appendChild(manager);
```

**Returns:** `HTMLElement`

#### `createAddToCollectionButton(itemId, options)`
Creates a button for adding items to collections.

```javascript
import { createAddToCollectionButton } from './components/BookmarkUI.js';

const button = createAddToCollectionButton('theorem-123', { userId: 'user-1' });
toolbar.appendChild(button);
```

**Returns:** `HTMLElement`

## Real-Time Synchronization

The system uses SharedDB for real-time synchronization across all components. Events are automatically emitted on data changes:

### Emitted Events

```javascript
import { sharedDB } from './sharedDB.js';

// Annotation events
sharedDB.on('annotation:created', (annotation) => { /* ... */ });
sharedDB.on('annotation:updated', (annotation) => { /* ... */ });
sharedDB.on('annotation:deleted', ({ annotationId }) => { /* ... */ });

// Bookmark events
sharedDB.on('bookmark:added', (bookmark) => { /* ... */ });
sharedDB.on('bookmark:removed', ({ bookmarkId }) => { /* ... */ });

// Collection events
sharedDB.on('collection:created', (collection) => { /* ... */ });
sharedDB.on('collection:updated', (collection) => { /* ... */ });
sharedDB.on('collection:deleted', ({ collectionId }) => { /* ... */ });
sharedDB.on('collection:shared', ({ collectionId, permissions }) => { /* ... */ });
sharedDB.on('collection:item_added', ({ collectionId, itemId }) => { /* ... */ });
sharedDB.on('collection:item_removed', ({ collectionId, itemId }) => { /* ... */ });

// Permission events
sharedDB.on('permission:revoked', ({ collectionId, userId }) => { /* ... */ });

// Comment events
sharedDB.on('comment:added', (comment) => { /* ... */ });
sharedDB.on('comment:updated', (comment) => { /* ... */ });
sharedDB.on('comment:deleted', ({ commentId }) => { /* ... */ });

// Reaction events
sharedDB.on('reaction:added', ({ commentId, userId, emoji }) => { /* ... */ });
sharedDB.on('reaction:removed', ({ commentId, userId, emoji }) => { /* ... */ });
```

## Integration Example

### Complete Integration

```javascript
import { initSharedDB } from './sharedDB.js';
import {
  CreateAnnotation,
  AddBookmark,
  CreateCollection,
  ShareCollection,
  ThreadComment
} from './annotations.js';
import {
  createHighlightOverlay,
  createAnnotationTool
} from './components/AnnotationUI.js';
import {
  createBookmarkPanel,
  createCollectionManager
} from './components/BookmarkUI.js';

// Initialize SharedDB
initSharedDB();

// Setup annotation system for a formula
const formulaElement = document.getElementById('formula');
const itemId = 'pythagorean-theorem';
const userId = 'current-user';

// Create highlight overlay
const overlay = createHighlightOverlay(formulaElement, itemId);

// Create annotation tool
const tool = createAnnotationTool(formulaElement, itemId, { color: '#FFEB3B' });

// Setup UI
const sidebar = document.getElementById('sidebar');
sidebar.appendChild(createBookmarkPanel({ userId }));

const content = document.getElementById('content');
content.appendChild(createCollectionManager({ userId }));

// Programmatic usage
const annotationId = CreateAnnotation(
  itemId,
  { x: 10, y: 20, width: 200, height: 50 },
  'Key equation!',
  '#FFEB3B',
  { userId }
);

const bookmarkId = AddBookmark(itemId, 'Important Theorems', { userId });

const collectionId = CreateCollection(
  'Geometry Basics',
  [itemId],
  { ownerId: userId, isPublic: false }
);

ShareCollection(collectionId, [
  { userId: 'collaborator-1', role: 'editor' }
]);

ThreadComment(annotationId, 'This is fundamental!', { userId });
```

## Styling

Import the CSS file in your HTML:

```html
<link rel="stylesheet" href="src/styles/annotations.css">
```

The styles are fully responsive and support:
- Light/dark theme compatibility
- Mobile-responsive layouts
- Smooth animations
- Accessible color contrasts

## Storage Keys

Data is stored in SharedDB under these keys:

- `annotations` - All annotation objects
- `bookmarks` - All bookmark objects
- `collections` - All collection objects
- `permissions` - All permission objects
- `comments` - All comment objects
- `bookmark_folders` - Folder metadata

## Security Considerations

1. **Permission Validation**: Always validate permissions before modifying collections
2. **User Authentication**: Ensure userId is properly authenticated
3. **Public Collections**: Public collections allow viewer access to anyone
4. **Data Sanitization**: User input is escaped in UI components
5. **XSS Prevention**: HTML content is sanitized using textContent

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ module support required
- CSS Grid and Flexbox support required

## Performance

- Efficient event-driven architecture
- Minimal DOM manipulation
- Optimized for 1000+ annotations per item
- Lazy loading for large collections

## Future Enhancements

Potential improvements:
- Markdown support in annotations
- Rich text formatting
- Attachment support
- Version history
- Advanced search with filters
- Activity feeds
- Notification system
- Mobile app integration
