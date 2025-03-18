const config = {
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://mavrix-cafe-api.onrender.com/api'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else {
  window.config = config;
} 