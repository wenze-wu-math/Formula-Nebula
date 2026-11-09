/**
 * Real-time Collaborative Editing System
 * Features:
 * - Multiple users annotating same proof simultaneously
 * - Real-time cursor synchronization (Google Docs style)
 * - Comment threads on specific lines
 * - Operational Transform-based conflict resolution
 */

import { EventEmitter } from './utils/EventEmitter.js';
import { OperationalTransform } from './ot/transform.js';

export class RealtimeCollaboration extends EventEmitter {
  constructor(websocketUrl, userId, userName) {
    super();
    this.websocketUrl = websocketUrl;
    this.userId = userId;
    this.userName = userName;
    this.ws = null;
    this.connected = false;

    // State management
    this.activeUsers = new Map(); // userId -> {name, cursor, color}
    this.proofState = null; // Current proof document state
    this.localVersion = 0; // Local document version
    this.serverVersion = 0; // Server acknowledged version
    this.pendingOps = []; // Operations awaiting server ack
    this.commentThreads = new Map(); // lineId -> [{author, text, timestamp}]

    // OT engine
    this.ot = new OperationalTransform();

    // User color assignment
    this.userColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    this.colorIndex = 0;
  }

  /**
   * Connect to WebSocket server
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.websocketUrl);

        this.ws.onopen = () => {
          this.connected = true;
          console.log('[Collab] Connected to server');

          // Send join message
          this.send({
            type: 'join',
            userId: this.userId,
            userName: this.userName,
            timestamp: Date.now()
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('[Collab] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.connected = false;
          console.log('[Collab] Disconnected from server');
          this.emit('disconnected');

          // Attempt reconnection
          setTimeout(() => this.connect(), 3000);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  /**
   * Send message to server
   */
  send(message) {
    if (this.connected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[Collab] Cannot send - not connected');
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(message) {
    switch (message.type) {
      case 'welcome':
        this.handleWelcome(message);
        break;
      case 'user-joined':
        this.handleUserJoined(message);
        break;
      case 'user-left':
        this.handleUserLeft(message);
        break;
      case 'edit':
        this.handleRemoteEdit(message);
        break;
      case 'cursor':
        this.handleCursorUpdate(message);
        break;
      case 'comment':
        this.handleComment(message);
        break;
      case 'ack':
        this.handleAck(message);
        break;
      default:
        console.warn('[Collab] Unknown message type:', message.type);
    }
  }

  /**
   * Handle welcome message with initial state
   */
  handleWelcome(message) {
    this.proofState = message.proofState;
    this.serverVersion = message.version;
    this.localVersion = message.version;

    // Setup other users
    message.users.forEach(user => {
      if (user.userId !== this.userId) {
        this.activeUsers.set(user.userId, {
          name: user.userName,
          cursor: null,
          color: this.assignColor()
        });
      }
    });

    // Load existing comments
    if (message.comments) {
      this.commentThreads = new Map(Object.entries(message.comments));
    }

    this.emit('ready', {
      proofState: this.proofState,
      users: Array.from(this.activeUsers.values())
    });
  }

  /**
   * Handle new user joining
   */
  handleUserJoined(message) {
    this.activeUsers.set(message.userId, {
      name: message.userName,
      cursor: null,
      color: this.assignColor()
    });

    this.emit('user-joined', {
      userId: message.userId,
      userName: message.userName
    });
  }

  /**
   * Handle user leaving
   */
  handleUserLeft(message) {
    this.activeUsers.delete(message.userId);
    this.emit('user-left', { userId: message.userId });
  }

  /**
   * Sync proof edits with operational transform
   * @param {Object} proof - Current proof document
   * @param {Object} edit - Edit operation {type, position, content, etc.}
   * @returns {Promise} Broadcast confirmation
   */
  async SyncProofEdits(proof, edit) {
    // Apply edit locally immediately (optimistic update)
    const appliedEdit = this.applyEditLocally(proof, edit);

    // Increment local version
    this.localVersion++;

    // Store operation for potential transformation
    const operation = {
      userId: this.userId,
      version: this.localVersion,
      edit: appliedEdit,
      timestamp: Date.now()
    };

    this.pendingOps.push(operation);

    // Broadcast to server
    this.send({
      type: 'edit',
      operation
    });

    // Emit local update event
    this.emit('local-edit', { proof, edit: appliedEdit });

    return operation;
  }

  /**
   * Apply edit to local proof document
   */
  applyEditLocally(proof, edit) {
    switch (edit.type) {
      case 'insert':
        return this.insertText(proof, edit.position, edit.content);
      case 'delete':
        return this.deleteText(proof, edit.position, edit.length);
      case 'replace':
        return this.replaceText(proof, edit.position, edit.length, edit.content);
      case 'annotate':
        return this.addAnnotation(proof, edit.lineId, edit.annotation);
      default:
        console.warn('[Collab] Unknown edit type:', edit.type);
        return edit;
    }
  }

  /**
   * Handle remote edit from another user
   */
  handleRemoteEdit(message) {
    const { operation } = message;

    // Transform operation against pending local operations
    let transformedOp = operation;

    for (const pendingOp of this.pendingOps) {
      if (pendingOp.version > operation.version) {
        transformedOp = this.ot.transform(transformedOp, pendingOp);
      }
    }

    // Apply transformed operation to local state
    this.applyEditLocally(this.proofState, transformedOp.edit);

    // Update server version
    this.serverVersion = operation.version;

    // Emit remote edit event
    this.emit('remote-edit', {
      userId: operation.userId,
      edit: transformedOp.edit,
      proof: this.proofState
    });
  }

  /**
   * Handle acknowledgment from server
   */
  handleAck(message) {
    // Remove acknowledged operation from pending queue
    this.pendingOps = this.pendingOps.filter(op => op.version > message.version);
    this.serverVersion = message.version;
  }

  /**
   * Manage and sync cursor positions
   * @param {string} userId - User identifier
   * @param {Object} position - {lineId, column, selection}
   * @returns {void}
   */
  ManageCursors(userId, position) {
    if (userId === this.userId) {
      // Broadcast local cursor position
      this.send({
        type: 'cursor',
        userId: this.userId,
        position,
        timestamp: Date.now()
      });

      this.emit('local-cursor', { position });
    }
  }

  /**
   * Handle cursor update from remote user
   */
  handleCursorUpdate(message) {
    const user = this.activeUsers.get(message.userId);
    if (user) {
      user.cursor = message.position;
      this.emit('remote-cursor', {
        userId: message.userId,
        userName: user.name,
        color: user.color,
        position: message.position
      });
    }
  }

  /**
   * Thread comments on specific lines
   * @param {string} lineId - Line identifier
   * @param {Object} comment - {text, replyTo}
   * @returns {Promise} Stored and broadcast confirmation
   */
  async ThreadComments(lineId, comment) {
    const commentObj = {
      id: this.generateId(),
      lineId,
      author: this.userName,
      authorId: this.userId,
      text: comment.text,
      replyTo: comment.replyTo || null,
      timestamp: Date.now(),
      resolved: false
    };

    // Store locally
    if (!this.commentThreads.has(lineId)) {
      this.commentThreads.set(lineId, []);
    }
    this.commentThreads.get(lineId).push(commentObj);

    // Broadcast to server
    this.send({
      type: 'comment',
      comment: commentObj
    });

    this.emit('local-comment', { comment: commentObj });

    return commentObj;
  }

  /**
   * Handle incoming comment from remote user
   */
  handleComment(message) {
    const { comment } = message;

    if (!this.commentThreads.has(comment.lineId)) {
      this.commentThreads.set(comment.lineId, []);
    }
    this.commentThreads.get(comment.lineId).push(comment);

    this.emit('remote-comment', { comment });
  }

  /**
   * Resolve conflicts between overlapping edits using OT
   * @param {Object} edit1 - First edit operation
   * @param {Object} edit2 - Second edit operation
   * @returns {Object} Merged edit result
   */
  ResolveConflicts(edit1, edit2) {
    // Use operational transform to resolve conflicts
    const result = this.ot.resolve(edit1, edit2);

    this.emit('conflict-resolved', {
      original: [edit1, edit2],
      resolved: result
    });

    return result;
  }

  // Helper methods

  insertText(proof, position, content) {
    // Implementation depends on proof data structure
    return { type: 'insert', position, content };
  }

  deleteText(proof, position, length) {
    return { type: 'delete', position, length };
  }

  replaceText(proof, position, length, content) {
    return { type: 'replace', position, length, content };
  }

  addAnnotation(proof, lineId, annotation) {
    return { type: 'annotate', lineId, annotation };
  }

  assignColor() {
    const color = this.userColors[this.colorIndex];
    this.colorIndex = (this.colorIndex + 1) % this.userColors.length;
    return color;
  }

  generateId() {
    return `${this.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all active users
   */
  getActiveUsers() {
    return Array.from(this.activeUsers.entries()).map(([userId, user]) => ({
      userId,
      ...user
    }));
  }

  /**
   * Get comments for a specific line
   */
  getCommentsForLine(lineId) {
    return this.commentThreads.get(lineId) || [];
  }

  /**
   * Get all comment threads
   */
  getAllComments() {
    const allComments = [];
    this.commentThreads.forEach((comments, _lineId) => {
      allComments.push(...comments);
    });
    return allComments;
  }

  /**
   * Mark comment as resolved
   */
  resolveComment(commentId) {
    this.commentThreads.forEach((comments) => {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.resolved = true;
        this.send({
          type: 'comment-resolve',
          commentId
        });
      }
    });
  }
}
