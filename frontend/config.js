window.config = {
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://mavrix-cafe-api.onrender.com/api',
  isAdmin: window.location.pathname.includes('admin.html')
}; 