// Environment Configuration
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isProduction = window.location.hostname === 'mavrix-cafe.onrender.com';

// API URL Configuration
const API_URL = isProduction 
    ? 'https://mavrix-cafe-api.onrender.com/api'
    : 'http://localhost:5000/api';

// Export configuration
window.API_CONFIG = {
    API_URL: API_URL,
    ENVIRONMENT: isProduction ? 'production' : 'development',
    FRONTEND_URL: isProduction ? 'https://mavrix-cafe.onrender.com' : 'http://localhost:3000'
};

console.log(`🌐 Environment: ${window.API_CONFIG.ENVIRONMENT}`);
console.log(`🔗 API URL: ${window.API_CONFIG.API_URL}`);
console.log(`🏠 Frontend URL: ${window.API_CONFIG.FRONTEND_URL}`); 