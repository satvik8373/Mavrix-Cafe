const config = {
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://your-backend-url.onrender.com/api'
};

export default config; 