class JobInteractions {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        // Bind job card interactions using event delegation
        document.addEventListener('click', (e) => {
            const jobCard = e.target.closest('.job-card');
            if (!jobCard) return;

            const jobId = jobCard.dataset.jobId;
            if (!jobId) {
                console.error('Job card missing jobId attribute');
                return;
            }

            // Handle bid button click
            if (e.target.matches('.bid-btn, .bid-btn *')) {
                e.preventDefault();
                this.openBidModal(jobId);
            }

            // Handle view details button click
            if (e.target.matches('.details-btn, .details-btn *')) {
                e.preventDefault();
                this.viewJobDetails(jobId);
            }

            // Handle chat button click
            if (e.target.matches('.chat-btn, .chat-btn *')) {
                e.preventDefault();
                this.openChat(jobId);
            }
        });

        // Bind modal close events
        const bidModal = document.getElementById('bidModal');
        if (bidModal) {
            // Close button
            const closeBtn = bidModal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.onclick = () => this.closeBidModal();
            }

            // Close on outside click
            bidModal.onclick = (e) => {
                if (e.target === bidModal) this.closeBidModal();
            };

            // Handle bid form submission
            const bidForm = document.getElementById('bidForm');
            if (bidForm) {
                bidForm.onsubmit = (e) => this.handleBidSubmit(e);
            }
        }
    }

    viewJobDetails(jobId) {
        if (!jobId) {
            console.error('No job ID provided');
            return;
        }
        window.location.href = `/job-details.html?jobId=${jobId}`;
    }

    openBidModal(jobId) {
        if (!isLoggedIn()) {
            sessionStorage.setItem('intendedDestination', `job-details.html?jobId=${jobId}`);
            window.location.href = '/login.html';
            return;
        }

        const modal = document.getElementById('bidModal');
        if (!modal) return;

        // Store the job ID in the form
        const bidForm = document.getElementById('bidForm');
        if (bidForm) {
            bidForm.dataset.jobId = jobId;
        }

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    closeBidModal() {
        const modal = document.getElementById('bidModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');

            // Reset form if exists
            const bidForm = document.getElementById('bidForm');
            if (bidForm) bidForm.reset();
        }
    }

    async handleBidSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const jobId = form.dataset.jobId;
        const submitButton = form.querySelector('button[type="submit"]');

        if (!jobId) {
            console.error('No job ID found in form');
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            const bidData = {
                amount: parseFloat(document.getElementById('bidAmount').value),
                currency: document.getElementById('bidCurrency').value,
                type: document.getElementById('bidType').value,
                availabilityDate: document.getElementById('availabilityDate').value,
                completionTime: {
                    value: parseInt(document.getElementById('completionTime').value),
                    unit: document.getElementById('timeUnit').value
                },
                proposal: document.getElementById('proposal').value
            };

            await JobService.submitBid(jobId, bidData);
            
            // Show success message
            alert('Bid submitted successfully!');
            
            // Close modal and reset form
            this.closeBidModal();
            
            // Refresh job list if we're on the find work page
            if (window.loadJobs) {
                loadJobs();
            }
        } catch (error) {
            console.error('Error submitting bid:', error);
            alert(error.message || 'Failed to submit bid. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Bid';
        }
    }

    openChat(jobId) {
        if (!isLoggedIn()) {
            sessionStorage.setItem('intendedDestination', `job-details.html?jobId=${jobId}`);
            window.location.href = '/login.html';
            return;
        }

        // Implement chat functionality
        console.log('Opening chat for job:', jobId);
    }
}

// Initialize job interactions when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JobInteractions();
}); 