class BiddingUI {
    constructor(biddingManager) {
        this.biddingManager = biddingManager;
        this.bidForm = document.getElementById('bidForm');
        this.bidsList = document.getElementById('bidsList');
        this.bidAmount = document.getElementById('bidAmount');
        this.bidProposal = document.getElementById('bidProposal');
        this.submitBidBtn = document.getElementById('submitBid');
        
        this.initialize();
    }
    
    initialize() {
        if (this.bidForm) {
            this.bidForm.addEventListener('submit', (e) => this.handleBidSubmit(e));
        }
        
        // Initialize bid amount validation
        if (this.bidAmount) {
            this.bidAmount.addEventListener('input', () => this.validateBidAmount());
        }
        
        // Load existing bids if on job detail page
        const jobId = this.getJobIdFromUrl();
        if (jobId) {
            this.biddingManager.currentJobId = jobId;
            this.loadBids(jobId);
        }
    }
    
    async handleBidSubmit(e) {
        e.preventDefault();
        
        try {
            this.submitBidBtn.disabled = true;
            this.submitBidBtn.textContent = this.bidForm.dataset.editingBidId ? 'Updating...' : 'Submitting...';
            
            const amount = parseFloat(this.bidAmount.value);
            const proposal = this.bidProposal.value;
            
            if (this.bidForm.dataset.editingBidId) {
                await this.biddingManager.updateBid(this.bidForm.dataset.editingBidId, {
                    amount,
                    proposal
                });
                delete this.bidForm.dataset.editingBidId;
            } else {
                await this.biddingManager.submitBid(amount, proposal);
            }
            
            await this.loadBids(this.biddingManager.currentJobId);
            this.bidForm.reset();
            this.submitBidBtn.textContent = 'Submit Bid';
            this.showMessage(
                this.bidForm.dataset.editingBidId ? 'Bid updated successfully!' : 'Bid submitted successfully!', 
                'success'
            );
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.submitBidBtn.disabled = false;
        }
    }
    
    async loadBids(jobId) {
        try {
            const bids = await this.biddingManager.getBidsForJob(jobId);
            this.renderBids(bids);
        } catch (error) {
            this.showMessage('Failed to load bids', 'error');
        }
    }
    
    renderBids(bids) {
        if (!this.bidsList) return;
        
        this.bidsList.innerHTML = '';
        
        if (bids.length === 0) {
            this.bidsList.innerHTML = `
                <p class="text-gray-500 text-center py-8">
                    No bids yet. Be the first to bid!
                </p>`;
            return;
        }
        
        bids.forEach(bid => {
            const usdAmount = bid.currency === 'ZWL' 
                ? (bid.amount / config.CURRENCY.EXCHANGE_RATE).toFixed(2)
                : bid.amount.toFixed(2);
            const zwlAmount = bid.currency === 'USD'
                ? (bid.amount * config.CURRENCY.EXCHANGE_RATE).toFixed(2)
                : bid.amount.toFixed(2);
            
            const bidElement = document.createElement('div');
            bidElement.className = 'bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow';
            bidElement.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <span class="font-medium text-gray-900">${bid.bidderName}</span>
                    <div class="text-right">
                        <div class="text-lg font-semibold text-green-600">$${usdAmount}</div>
                        <div class="text-sm text-gray-500">ZWL ${zwlAmount}</div>
                    </div>
                </div>
                <div class="text-gray-700 mb-3 whitespace-pre-wrap">${bid.proposal}</div>
                <div class="flex justify-between items-center text-sm text-gray-500">
                    <span>${new Date(bid.createdAt).toLocaleDateString()}</span>
                    ${bid.bidderId === this.biddingManager.userId ? `
                        <div class="space-x-2">
                            <button onclick="window.biddingUI.editBid('${bid.id}')" 
                                    class="text-blue-600 hover:text-blue-800">
                                Edit
                            </button>
                            <button onclick="window.biddingUI.deleteBid('${bid.id}')" 
                                    class="text-red-600 hover:text-red-800">
                                Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
            this.bidsList.appendChild(bidElement);
        });
    }
    
    validateBidAmount() {
        if (!this.bidAmount) return;
        
        const amount = parseFloat(this.bidAmount.value);
        const minBid = parseFloat(this.bidAmount.getAttribute('min')) || 0;
        
        if (isNaN(amount) || amount < minBid) {
            this.bidAmount.setCustomValidity(`Bid must be at least $${minBid}`);
        } else {
            this.bidAmount.setCustomValidity('');
        }
    }
    
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        
        // Tailwind classes for different message types
        const typeClasses = {
            success: 'bg-green-100 text-green-800 border-green-200',
            error: 'bg-red-100 text-red-800 border-red-200',
            info: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        
        messageDiv.className = `px-4 py-3 rounded-md border ${typeClasses[type]} mb-4`;
        messageDiv.textContent = message;
        
        const container = this.bidForm?.parentElement || document.body;
        container.insertBefore(messageDiv, container.firstChild);
        
        // Add fade-out animation
        setTimeout(() => {
            messageDiv.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            setTimeout(() => messageDiv.remove(), 500);
        }, 4500);
    }
    
    getJobIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('jobId');
    }
    
    async editBid(bidId) {
        // Implementation for editing a bid
        const bid = await this.biddingManager.getBid(bidId);
        if (!bid) return;

        this.bidAmount.value = bid.amount;
        this.bidProposal.value = bid.proposal;
        this.submitBidBtn.textContent = 'Update Bid';
        
        // Add data attribute to track editing state
        this.bidForm.dataset.editingBidId = bidId;
    }

    async deleteBid(bidId) {
        if (!confirm('Are you sure you want to delete this bid?')) return;

        try {
            await this.biddingManager.deleteBid(bidId);
            await this.loadBids(this.biddingManager.currentJobId);
            this.showMessage('Bid deleted successfully', 'success');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }
} 