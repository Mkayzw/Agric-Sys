class ChatControls {
    constructor() {
        this.chatInterface = document.getElementById('chatInterface');
        this.minimizeBtn = document.querySelector('.minimize-chat');
        this.closeBtn = document.querySelector('.close-chat');
        this.isMinimized = false;
        
        this.initialize();
    }
    
    initialize() {
        if (this.minimizeBtn) {
            this.minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeChat());
        }
        
        // Add chat interface height transition
        if (this.chatInterface) {
            this.chatInterface.style.transition = 'height 0.3s ease-in-out';
        }
    }
    
    toggleMinimize() {
        if (!this.chatInterface) return;
        
        if (this.isMinimized) {
            this.chatInterface.style.height = '500px'; // or your default height
            this.minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
        } else {
            this.chatInterface.style.height = '48px'; // header height
            this.minimizeBtn.innerHTML = '<i class="fas fa-plus"></i>';
        }
        
        this.isMinimized = !this.isMinimized;
    }
    
    closeChat() {
        if (!this.chatInterface) return;
        this.chatInterface.classList.add('hidden');
        this.isMinimized = false;
        this.chatInterface.style.height = '500px';
    }
    
    openChat() {
        if (!this.chatInterface) return;
        this.chatInterface.classList.remove('hidden');
        this.chatInterface.classList.add('flex');
    }
}

// Initialize chat controls
document.addEventListener('DOMContentLoaded', () => {
    window.chatControls = new ChatControls();
}); 