document.addEventListener('DOMContentLoaded', () => {
    const jobPostForm = document.getElementById('jobPostForm');
    const API_URL = 'http://localhost:5000/api';

    // Check if user is logged in
    if (!isLoggedIn()) {
        // Store intended destination
        sessionStorage.setItem('intendedDestination', 'post-job.html');
        // Redirect to login
        window.location.href = 'login.html';
        return;
    }

    jobPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            // Show loading state
            const submitButton = jobPostForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Posting...';

            // Get form data
            const formData = {
                title: document.getElementById('jobTitle').value,
                serviceType: document.getElementById('serviceType').value,
                pickupLocation: document.getElementById('pickupLocation').value,
                deliveryLocation: document.getElementById('deliveryLocation').value,
                startDate: document.getElementById('startDate').value,
                budget: parseFloat(document.getElementById('budget').value),
                budgetCurrency: document.getElementById('budgetCurrency').value,
                description: document.getElementById('description').value,
                requirements: document.getElementById('requirements').value || undefined
            };

            // Validate required fields
            const requiredFields = ['title', 'serviceType', 'pickupLocation', 'deliveryLocation', 'startDate', 'budget'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
                }
            }

            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                sessionStorage.setItem('intendedDestination', 'post-job.html');
                window.location.href = 'login.html';
                return;
            }

            // Send POST request to create job
            const response = await fetch(`${API_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Show success message
            alert('Job posted successfully!');
            
            // Reset form
            jobPostForm.reset();

            // Redirect to jobs page
            window.location.href = 'find-work.html';
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error posting job. Please try again.');
        } finally {
            // Reset button state
            const submitButton = jobPostForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Post Job';
        }
    });

    // Set minimum date for startDate to today
    const startDateInput = document.getElementById('startDate');
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
}); 