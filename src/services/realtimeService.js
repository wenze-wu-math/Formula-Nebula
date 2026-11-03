/**
 * realtimeService.js - Real-time updates service for Formula Nebula
 * Handles WebSocket connections for live dashboard updates
 */

class RealtimeService {
  constructor(options = {}) {
    this.wsUrl = options.wsUrl || this.getWebSocketUrl();
    this.reconnectAttempts = options.reconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 3000;
    this.heartbeatInterval = options.heartbeatInterval || 30000;

    this.ws = null;
    this.subscriptions = new Map();
    this.messageQueue = [];
    this.reconnectCount = 0;
    this.isConnecting = false;
    this.isConnected = false;
    this.heartbeatTimer = null;

    this.init();
  }

  /**
   * Initialize WebSocket connection
   */
  init() {
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.addEventListener('open', () => this.handleOpen());
      this.ws.addEventListener('message', (event) => this.handleMessage(event));
      this.ws.addEventListener('error', (event) => this.handleError(event));
      this.ws.addEventListener('close', () => this.handleClose());
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  handleOpen() {
    console.log('WebSocket connected');
    this.isConnecting = false;
    this.isConnected = true;
    this.reconnectCount = 0;

    // Flush queued messages
    this.flushMessageQueue();

    // Start heartbeat
    this.startHeartbeat();

    // Dispatch connection event
    this.dispatchEvent('connected', {});
  }

  /**
   * Handle incoming messages
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);

      // Handle different message types
      if (data.type === 'pong') {
        // Heartbeat response
        return;
      }

      if (data.channel) {
        this.handleChannelMessage(data);
      } else if (data.type === 'error') {
        console.error('WebSocket error from server:', data.message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle channel-specific messages
   */
  handleChannelMessage(message) {
    const channel = message.channel;
    const subscribers = this.subscriptions.get(channel) || [];

    // Call all subscribers for this channel
    subscribers.forEach(callback => {
      try {
        callback(message.data);
      } catch (error) {
        console.error('Error in subscription callback:', error);
      }
    });

    // Dispatch generic message event
    this.dispatchEvent('message', {
      channel,
      data: message.data
    });
  }

  /**
   * Handle WebSocket error
   */
  handleError(event) {
    console.error('WebSocket error:', event);
    this.dispatchEvent('error', {
      error: event
    });
  }

  /**
   * Handle WebSocket close
   */
  handleClose() {
    console.log('WebSocket disconnected');
    this.isConnected = false;
    this.isConnecting = false;

    // Stop heartbeat
    this.stopHeartbeat();

    // Attempt to reconnect
    this.scheduleReconnect();

    // Dispatch disconnection event
    this.dispatchEvent('disconnected', {});
  }

  /**
   * Schedule reconnection
   */
  scheduleReconnect() {
    if (this.reconnectCount >= this.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.dispatchEvent('reconnect_failed', {
        attempts: this.reconnectCount
      });
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectCount);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectCount + 1}/${this.reconnectAttempts})`);

    setTimeout(() => {
      this.reconnectCount++;
      this.connect();
    }, delay);
  }

  /**
   * Subscribe to channel
   */
  subscribe(channel, callback) {
    if (!channel || typeof callback !== 'function') {
      throw new Error('Channel and callback are required');
    }

    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);

      // Send subscription message if connected
      if (this.isConnected) {
        this.sendMessage({
          type: 'subscribe',
          channel
        });
      } else {
        // Queue the subscription
        this.messageQueue.push({
          type: 'subscribe',
          channel
        });
      }
    }

    this.subscriptions.get(channel).push(callback);

    // Return unsubscribe function
    return () => this.unsubscribe(channel, callback);
  }

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channel, callback) {
    if (!this.subscriptions.has(channel)) {
      return;
    }

    const subscribers = this.subscriptions.get(channel);
    const index = subscribers.indexOf(callback);

    if (index > -1) {
      subscribers.splice(index, 1);
    }

    // If no more subscribers, send unsubscribe message
    if (subscribers.length === 0) {
      this.subscriptions.delete(channel);

      if (this.isConnected) {
        this.sendMessage({
          type: 'unsubscribe',
          channel
        });
      }
    }
  }

  /**
   * Send message to server
   */
  sendMessage(data) {
    if (!this.isConnected) {
      // Queue message if not connected
      this.messageQueue.push(data);
      return;
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.messageQueue.push(data);
    }
  }

  /**
   * Flush queued messages
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  /**
   * Start heartbeat
   */
  startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({
          type: 'ping'
        });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Publish message to channel
   */
  publish(channel, data) {
    this.sendMessage({
      type: 'publish',
      channel,
      data
    });
  }

  /**
   * Listen for service events
   */
  addEventListener(event, callback) {
    if (!this.eventListeners) {
      this.eventListeners = new Map();
    }

    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event).push(callback);

    // Return remove listener function
    return () => this.removeEventListener(event, callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    if (!this.eventListeners || !this.eventListeners.has(event)) {
      return;
    }

    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);

    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Dispatch event
   */
  dispatchEvent(event, detail) {
    if (!this.eventListeners || !this.eventListeners.has(event)) {
      return;
    }

    const listeners = this.eventListeners.get(event);
    listeners.forEach(callback => {
      try {
        callback(detail);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Get WebSocket URL based on current location
   */
  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ws`;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectCount: this.reconnectCount,
      subscriptionCount: this.subscriptions.size,
      messageQueueLength: this.messageQueue.length,
      wsReadyState: this.ws ? this.ws.readyState : null
    };
  }

  /**
   * Disconnect and clean up
   */
  disconnect() {
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.subscriptions.clear();
    this.messageQueue = [];
    this.eventListeners = new Map();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeService;
}
