const config = {
    API_URL: 'http://localhost:5000/api',
    WS_URL: 'ws://localhost:8080',
    CHAT_SETTINGS: {
        MAX_FILE_SIZE: 5 * 1024 * 1024,
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'],
    },
    CURRENCY: {
        EXCHANGE_RATE: 36, // USD to ZWL
    },
    AUTH: {
        TOKEN_KEY: 'authToken'
    }
};

class ChatManager {
    constructor() {
        this.userId = AuthService.getCurrentUser()?.id;
        this.currentChatId = null;
        this.typingTimeout = null;
        this.unreadMessages = new Map();
        
        // DOM Elements
        this.chatInterface = document.getElementById('chatInterface');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatTextarea');
        this.sendBtn = document.querySelector('.send-message');
        this.notificationBadge = document.getElementById('chatNotification');
        
        this.initialize();
    }

    initialize() {
        if (!this.userId || !this.chatInput || !this.sendBtn) {
            console.error('Chat initialization failed');
            return;
        }

        // Set up WebSocket handlers
        wsService.onMessage('chat', this.handleIncomingMessage.bind(this));
        wsService.onMessage('typing', this.handleTypingIndicator.bind(this));
        wsService.onMessage('history', this.handleChatHistory.bind(this));
        wsService.onMessage('error', this.handleError.bind(this));

        // Connect WebSocket
        wsService.connect();

        // Event listeners
        this.chatInput.addEventListener('input', this.handleTyping.bind(this));
        this.sendBtn.addEventListener('click', this.sendMessage.bind(this));
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // File upload handler
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        }
    }

    handleIncomingMessage(data) {
        this.displayMessage(data);
        if (data.senderId !== this.userId) {
            this.updateUnreadCount(data.senderId);
        }
    }

    handleTypingIndicator(data) {
        if (data.senderId === this.currentChatId) {
            this.showTypingIndicator(data.isTyping);
        }
    }

    handleChatHistory(data) {
        this.chatMessages.innerHTML = '';
        data.messages.forEach(msg => this.displayMessage(msg));
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    handleError(data) {
        console.error('Chat error:', data.message);
        // Show error to user
        this.showError(data.message);
    }

    // ... rest of the ChatManager implementation
}

// Initialize chat manager when document is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for authentication
    if (!isLoggedIn()) {
        console.log('User not logged in');
        return;
    }
    
    const user = await getCurrentUser();
    if (!user) {
        console.log('Could not get user data');
        return;
    }
    
    const chatManager = new ChatManager();
    chatManager.userId = user.id;
    window.chatManager = chatManager;
    
    console.log('Chat manager initialized');
}); 