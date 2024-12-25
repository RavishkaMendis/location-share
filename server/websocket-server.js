// server.js
const WebSocket = require('ws');
const port = process.env.PORT || 10000;

const server = new WebSocket.Server({ port });

// Store active sessions and their users
const sessions = new Map(); // sessionId -> { users: Map<ws, userData>, lastLocations: Map<username, location> }

function generateSessionId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function broadcastSessionUsers(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const users = Array.from(session.users.values()).map(user => ({
    username: user.username,
    location: session.lastLocations.get(user.username),
    online: user.online
  }));

  session.users.forEach((userData, client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'users_update',
        users: users.filter(u => u.username !== userData.username) // Don't send user their own info
      }));
    }
  });
}

server.on('connection', (ws) => {
  let sessionId = null;
  let userData = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join_session':
          sessionId = data.sessionId.toUpperCase();
          userData = { username: data.username, online: true };

          if (!sessions.has(sessionId)) {
            sessions.set(sessionId, {
              users: new Map(),
              lastLocations: new Map()
            });
          }

          const session = sessions.get(sessionId);
          session.users.set(ws, userData);
          
          // Send confirmation and existing users to new user
          ws.send(JSON.stringify({
            type: 'session_joined',
            sessionId: sessionId,
            users: Array.from(session.users.values())
              .filter(u => u.username !== userData.username)
              .map(u => ({
                username: u.username,
                location: session.lastLocations.get(u.username),
                online: u.online
              }))
          }));

          broadcastSessionUsers(sessionId);
          break;

        case 'create_session':
          sessionId = generateSessionId();
          userData = { username: data.username, online: true };
          
          sessions.set(sessionId, {
            users: new Map([[ws, userData]]),
            lastLocations: new Map()
          });
          
          ws.send(JSON.stringify({
            type: 'session_created',
            sessionId: sessionId
          }));
          break;

        case 'location':
          if (sessionId && sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            session.lastLocations.set(userData.username, data.location);

            // Broadcast to other users in session
            session.users.forEach((user, client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'location_update',
                  username: userData.username,
                  location: data.location,
                  online: true
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
    if (sessionId && sessions.has(sessionId) && userData) {
      const session = sessions.get(sessionId);
      userData.online = false;
      
      // Keep the user's last location but mark them as offline
      broadcastSessionUsers(sessionId);

      // Clean up if no online users remain
      const hasOnlineUsers = Array.from(session.users.values()).some(u => u.online);
      if (!hasOnlineUsers) {
        sessions.delete(sessionId);
      }
    }
  });
});

console.log(`WebSocket server is running on port ${port}`);