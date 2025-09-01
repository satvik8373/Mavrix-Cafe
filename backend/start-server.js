// Load environment variables from .env file
require('dotenv').config();

// Set environment variables based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';

// Set default values if not in .env
process.env.PORT = process.env.PORT || '5000';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'mavrix_cafe_jwt_secret_2024';

console.log(`🚀 Starting server in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
console.log(`🌐 CORS Origin: ${isProduction ? 'https://mavrix-cafe.onrender.com' : 'http://localhost:3000'}`);

// Start the server
require('./server.js');
