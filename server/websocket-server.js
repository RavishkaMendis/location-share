// server.js
const WebSocket = require('ws');
const port = process.env.PORT || 10000;

const server = new WebSocket.Server({ port });

// Store active sessions
const sessions = new Map(); // sessionId -> Set of connected clients

// Generate random session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

server.on('connection', (ws) => {
  let sessionId = null;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join_session':
          // Handle joining a session
          sessionId = data.sessionId.toUpperCase();
          if (!sessions.has(sessionId)) {
            sessions.set(sessionId, new Set());
          }
          sessions.get(sessionId).add(ws);
          
          // Confirm session join
          ws.send(JSON.stringify({
            type: 'session_joined',
            sessionId: sessionId
          }));
          break;

        case 'create_session':
          // Create new session
          sessionId = generateSessionId();
          sessions.set(sessionId, new Set([ws]));
          
          // Send session ID back to creator
          ws.send(JSON.stringify({
            type: 'session_created',
            sessionId: sessionId
          }));
          break;

        case 'location':
          // Broadcast location to all clients in the same session
          if (sessionId && sessions.has(sessionId)) {
            sessions.get(sessionId).forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'location',
                  location: data.location,
                  sender: 'other'
                }));
              }
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    // Remove client from session
    if (sessionId && sessions.has(sessionId)) {
      sessions.get(sessionId).delete(ws);
      if (sessions.get(sessionId).size === 0) {
        sessions.delete(sessionId);
      }
    }
  });
});

console.log(`WebSocket server is running on port ${port}`);