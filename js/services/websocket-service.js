class WebSocketService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.messageQueue = [];
        this.handlers = new Map();
        this.isConnecting = false;
        this.pingInterval = null;
        this.lastPingTime = null;
    }

    async connect() {
        if (this.isConnecting) return;
        this.isConnecting = true;

        const token = localStorage.getItem(config.AUTH.TOKEN_KEY);
        if (!token) {
            console.error('No auth token found');
            return;
        }

        const wsUrl = `${config.WS_URL}?token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = this.handleOpen.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
        this.ws.onerror = this.handleError.bind(this);
        this.ws.onmessage = this.handleMessage.bind(this);

        // Start ping interval
        this.startPingInterval();
    }

    startPingInterval() {
        this.pingInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
                this.lastPingTime = Date.now();
            }
        }, 30000);
    }

    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    handleOpen() {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.processMessageQueue();
    }

    handleClose() {
        this.isConnecting = false;
        this.stopPingInterval();
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), delay);
        }
    }

    handleError(error) {
        console.error('WebSocket error:', error);
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            const handler = this.handlers.get(data.type);
            if (handler) {
                handler(data);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    send(message) {
        if (!message.type) {
            throw new Error('Message must have a type');
        }

        const formattedMessage = WebSocketEvents.createMessage(
            message.type,
            message
        );

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(formattedMessage));
        } else {
            this.messageQueue.push(formattedMessage);
            this.connect();
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    onMessage(type, handler) {
        this.handlers.set(type, handler);
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

window.wsService = new WebSocketService(); 