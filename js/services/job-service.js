class JobService {
    static cache = new Map();
    static retryAttempts = 3;
    static retryDelay = 1000; // 1 second

    static async fetchWithRetry(url, options, attempts = this.retryAttempts) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            if (attempts > 1 && !error.message.includes('unauthorized')) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.fetchWithRetry(url, options, attempts - 1);
            }
            throw error;
        }
    }

    static getCacheKey(endpoint, params = {}) {
        return `${endpoint}:${JSON.stringify(params)}`;
    }

    static setCacheItem(key, data, ttl = 300000) { // 5 minutes TTL
        this.cache.set(key, {
            data,
            expires: Date.now() + ttl
        });
    }

    static getCacheItem(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }

    static getAuthHeaders() {
        const token = getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    static async getJobs(params = {}) {
        const cacheKey = this.getCacheKey('jobs', params);
        const cachedData = this.getCacheItem(cacheKey);
        if (cachedData) return cachedData;

        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.set(key, value);
            });

            const response = await this.fetchWithRetry(
                `${API_BASE_URL}/api/jobs?${queryParams.toString()}`,
                { headers: this.getAuthHeaders() }
            );

            const data = await response.json();
            this.setCacheItem(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    static async getJobById(jobId) {
        const cacheKey = this.getCacheKey(`job:${jobId}`);
        const cachedData = this.getCacheItem(cacheKey);
        if (cachedData) return cachedData;

        try {
            const response = await this.fetchWithRetry(
                `${API_BASE_URL}/api/jobs/${jobId}`,
                { headers: this.getAuthHeaders() }
            );

            const data = await response.json();
            this.setCacheItem(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching job details:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    static async submitBid(jobId, bidData) {
        try {
            const response = await this.fetchWithRetry(
                `${API_BASE_URL}/api/jobs/${jobId}/bids`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(bidData)
                }
            );

            const data = await response.json();
            // Invalidate relevant caches
            this.cache.delete(this.getCacheKey(`job:${jobId}`));
            this.cache.delete(this.getCacheKey('jobs'));
            return data;
        } catch (error) {
            console.error('Error submitting bid:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    static async getBids(jobId) {
        const cacheKey = this.getCacheKey(`bids:${jobId}`);
        const cachedData = this.getCacheItem(cacheKey);
        if (cachedData) return cachedData;

        try {
            const response = await this.fetchWithRetry(
                `${API_BASE_URL}/api/jobs/${jobId}/bids`,
                { headers: this.getAuthHeaders() }
            );

            const data = await response.json();
            this.setCacheItem(cacheKey, data, 60000); // 1 minute TTL for bids
            return data;
        } catch (error) {
            console.error('Error fetching bids:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    static async createJob(jobData) {
        try {
            const response = await this.fetchWithRetry(
                `${API_BASE_URL}/api/jobs`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(jobData)
                }
            );

            const data = await response.json();
            // Invalidate jobs cache
            this.cache.delete(this.getCacheKey('jobs'));
            return data;
        } catch (error) {
            console.error('Error creating job:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    static async updateJob(jobId, jobData) {
        try {
            const response = await this.fetchWithRetry(
                `${API_BASE_URL}/api/jobs/${jobId}`,
                {
                    method: 'PUT',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(jobData)
                }
            );

            const data = await response.json();
            // Invalidate relevant caches
            this.cache.delete(this.getCacheKey(`job:${jobId}`));
            this.cache.delete(this.getCacheKey('jobs'));
            return data;
        } catch (error) {
            console.error('Error updating job:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    static async deleteJob(jobId) {
        try {
            await this.fetchWithRetry(
                `${API_BASE_URL}/api/jobs/${jobId}`,
                {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                }
            );

            // Invalidate relevant caches
            this.cache.delete(this.getCacheKey(`job:${jobId}`));
            this.cache.delete(this.getCacheKey('jobs'));
            return true;
        } catch (error) {
            console.error('Error deleting job:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    static getErrorMessage(error) {
        if (error.message.includes('unauthorized')) {
            return 'Please log in to continue';
        }
        if (error.message.includes('not found')) {
            return 'The requested resource was not found';
        }
        if (error.message.includes('validation')) {
            return 'Please check your input and try again';
        }
        return 'An unexpected error occurred. Please try again later';
    }
}

window.JobService = JobService; 