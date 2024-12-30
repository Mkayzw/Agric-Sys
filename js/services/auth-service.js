class AuthService {
    static async login(email, password) {
        const response = await fetch(`${config.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        localStorage.setItem(config.AUTH.TOKEN_KEY, data.token);
        localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(data.user));
        
        return data;
    }
    
    static async register(userData) {
        const response = await fetch(`${config.API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        localStorage.setItem(config.AUTH.TOKEN_KEY, data.token);
        localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(data.user));
        
        return data;
    }
    
    static logout() {
        localStorage.removeItem(config.AUTH.TOKEN_KEY);
        localStorage.removeItem(config.AUTH.USER_KEY);
        window.location.href = '/login.html';
    }
    
    static isLoggedIn() {
        return !!localStorage.getItem(config.AUTH.TOKEN_KEY);
    }
    
    static getCurrentUser() {
        const userJson = localStorage.getItem(config.AUTH.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }
}

window.AuthService = AuthService; 