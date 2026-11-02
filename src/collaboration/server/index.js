#!/usr/bin/env node

/**
 * Collaboration Server Entry Point
 * Starts WebSocket server for real-time collaborative editing
 */

import { CollabServer } from './CollabServer.js';

const PORT = process.env.COLLAB_PORT || 8080;

console.log('='.repeat(60));
console.log('  Real-time Collaborative Editing Server');
console.log('='.repeat(60));
console.log();

const server = new CollabServer(PORT);

// Start server
try {
  server.start();
  console.log(`✓ Server started successfully`);
  console.log(`  WebSocket URL: ws://localhost:${PORT}`);
  console.log();
  console.log('Open multiple browser tabs at:');
  console.log('  http://localhost:5173/demo-collaboration.html');
  console.log();
  console.log('Press Ctrl+C to stop the server');
  console.log();
} catch (error) {
  console.error('✗ Failed to start server:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log();
  console.log('Shutting down server...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log();
  console.log('Received SIGTERM, shutting down...');
  server.stop();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  server.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  server.stop();
  process.exit(1);
});

// Display statistics every 60 seconds
setInterval(() => {
  const rooms = server.getActiveRooms();
  if (rooms.length > 0) {
    console.log(`[Stats] Active rooms: ${rooms.length}`);
    rooms.forEach(room => {
      console.log(`  - Room ${room.proofId}: ${room.userCount} users, version ${room.version}`);
    });
  }
}, 60000);
