const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const messageStore = new Map();
const clients = new Map();
const pendingMessages = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PING_INTERVAL = 30000;
const PING_TIMEOUT = 5000;

const wss = new WebSocket.Server({ port: 8080 });

function heartbeat() {
    this.isAlive = true;
}

function verifyClient(info, callback) {
    const token = new URL(info.req.url, 'ws://localhost').searchParams.get('token');
    if (!token) {
        callback(false, 401, 'Unauthorized');
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        info.req.userId = decoded.userId;
        callback(true);
    } catch (err) {
        callback(false, 401, 'Invalid token');
    }
}

wss.on('connection', (ws, req) => {
    const userId = req.userId;
    ws.isAlive = true;
    ws.userId = userId;
    ws.on('pong', heartbeat);
    
    clients.set(userId, ws);
    console.log(`Client connected: ${userId}`);
    
    // Send pending messages
    const pending = pendingMessages.get(userId) || [];
    pending.forEach(msg => ws.send(JSON.stringify(msg)));
    pendingMessages.delete(userId);
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            const chatId = [userId, data.recipientId].sort().join('-');
            
            switch (data.type) {
                case 'chat':
                    const messageData = {
                        id: Date.now().toString(),
                        type: 'chat',
                        senderId: userId,
                        recipientId: data.recipientId,
                        message: data.message,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Store message
                    if (!messageStore.has(chatId)) {
                        messageStore.set(chatId, []);
                    }
                    messageStore.get(chatId).push(messageData);
                    
                    // Send to recipient if online
                    const recipient = clients.get(data.recipientId);
                    if (recipient?.readyState === WebSocket.OPEN) {
                        recipient.send(JSON.stringify(messageData));
                    } else {
                        if (!pendingMessages.has(data.recipientId)) {
                            pendingMessages.set(data.recipientId, []);
                        }
                        pendingMessages.get(data.recipientId).push(messageData);
                    }
                    break;
                    
                case 'typing':
                case 'read':
                    const targetClient = clients.get(data.recipientId);
                    if (targetClient?.readyState === WebSocket.OPEN) {
                        targetClient.send(JSON.stringify({
                            ...data,
                            senderId: userId
                        }));
                    }
                    break;
                    
                case 'fetch_history':
                    const history = messageStore.get(chatId) || [];
                    ws.send(JSON.stringify({
                        type: 'history',
                        chatId,
                        messages: history
                    }));
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to process message'
            }));
        }
    });
    
    ws.on('close', () => {
        clients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
    });
});

// Ping all clients periodically
const interval = setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
            clients.delete(ws.userId);
            return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
    });
}, PING_INTERVAL);

wss.on('close', () => {
    clearInterval(interval);
});

module.exports = wss; 