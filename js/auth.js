const API_URL = 'http://localhost:5000/api';

// Function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Function to get current user
async function getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to get user');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

// Function to handle login
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        return data.data;
    } catch (error) {
        throw error;
    }
}

// Function to handle logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Function to update UI based on auth state
function updateAuthUI() {
    const loginBtn = document.querySelector('.btn-secondary');
    const signupBtn = document.querySelector('.btn-primary');
    
    if (!loginBtn || !signupBtn) return; // Exit if buttons don't exist
    
    const user = JSON.parse(localStorage.getItem('user'));

    if (isLoggedIn() && user) {
        loginBtn.textContent = user.firstName;
        signupBtn.textContent = 'Logout';
        signupBtn.onclick = logout;
    } else {
        loginBtn.textContent = 'Login';
        signupBtn.textContent = 'Sign Up';
        
        // Add click event listeners
        loginBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        };
        signupBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'register.html';
        };
    }
}

// Function to handle navigation
function handleNavigation(path) {
    window.location.href = path;
}

// Update UI when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    // Add click handlers to all navigation buttons
    document.querySelectorAll('a[href="register.html"]').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            handleNavigation('register.html');
        };
    });
}); 