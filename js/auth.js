class AuthService {
    static API_URL = '/.netlify/functions';
    static TOKEN_KEY = 'token';
    static USER_KEY = 'user';

    static async login(email, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const { token, user } = await response.json();
            this.setToken(token);
            this.setUser(user);
            return { token, user };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(`${this.API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            const { token, user } = await response.json();
            this.setToken(token);
            this.setUser(user);
            return { token, user };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    static logout() {
        this.clearSession();
        window.location.href = '/';
    }

    // Session management
    static setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static setUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    static getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    static clearSession() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    static isLoggedIn() {
        return !!this.getToken();
    }

    // UI updates
    static updateUI() {
        const isLoggedIn = this.isLoggedIn();
        const user = this.getUser();

        document.querySelectorAll('[data-auth-show]').forEach(element => {
            const showWhen = element.dataset.authShow;
            element.style.display = 
                (showWhen === 'logged-in' && isLoggedIn) || 
                (showWhen === 'logged-out' && !isLoggedIn) 
                    ? '' 
                    : 'none';
        });

        if (isLoggedIn && user) {
            document.querySelectorAll('[data-user-info]').forEach(element => {
                const field = element.dataset.userInfo;
                if (user[field]) {
                    element.textContent = user[field];
                }
            });
        }
    }

    static init() {
        this.updateUI();
        document.querySelectorAll('[data-action="logout"]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    AuthService.init();
}); 