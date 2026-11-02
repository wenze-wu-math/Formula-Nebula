/**
 * WebSocket Collaboration Server
 * Handles real-time synchronization between multiple clients
 */

import { WebSocketServer } from 'ws';
import { EventEmitter } from '../utils/EventEmitter.js';

export class CollabServer extends EventEmitter {
  constructor(port = 8080) {
    super();
    this.port = port;
    this.wss = null;
    this.clients = new Map(); // clientId -> {ws, userId, userName}
    this.rooms = new Map(); // proofId -> {version, state, users, comments}
    this.operationQueue = [];
  }

  /**
   * Start the WebSocket server
   */
  start() {
    this.wss = new WebSocketServer({ port: this.port });

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      console.log(`[Server] New connection: ${clientId}`);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, ws, message);
        } catch (error) {
          console.error('[Server] Invalid message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error(`[Server] WebSocket error for ${clientId}:`, error);
      });
    });

    console.log(`[Server] Collaboration server started on port ${this.port}`);
  }

  /**
   * Stop the server
   */
  stop() {
    if (this.wss) {
      this.wss.close();
      console.log('[Server] Server stopped');
    }
  }

  /**
   * Handle incoming messages
   */
  handleMessage(clientId, ws, message) {
    switch (message.type) {
      case 'join':
        this.handleJoin(clientId, ws, message);
        break;
      case 'edit':
        this.handleEdit(clientId, message);
        break;
      case 'cursor':
        this.handleCursor(clientId, message);
        break;
      case 'comment':
        this.handleComment(clientId, message);
        break;
      case 'comment-resolve':
        this.handleCommentResolve(clientId, message);
        break;
      default:
        console.warn('[Server] Unknown message type:', message.type);
    }
  }

  /**
   * Handle user joining
   */
  handleJoin(clientId, ws, message) {
    const { userId, userName, proofId = 'default' } = message;

    // Register client
    this.clients.set(clientId, {
      ws,
      userId,
      userName,
      proofId
    });

    // Get or create room
    if (!this.rooms.has(proofId)) {
      this.rooms.set(proofId, {
        version: 0,
        state: this.getDefaultProofState(),
        users: new Set(),
        comments: {}
      });
    }

    const room = this.rooms.get(proofId);
    room.users.add(userId);

    // Send welcome message with current state
    this.sendToClient(clientId, {
      type: 'welcome',
      proofState: room.state,
      version: room.version,
      users: Array.from(room.users).map(uid => {
        const client = Array.from(this.clients.values()).find(c => c.userId === uid);
        return {
          userId: uid,
          userName: client?.userName || 'Unknown'
        };
      }),
      comments: room.comments
    });

    // Notify other users
    this.broadcast(proofId, {
      type: 'user-joined',
      userId,
      userName
    }, clientId);

    console.log(`[Server] User ${userName} joined room ${proofId}`);
  }

  /**
   * Handle edit operation
   */
  handleEdit(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const room = this.rooms.get(client.proofId);
    if (!room) return;

    const { operation } = message;

    // Increment version
    room.version++;

    // Apply operation to room state
    this.applyOperation(room.state, operation.edit);

    // Store operation in queue for conflict resolution
    this.operationQueue.push({
      ...operation,
      version: room.version,
      proofId: client.proofId
    });

    // Keep only recent operations
    if (this.operationQueue.length > 100) {
      this.operationQueue.shift();
    }

    // Acknowledge to sender
    this.sendToClient(clientId, {
      type: 'ack',
      version: room.version
    });

    // Broadcast to other clients
    this.broadcast(client.proofId, {
      type: 'edit',
      operation: {
        ...operation,
        version: room.version
      }
    }, clientId);

    console.log(`[Server] Edit applied: version ${room.version}`);
  }

  /**
   * Handle cursor update
   */
  handleCursor(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Broadcast cursor position to other clients
    this.broadcast(client.proofId, {
      type: 'cursor',
      userId: message.userId,
      position: message.position,
      timestamp: message.timestamp
    }, clientId);
  }

  /**
   * Handle comment
   */
  handleComment(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const room = this.rooms.get(client.proofId);
    if (!room) return;

    const { comment } = message;

    // Store comment
    if (!room.comments[comment.lineId]) {
      room.comments[comment.lineId] = [];
    }
    room.comments[comment.lineId].push(comment);

    // Broadcast to all clients including sender
    this.broadcast(client.proofId, {
      type: 'comment',
      comment
    });

    console.log(`[Server] Comment added to line ${comment.lineId}`);
  }

  /**
   * Handle comment resolution
   */
  handleCommentResolve(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const room = this.rooms.get(client.proofId);
    if (!room) return;

    // Find and mark comment as resolved
    Object.values(room.comments).forEach(comments => {
      const comment = comments.find(c => c.id === message.commentId);
      if (comment) {
        comment.resolved = true;
      }
    });

    // Broadcast resolution
    this.broadcast(client.proofId, {
      type: 'comment-resolve',
      commentId: message.commentId
    });
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const room = this.rooms.get(client.proofId);
    if (room) {
      room.users.delete(client.userId);

      // Notify other users
      this.broadcast(client.proofId, {
        type: 'user-left',
        userId: client.userId
      });

      // Clean up empty rooms
      if (room.users.size === 0) {
        this.rooms.delete(client.proofId);
        console.log(`[Server] Room ${client.proofId} cleaned up`);
      }
    }

    this.clients.delete(clientId);
    console.log(`[Server] Client ${clientId} disconnected`);
  }

  /**
   * Apply operation to proof state
   */
  applyOperation(state, edit) {
    // This is a simplified version
    // Real implementation would modify actual proof document structure
    if (!state.edits) {
      state.edits = [];
    }
    state.edits.push(edit);
  }

  /**
   * Broadcast message to all clients in a room
   */
  broadcast(proofId, message, excludeClientId = null) {
    this.clients.forEach((client, clientId) => {
      if (client.proofId === proofId && clientId !== excludeClientId) {
        this.sendToClient(clientId, message);
      }
    });
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === 1) { // 1 = OPEN
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Get default proof state
   */
  getDefaultProofState() {
    return {
      content: '',
      lines: [],
      annotations: {},
      edits: []
    };
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get room statistics
   */
  getRoomStats(proofId) {
    const room = this.rooms.get(proofId);
    if (!room) return null;

    return {
      version: room.version,
      userCount: room.users.size,
      commentCount: Object.values(room.comments).flat().length
    };
  }

  /**
   * Get all active rooms
   */
  getActiveRooms() {
    return Array.from(this.rooms.entries()).map(([proofId, room]) => ({
      proofId,
      userCount: room.users.size,
      version: room.version
    }));
  }
}
