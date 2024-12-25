// server.js
const WebSocket = require('ws');
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200);
        res.end('Server is running');
        return;
    }
    res.writeHead(404);
    res.end();
});
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws) => {
    let userId = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'register':
                    userId = data.userId;
                    clients.set(userId, ws);
                    console.log(`User ${userId} connected`);
                    break;

                case 'location':
                    // Broadcast location to other user
                    clients.forEach((client, clientId) => {
                        if (clientId !== userId && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'location',
                                userId: userId,
                                location: data.location
                            }));
                        }
                    });
                    break;

                case 'message':
                    // Send message to other user
                    clients.forEach((client, clientId) => {
                        if (clientId !== userId && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'message',
                                userId: userId,
                                text: data.text
                            }));
                        }
                    });
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        if (userId) {
            clients.delete(userId);
            console.log(`User ${userId} disconnected`);
            // Notify other user about disconnection
            clients.forEach((client, clientId) => {
                if (clientId !== userId && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'status',
                        userId: userId,
                        status: 'offline'
                    }));
                }
            });
        }
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});