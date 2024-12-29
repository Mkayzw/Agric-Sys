document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            // Show loading state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';

            // Validate passwords match
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Validate password length
            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            // Get form data
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: password,
                role: document.getElementById('role').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                location: document.getElementById('location').value
            };

            // Send registration request
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store token and user data
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            // Show success message
            alert('Account created successfully!');

            // Redirect based on role
            if (formData.role === 'farmer') {
                window.location.href = 'post-job.html';
            } else {
                window.location.href = 'find-work.html';
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.message || 'Registration failed. Please try again.');
        } finally {
            // Reset button state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        }
    });

    // Add password validation feedback
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    function validatePasswords() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword) {
            if (password !== confirmPassword) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        }

        if (password.length > 0 && password.length < 8) {
            passwordInput.setCustomValidity('Password must be at least 8 characters long');
        } else {
            passwordInput.setCustomValidity('');
        }
    }

    passwordInput.addEventListener('input', validatePasswords);
    confirmPasswordInput.addEventListener('input', validatePasswords);
}); 