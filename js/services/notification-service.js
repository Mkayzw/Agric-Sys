class NotificationService {
    static async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    static async showNotification(title, options = {}) {
        if (!await this.requestPermission()) {
            return;
        }

        const defaultOptions = {
            icon: '/images/notification-icon.png',
            badge: '/images/notification-badge.png',
            vibrate: [200, 100, 200],
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);
            
            notification.onclick = () => {
                window.focus();
                if (options.onClick) {
                    options.onClick();
                }
            };

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    static async showChatNotification(sender, message) {
        return this.showNotification(`New message from ${sender}`, {
            body: message,
            onClick: () => {
                if (window.chatManager) {
                    window.chatManager.openChat(sender.id);
                }
            }
        });
    }

    static async showBidNotification(job, bid) {
        return this.showNotification('New Bid Received', {
            body: `New bid of ${bid.amount} for ${job.title}`,
            onClick: () => {
                window.location.href = `/job-details.html?id=${job.id}`;
            }
        });
    }
}

window.NotificationService = NotificationService; 