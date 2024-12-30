class BiddingManager {
    constructor() {
        this.userId = null;
        this.currentJobId = null;
        this.API_URL = config.API_URL;
        this.onBidUpdate = null;
    }

    async submitBid(amount, proposal) {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        if (!this.currentJobId) {
            throw new Error('No job selected');
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.API_URL}/bids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    jobId: this.currentJobId,
                    amount: amount,
                    proposal: proposal
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit bid');
            }

            if (this.onBidUpdate) {
                this.onBidUpdate(data.bid);
            }

            return data.bid;
        } catch (error) {
            console.error('Error submitting bid:', error);
            throw error;
        }
    }

    async getBidsForJob(jobId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.API_URL}/jobs/${jobId}/bids`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch bids');
            }

            return data.bids;
        } catch (error) {
            console.error('Error fetching bids:', error);
            throw error;
        }
    }

    async updateBid(bidId, updates) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.API_URL}/bids/${bidId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update bid');
            }

            return data.bid;
        } catch (error) {
            console.error('Error updating bid:', error);
            throw error;
        }
    }

    async deleteBid(bidId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.API_URL}/bids/${bidId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete bid');
            }
        } catch (error) {
            console.error('Error deleting bid:', error);
            throw error;
        }
    }
}

// Initialize bidding manager when document is ready
document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) return;
    
    const user = await getCurrentUser();
    if (!user) return;
    
    const biddingManager = new BiddingManager();
    biddingManager.userId = user.id;
    window.biddingManager = biddingManager;
    
    // Initialize UI if we're on a page with bidding functionality
    if (document.getElementById('bidForm')) {
        window.biddingUI = new BiddingUI(biddingManager);
    }
}); 