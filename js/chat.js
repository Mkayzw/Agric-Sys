<<<<<<< HEAD
class ChatManager {
    constructor() {
        this.ws = null;
        this.userId = null;
        this.currentChatId = null;
        this.typingTimeout = null;
        this.unreadMessages = new Map();
        
        // DOM Elements
        this.chatInterface = document.getElementById('chatInterface');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.querySelector('.chat-input textarea');
        this.sendBtn = document.querySelector('.send-message');
        this.notificationBadge = document.getElementById('chatNotification');
        this.searchInput = document.querySelector('.chat-search input');
        this.searchResults = new Map();
        this.currentSearchIndex = -1;
        
        this.initialize();
    }
    
    initialize() {
        // Initialize WebSocket connection
        this.connectWebSocket();
        
        // Event listeners
        this.chatInput.addEventListener('input', () => this.handleTyping());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Handle file uploads
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Add search event listener
        this.searchInput.addEventListener('input', () => this.handleSearch());
        document.getElementById('prevSearch').addEventListener('click', () => this.navigateSearch('prev'));
        document.getElementById('nextSearch').addEventListener('click', () => this.navigateSearch('next'));
    }
    
    connectWebSocket() {
        this.ws = new WebSocket('ws://localhost:8080');
        
        this.ws.onopen = () => {
            console.log('Connected to WebSocket server');
            // Register user with server
            if (this.userId) {
                this.ws.send(JSON.stringify({
                    type: 'register',
                    userId: this.userId
                }));
            }
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleIncomingMessage(data);
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }
    
    handleIncomingMessage(data) {
        switch (data.type) {
            case 'chat':
                this.displayMessage(data);
                this.updateUnreadCount(data.senderId);
                break;
                
            case 'typing':
                this.showTypingIndicator(data.senderId, data.isTyping);
                break;
                
            case 'read':
                this.updateReadReceipts(data.messageId);
                break;
        }
    }
    
    sendMessage() {
        const text = this.chatInput.value.trim();
        if (!text || !this.currentChatId) return;
        
        const message = {
            type: 'chat',
            userId: this.userId,
            recipientId: this.currentChatId,
            message: text,
            timestamp: new Date().toISOString()
        };
        
        this.ws.send(JSON.stringify(message));
        this.displayMessage({
            ...message,
            senderId: this.userId
        });
        
        this.chatInput.value = '';
    }
    
    displayMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.senderId === this.userId ? 'sent' : 'received'}`;
        
        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-content">${message.message}</div>
            <div class="message-time">${time}</div>
            ${message.senderId === this.userId ? '<div class="message-status">✓</div>' : ''}
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    handleTyping() {
        if (!this.currentChatId) return;
        
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        this.ws.send(JSON.stringify({
            type: 'typing',
            userId: this.userId,
            recipientId: this.currentChatId,
            isTyping: true
        }));
        
        this.typingTimeout = setTimeout(() => {
            this.ws.send(JSON.stringify({
                type: 'typing',
                userId: this.userId,
                recipientId: this.currentChatId,
                isTyping: false
            }));
        }, 2000);
    }
    
    showTypingIndicator(senderId, isTyping) {
        const typingIndicator = document.getElementById(`typing-${senderId}`);
        if (isTyping) {
            if (!typingIndicator) {
                const indicator = document.createElement('div');
                indicator.id = `typing-${senderId}`;
                indicator.className = 'typing-indicator';
                indicator.innerHTML = '<span>typing</span><span>.</span><span>.</span><span>.</span>';
                this.chatMessages.appendChild(indicator);
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
        } else if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    updateUnreadCount(senderId) {
        if (this.chatInterface.style.display === 'none' || 
            document.hidden || 
            (this.currentChatId !== senderId)) {
            
            const count = (this.unreadMessages.get(senderId) || 0) + 1;
            this.unreadMessages.set(senderId, count);
            
            const totalUnread = Array.from(this.unreadMessages.values())
                .reduce((sum, count) => sum + count, 0);
            
            this.notificationBadge.textContent = totalUnread;
            this.notificationBadge.style.display = totalUnread > 0 ? 'block' : 'none';
            
            // Show desktop notification
            this.showDesktopNotification(senderId);
        }
    }
    
    showDesktopNotification(senderId) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('New Message', {
                body: 'You have a new message',
                icon: '/path/to/notification-icon.png'
            });
            
            notification.onclick = () => {
                window.focus();
                this.openChat(senderId);
            };
        }
    }
    
    openChat(recipientId) {
        this.currentChatId = recipientId;
        this.chatInterface.style.display = 'flex';
        this.unreadMessages.delete(recipientId);
        
        // Update notification badge
        const totalUnread = Array.from(this.unreadMessages.values())
            .reduce((sum, count) => sum + count, 0);
        this.notificationBadge.textContent = totalUnread;
        this.notificationBadge.style.display = totalUnread > 0 ? 'block' : 'none';
        
        // Load chat history
        this.loadChatHistory(recipientId);
    }
    
    loadChatHistory(recipientId) {
        // Here you would typically load chat history from your backend
        // For now, we'll use the sample data
        this.chatMessages.innerHTML = '';
        if (sampleMessages[recipientId]) {
            sampleMessages[recipientId].forEach(message => {
                this.displayMessage({
                    ...message,
                    senderId: message.type === 'sent' ? this.userId : recipientId,
                    timestamp: new Date().toISOString()
                });
            });
        }
    }
    
    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        const filePreview = document.getElementById('filePreview');
        
        for (const file of files) {
            if (file.size > maxFileSize) {
                alert(`File ${file.name} is too large. Maximum size is 5MB.`);
                continue;
            }
            
            if (!allowedTypes.includes(file.type)) {
                alert(`File type ${file.type} is not allowed.`);
                continue;
            }
            
            // Create file preview
            const fileItem = this.createFilePreview(file);
            filePreview.appendChild(fileItem);
            
            try {
                // Here you would typically upload the file to your server
                // and get a URL in response
                const fileUrl = await this.uploadFile(file);
                
                // Send file message
                this.ws.send(JSON.stringify({
                    type: 'chat',
                    userId: this.userId,
                    recipientId: this.currentChatId,
                    message: `[File] ${file.name}`,
                    fileUrl: fileUrl,
                    timestamp: new Date().toISOString()
                }));
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Failed to upload file. Please try again.');
            }
        }
        
        filePreview.style.display = filePreview.children.length > 0 ? 'block' : 'none';
        event.target.value = ''; // Reset file input
    }
    
    createFilePreview(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const icon = document.createElement('i');
        icon.className = this.getFileIcon(file.type);
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-size">${this.formatFileSize(file.size)}</div>
        `;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => fileItem.remove();
        
        fileItem.appendChild(icon);
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);
        
        return fileItem;
    }
    
    getFileIcon(type) {
        if (type.includes('pdf')) return 'fas fa-file-pdf';
        if (type.includes('word')) return 'fas fa-file-word';
        if (type.includes('image')) return 'fas fa-file-image';
        return 'fas fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    async uploadFile(file) {
        // Implement file upload to your server
        // Return the URL of the uploaded file
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`https://example.com/files/${file.name}`);
            }, 1000);
        });
    }
    
    handleSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        if (!query) {
            this.clearSearch();
            return;
        }
        
        this.searchResults.clear();
        this.currentSearchIndex = -1;
        
        // Search in current chat messages
        const messages = Array.from(this.chatMessages.querySelectorAll('.message'));
        messages.forEach((messageEl, index) => {
            const content = messageEl.querySelector('.message-content').textContent.toLowerCase();
            if (content.includes(query)) {
                this.searchResults.set(index, messageEl);
            }
        });
        
        // Update search UI
        this.updateSearchUI();
        
        // Highlight first result if exists
        if (this.searchResults.size > 0) {
            this.navigateSearch('next');
        }
    }
    
    updateSearchUI() {
        const totalResults = this.searchResults.size;
        const searchStatus = document.getElementById('searchStatus');
        const searchControls = document.getElementById('searchControls');
        
        if (totalResults > 0) {
            searchStatus.textContent = `${this.currentSearchIndex + 1} of ${totalResults} matches`;
            searchControls.style.display = 'flex';
        } else {
            searchStatus.textContent = 'No matches found';
            searchControls.style.display = 'none';
        }
    }
    
    navigateSearch(direction) {
        if (this.searchResults.size === 0) return;
        
        // Remove highlight from current result
        if (this.currentSearchIndex >= 0) {
            const currentEl = this.searchResults.get(this.currentSearchIndex);
            currentEl.classList.remove('search-highlight');
        }
        
        // Update current index
        if (direction === 'next') {
            this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.size;
        } else {
            this.currentSearchIndex = this.currentSearchIndex <= 0 ? 
                this.searchResults.size - 1 : this.currentSearchIndex - 1;
        }
        
        // Highlight and scroll to new result
        const messageEl = this.searchResults.get(this.currentSearchIndex);
        messageEl.classList.add('search-highlight');
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Update search status
        this.updateSearchUI();
    }
    
    clearSearch() {
        // Remove all search highlights
        this.searchResults.forEach(messageEl => {
            messageEl.classList.remove('search-highlight');
        });
        
        this.searchResults.clear();
        this.currentSearchIndex = -1;
        
        // Reset search UI
        document.getElementById('searchStatus').textContent = '';
        document.getElementById('searchControls').style.display = 'none';
    }
}

// Initialize chat manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const chatManager = new ChatManager();
    // Set a dummy user ID for testing
    chatManager.userId = 'user123';
    window.chatManager = chatManager;
=======
class ChatManager {
    constructor() {
        this.ws = null;
        this.userId = null;
        this.currentChatId = null;
        this.typingTimeout = null;
        this.unreadMessages = new Map();
        
        // DOM Elements
        this.chatInterface = document.getElementById('chatInterface');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.querySelector('.chat-input textarea');
        this.sendBtn = document.querySelector('.send-message');
        this.notificationBadge = document.getElementById('chatNotification');
        this.searchInput = document.querySelector('.chat-search input');
        this.searchResults = new Map();
        this.currentSearchIndex = -1;
        
        this.initialize();
    }
    
    initialize() {
        // Initialize WebSocket connection
        this.connectWebSocket();
        
        // Event listeners
        this.chatInput.addEventListener('input', () => this.handleTyping());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Handle file uploads
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Add search event listener
        this.searchInput.addEventListener('input', () => this.handleSearch());
        document.getElementById('prevSearch').addEventListener('click', () => this.navigateSearch('prev'));
        document.getElementById('nextSearch').addEventListener('click', () => this.navigateSearch('next'));
    }
    
    connectWebSocket() {
        this.ws = new WebSocket('ws://localhost:8080');
        
        this.ws.onopen = () => {
            console.log('Connected to WebSocket server');
            // Register user with server
            if (this.userId) {
                this.ws.send(JSON.stringify({
                    type: 'register',
                    userId: this.userId
                }));
            }
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleIncomingMessage(data);
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }
    
    handleIncomingMessage(data) {
        switch (data.type) {
            case 'chat':
                this.displayMessage(data);
                this.updateUnreadCount(data.senderId);
                break;
                
            case 'typing':
                this.showTypingIndicator(data.senderId, data.isTyping);
                break;
                
            case 'read':
                this.updateReadReceipts(data.messageId);
                break;
        }
    }
    
    sendMessage() {
        const text = this.chatInput.value.trim();
        if (!text || !this.currentChatId) return;
        
        const message = {
            type: 'chat',
            userId: this.userId,
            recipientId: this.currentChatId,
            message: text,
            timestamp: new Date().toISOString()
        };
        
        this.ws.send(JSON.stringify(message));
        this.displayMessage({
            ...message,
            senderId: this.userId
        });
        
        this.chatInput.value = '';
    }
    
    displayMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.senderId === this.userId ? 'sent' : 'received'}`;
        
        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-content">${message.message}</div>
            <div class="message-time">${time}</div>
            ${message.senderId === this.userId ? '<div class="message-status">✓</div>' : ''}
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    handleTyping() {
        if (!this.currentChatId) return;
        
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        this.ws.send(JSON.stringify({
            type: 'typing',
            userId: this.userId,
            recipientId: this.currentChatId,
            isTyping: true
        }));
        
        this.typingTimeout = setTimeout(() => {
            this.ws.send(JSON.stringify({
                type: 'typing',
                userId: this.userId,
                recipientId: this.currentChatId,
                isTyping: false
            }));
        }, 2000);
    }
    
    showTypingIndicator(senderId, isTyping) {
        const typingIndicator = document.getElementById(`typing-${senderId}`);
        if (isTyping) {
            if (!typingIndicator) {
                const indicator = document.createElement('div');
                indicator.id = `typing-${senderId}`;
                indicator.className = 'typing-indicator';
                indicator.innerHTML = '<span>typing</span><span>.</span><span>.</span><span>.</span>';
                this.chatMessages.appendChild(indicator);
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
        } else if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    updateUnreadCount(senderId) {
        if (this.chatInterface.style.display === 'none' || 
            document.hidden || 
            (this.currentChatId !== senderId)) {
            
            const count = (this.unreadMessages.get(senderId) || 0) + 1;
            this.unreadMessages.set(senderId, count);
            
            const totalUnread = Array.from(this.unreadMessages.values())
                .reduce((sum, count) => sum + count, 0);
            
            this.notificationBadge.textContent = totalUnread;
            this.notificationBadge.style.display = totalUnread > 0 ? 'block' : 'none';
            
            // Show desktop notification
            this.showDesktopNotification(senderId);
        }
    }
    
    showDesktopNotification(senderId) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('New Message', {
                body: 'You have a new message',
                icon: '/path/to/notification-icon.png'
            });
            
            notification.onclick = () => {
                window.focus();
                this.openChat(senderId);
            };
        }
    }
    
    openChat(recipientId) {
        this.currentChatId = recipientId;
        this.chatInterface.style.display = 'flex';
        this.unreadMessages.delete(recipientId);
        
        // Update notification badge
        const totalUnread = Array.from(this.unreadMessages.values())
            .reduce((sum, count) => sum + count, 0);
        this.notificationBadge.textContent = totalUnread;
        this.notificationBadge.style.display = totalUnread > 0 ? 'block' : 'none';
        
        // Load chat history
        this.loadChatHistory(recipientId);
    }
    
    loadChatHistory(recipientId) {
        // Here you would typically load chat history from your backend
        // For now, we'll use the sample data
        this.chatMessages.innerHTML = '';
        if (sampleMessages[recipientId]) {
            sampleMessages[recipientId].forEach(message => {
                this.displayMessage({
                    ...message,
                    senderId: message.type === 'sent' ? this.userId : recipientId,
                    timestamp: new Date().toISOString()
                });
            });
        }
    }
    
    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        const filePreview = document.getElementById('filePreview');
        
        for (const file of files) {
            if (file.size > maxFileSize) {
                alert(`File ${file.name} is too large. Maximum size is 5MB.`);
                continue;
            }
            
            if (!allowedTypes.includes(file.type)) {
                alert(`File type ${file.type} is not allowed.`);
                continue;
            }
            
            // Create file preview
            const fileItem = this.createFilePreview(file);
            filePreview.appendChild(fileItem);
            
            try {
                // Here you would typically upload the file to your server
                // and get a URL in response
                const fileUrl = await this.uploadFile(file);
                
                // Send file message
                this.ws.send(JSON.stringify({
                    type: 'chat',
                    userId: this.userId,
                    recipientId: this.currentChatId,
                    message: `[File] ${file.name}`,
                    fileUrl: fileUrl,
                    timestamp: new Date().toISOString()
                }));
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Failed to upload file. Please try again.');
            }
        }
        
        filePreview.style.display = filePreview.children.length > 0 ? 'block' : 'none';
        event.target.value = ''; // Reset file input
    }
    
    createFilePreview(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const icon = document.createElement('i');
        icon.className = this.getFileIcon(file.type);
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-size">${this.formatFileSize(file.size)}</div>
        `;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => fileItem.remove();
        
        fileItem.appendChild(icon);
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);
        
        return fileItem;
    }
    
    getFileIcon(type) {
        if (type.includes('pdf')) return 'fas fa-file-pdf';
        if (type.includes('word')) return 'fas fa-file-word';
        if (type.includes('image')) return 'fas fa-file-image';
        return 'fas fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    async uploadFile(file) {
        // Implement file upload to your server
        // Return the URL of the uploaded file
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`https://example.com/files/${file.name}`);
            }, 1000);
        });
    }
    
    handleSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        if (!query) {
            this.clearSearch();
            return;
        }
        
        this.searchResults.clear();
        this.currentSearchIndex = -1;
        
        // Search in current chat messages
        const messages = Array.from(this.chatMessages.querySelectorAll('.message'));
        messages.forEach((messageEl, index) => {
            const content = messageEl.querySelector('.message-content').textContent.toLowerCase();
            if (content.includes(query)) {
                this.searchResults.set(index, messageEl);
            }
        });
        
        // Update search UI
        this.updateSearchUI();
        
        // Highlight first result if exists
        if (this.searchResults.size > 0) {
            this.navigateSearch('next');
        }
    }
    
    updateSearchUI() {
        const totalResults = this.searchResults.size;
        const searchStatus = document.getElementById('searchStatus');
        const searchControls = document.getElementById('searchControls');
        
        if (totalResults > 0) {
            searchStatus.textContent = `${this.currentSearchIndex + 1} of ${totalResults} matches`;
            searchControls.style.display = 'flex';
        } else {
            searchStatus.textContent = 'No matches found';
            searchControls.style.display = 'none';
        }
    }
    
    navigateSearch(direction) {
        if (this.searchResults.size === 0) return;
        
        // Remove highlight from current result
        if (this.currentSearchIndex >= 0) {
            const currentEl = this.searchResults.get(this.currentSearchIndex);
            currentEl.classList.remove('search-highlight');
        }
        
        // Update current index
        if (direction === 'next') {
            this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.size;
        } else {
            this.currentSearchIndex = this.currentSearchIndex <= 0 ? 
                this.searchResults.size - 1 : this.currentSearchIndex - 1;
        }
        
        // Highlight and scroll to new result
        const messageEl = this.searchResults.get(this.currentSearchIndex);
        messageEl.classList.add('search-highlight');
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Update search status
        this.updateSearchUI();
    }
    
    clearSearch() {
        // Remove all search highlights
        this.searchResults.forEach(messageEl => {
            messageEl.classList.remove('search-highlight');
        });
        
        this.searchResults.clear();
        this.currentSearchIndex = -1;
        
        // Reset search UI
        document.getElementById('searchStatus').textContent = '';
        document.getElementById('searchControls').style.display = 'none';
    }
}

// Initialize chat manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const chatManager = new ChatManager();
    // Set a dummy user ID for testing
    chatManager.userId = 'user123';
    window.chatManager = chatManager;
>>>>>>> 1d12cc19c4d3855a6b3534a8acfc9a5c99a896ea
}); 