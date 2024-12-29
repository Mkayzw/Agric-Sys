const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'register':
                    // Register client with their ID
                    clients.set(data.userId, ws);
                    break;
                    
                case 'chat':
                    // Handle chat messages
                    const recipient = clients.get(data.recipientId);
                    if (recipient) {
                        recipient.send(JSON.stringify({
                            type: 'chat',
                            senderId: data.userId,
                            message: data.message,
                            timestamp: new Date().toISOString()
                        }));
                    }
                    break;
                    
                case 'typing':
                    // Handle typing indicators
                    const typingRecipient = clients.get(data.recipientId);
                    if (typingRecipient) {
                        typingRecipient.send(JSON.stringify({
                            type: 'typing',
                            senderId: data.userId,
                            isTyping: data.isTyping
                        }));
                    }
                    break;
                    
                case 'read':
                    // Handle read receipts
                    const readRecipient = clients.get(data.recipientId);
                    if (readRecipient) {
                        readRecipient.send(JSON.stringify({
                            type: 'read',
                            senderId: data.userId,
                            messageId: data.messageId
                        }));
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    ws.on('close', () => {
        // Remove client from connected clients
        for (const [userId, client] of clients.entries()) {
            if (client === ws) {
                clients.delete(userId);
                break;
            }
        }
        console.log('Client disconnected');
    });
}); 