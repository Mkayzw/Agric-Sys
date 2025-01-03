class BiddingManager {
    constructor() {
        this.userId = null;
        this.currentJobId = null;
        this.API_URL = config.API_URL;
        this.onBidUpdate = null;
        this.initialize();
    }

    initialize() {
        // Set up bid button click handlers
        document.querySelectorAll('.bid-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const jobCard = button.closest('.job-card');
                if (jobCard) {
                    this.currentJobId = jobCard.dataset.jobId;
                    this.showBidModal();
                }
            });
        });

        // Set up bid modal close handlers
        const bidModal = document.getElementById('bidModal');
        if (bidModal) {
            // Close button
            bidModal.querySelector('button').addEventListener('click', () => this.closeBidModal());
            // Cancel button
            bidModal.querySelector('.btn-secondary')?.addEventListener('click', () => this.closeBidModal());
            // Click outside modal
            bidModal.addEventListener('click', (e) => {
                if (e.target === bidModal) this.closeBidModal();
            });
        }
    }

    showBidModal() {
        const bidModal = document.getElementById('bidModal');
        if (bidModal) {
            bidModal.classList.remove('hidden');
            bidModal.classList.add('flex');
        }
    }

    closeBidModal() {
        const bidModal = document.getElementById('bidModal');
        if (bidModal) {
            bidModal.classList.add('hidden');
            bidModal.classList.remove('flex');
            // Reset form if exists
            const bidForm = document.getElementById('bidForm');
            if (bidForm) bidForm.reset();
        }
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

document.addEventListener('DOMContentLoaded', () => {
    const bidForm = document.getElementById('bidForm');
    const bidAmount = document.getElementById('bidAmount');
    const bidCurrency = document.getElementById('bidCurrency');
    const bidType = document.getElementById('bidType');

    bidForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const jobId = bidForm.dataset.jobId;
        const bidData = {
            amount: parseFloat(bidAmount.value),
            currency: bidCurrency.value,
            type: bidType.value
        };

        try {
            await BiddingService.submitBid(jobId, bidData);
            alert('Bid submitted successfully!');
            // Close bid modal or update UI
        } catch (error) {
            alert('Failed to submit bid. Please try again.');
        }
    });
}); 