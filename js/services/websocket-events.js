class WebSocketEvents {
    static TYPES = {
        CHAT: 'chat',
        TYPING: 'typing',
        READ: 'read',
        BID: 'bid',
        JOB_UPDATE: 'job_update',
        ERROR: 'error',
        NOTIFICATION: 'notification'
    };

    static createMessage(type, data) {
        return {
            type,
            timestamp: new Date().toISOString(),
            ...data
        };
    }

    static createChatMessage(recipientId, message) {
        return this.createMessage(this.TYPES.CHAT, {
            recipientId,
            message
        });
    }

    static createTypingEvent(recipientId, isTyping) {
        return this.createMessage(this.TYPES.TYPING, {
            recipientId,
            isTyping
        });
    }

    static createBidEvent(jobId, bid) {
        return this.createMessage(this.TYPES.BID, {
            jobId,
            bid
        });
    }

    static createJobUpdateEvent(jobId, update) {
        return this.createMessage(this.TYPES.JOB_UPDATE, {
            jobId,
            update
        });
    }
}

window.WebSocketEvents = WebSocketEvents; 