class JobInteractions {
    constructor() {
        this.initialize();
        this.jobCache = new Map();
    }

    initialize() {
        this.setupJobCards();
        this.setupBidModal();
        this.setupFilters();
    }

    setupJobCards() {
        document.querySelectorAll('.job-card').forEach(card => {
            const jobId = card.dataset.jobId;
            if (!jobId) {
                console.error('Job card missing jobId attribute');
                return;
            }
            
            this.setupCardButtons(card, jobId);
        });

        // Add job-card class to cards that don't have it
        document.querySelectorAll('.bg-white.rounded-lg:not(.job-card)').forEach(card => {
            card.classList.add('job-card');
            if (!card.dataset.jobId) {
                card.dataset.jobId = 'job_' + Math.random().toString(36).substr(2, 9);
            }
            this.setupCardButtons(card, card.dataset.jobId);
        });
    }

    setupCardButtons(card, jobId) {
        // Bid button
        card.querySelector('.bid-btn')?.addEventListener('click', async () => {
            try {
                const job = await this.getJobDetails(jobId);
                this.openBidModal(job);
            } catch (error) {
                UIService.showMessage(error.message, 'error');
            }
        });
        
        // View details button
        card.querySelector('.details-btn')?.addEventListener('click', () => {
            this.viewJobDetails(jobId);
        });
        
        // Chat button
        card.querySelector('.chat-btn')?.addEventListener('click', () => {
            this.openJobChat(jobId);
        });
    }

    async getJobDetails(jobId) {
        if (this.jobCache.has(jobId)) {
            return this.jobCache.get(jobId);
        }
        
        const job = await JobService.getJobById(jobId);
        this.jobCache.set(jobId, job);
        return job;
    }

    setupBidModal() {
        const modal = document.getElementById('bidModal');
        if (!modal) return;

        const closeModal = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            this.resetBidForm();
        };

        // Close button
        modal.querySelector('button')?.addEventListener('click', closeModal);
        
        // Cancel button
        modal.querySelector('.btn-secondary')?.addEventListener('click', closeModal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        const form = modal.querySelector('form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleBidSubmit(form);
            });
        }
    }

    async handleBidSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const stopLoading = UIService.showLoading(submitBtn, 'Submitting...');

        try {
            const formData = new FormData(form);
            const bidData = {
                amount: parseFloat(formData.get('bidAmount')),
                currency: formData.get('bidCurrency'),
                proposal: formData.get('proposal'),
                availabilityDate: formData.get('availabilityDate'),
                completionTime: {
                    value: parseInt(formData.get('completionTime')),
                    unit: formData.get('timeUnit')
                }
            };

            await JobService.submitBid(this.currentJobId, bidData);
            UIService.showMessage('Bid submitted successfully!', 'success');
            this.closeBidModal();
        } catch (error) {
            UIService.showMessage(error.message, 'error');
        } finally {
            stopLoading();
        }
    }

    openBidModal(jobId) {
        const modal = document.getElementById('bidModal');
        if (!modal) return;

        // Set the current job ID in the bidding manager
        if (window.biddingManager) {
            window.biddingManager.currentJobId = jobId;
        }

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Add close handlers
        const closeBtn = modal.querySelector('button');
        const cancelBtn = modal.querySelector('.btn-secondary');
        
        const closeModal = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        };

        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;
        
        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    viewJobDetails(jobId) {
        // For now, redirect to a job details page
        window.location.href = `job-details.html?jobId=${jobId}`;
    }

    openJobChat(jobId) {
        if (!window.chatManager) {
            console.error('Chat manager not initialized');
            return;
        }

        // Open chat using chat controls
        if (window.chatControls) {
            window.chatControls.openChat();
        }

        // Initialize chat for this job
        window.chatManager.openChat(jobId);
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.jobInteractions = new JobInteractions();
}); 