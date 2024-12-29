document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const data = await login(email, password);
            
            // Show success message
            alert('Login successful!');

            // Redirect based on intended destination or default to home
            const intendedDestination = sessionStorage.getItem('intendedDestination');
            if (intendedDestination) {
                sessionStorage.removeItem('intendedDestination');
                window.location.href = intendedDestination;
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'Login failed. Please try again.');
        } finally {
            // Reset button state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });
}); 