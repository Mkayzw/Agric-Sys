class BiddingService {
    constructor() {
        this.apiUrl = '/api/bids';
    }

    async submitBid(jobId, bidData) {
        try {
            const response = await fetch(`${this.apiUrl}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    jobId,
                    ...bidData
                })
            });

            if (!response.ok) throw new Error('Failed to submit bid');
            return await response.json();
        } catch (error) {
            console.error('Error submitting bid:', error);
            throw error;
        }
    }

    async getBidsForJob(jobId) {
        try {
            const response = await fetch(`${this.apiUrl}/job/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch bids');
            return await response.json();
        } catch (error) {
            console.error('Error fetching bids:', error);
            throw error;
        }
    }
}

window.BiddingService = new BiddingService(); 