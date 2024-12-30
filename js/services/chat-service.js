class ChatService {
    constructor() {
        this.ws = null;
        this.messageCallbacks = new Set();
    }

    connect() {
        this.ws = new WebSocket('ws://your-websocket-server/chat');
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.messageCallbacks.forEach(callback => callback(message));
        };

        this.ws.onclose = () => {
            setTimeout(() => this.connect(), 5000); // Reconnect after 5 seconds
        };
    }

    sendMessage(recipientId, content) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'message',
                recipientId,
                content
            }));
        }
    }

    onMessage(callback) {
        this.messageCallbacks.add(callback);
    }

    removeMessageListener(callback) {
        this.messageCallbacks.delete(callback);
    }
}

window.ChatService = new ChatService(); 