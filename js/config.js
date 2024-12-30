const config = {
    API_URL: 'http://localhost:5000/api',
    WS_URL: window.location.protocol === 'https:' 
        ? `wss://${window.location.host}` 
        : `ws://${window.location.hostname}:8080`,
    CHAT_SETTINGS: {
        MAX_FILE_SIZE: 5 * 1024 * 1024,
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'],
        DEFAULT_HEIGHT: '500px',
        MINIMIZED_HEIGHT: '48px'
    },
    CURRENCY: {
        EXCHANGE_RATE: 36, // USD to ZWL
        DEFAULT: 'USD',
        SUPPORTED: ['USD', 'ZWL']
    },
    AUTH: {
        TOKEN_KEY: 'token',
        USER_KEY: 'user'
    }
}; 