class JobService {
    static async getJobs(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${config.API_URL}/jobs?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`
            }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    }

    static async getJobById(jobId) {
        const response = await fetch(`${config.API_URL}/jobs/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`
            }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    }

    static async submitBid(jobId, bidData) {
        const response = await fetch(`${config.API_URL}/jobs/${jobId}/bids`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`
            },
            body: JSON.stringify(bidData)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    }

    static async getBids(jobId) {
        const response = await fetch(`${config.API_URL}/jobs/${jobId}/bids`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`
            }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    }
}

window.JobService = JobService; 