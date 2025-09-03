const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { MenuItem } = require('./models/MenuItem');
const { Order } = require('./models/Order');
const User = require('./models/User');

// Robust auth imports (supports both named and default exports)
const authModule = require('./middleware/auth');
const auth = typeof authModule === 'function' ? authModule : authModule.auth;
const adminAuth = authModule.adminAuth || ((req, res, next) => next());
const staffAuth = authModule.staffAuth || ((req, res, next) => next());

dotenv.config();

// Initialize Twilio client (only if credentials are available)
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN !== 'your_actual_auth_token_here') {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio client initialized successfully');
  } else {
    console.log('⚠️  Twilio not configured - running in development mode');
  }
} catch (error) {
  console.log('❌ Twilio client initialization failed:', error.message);
  console.log('⚠️  Running in development mode');
}

const app = express();
const ADMIN_PIN = process.env.ADMIN_PIN || '837337';

// CORS configuration
const allowlistProd = [
  process.env.CORS_ORIGIN || 'https://mavrix-cafe.onrender.com',
  'https://mavrix-cafe.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or tools (no origin)
    if (!origin) return callback(null, true);

    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      const allowed = allowlistProd.includes(origin);
      return callback(allowed ? null : new Error('CORS not allowed'), allowed);
    }

    // Development: allow localhost and common private LAN ranges
    const devAllowed = [
      /^http:\/\/localhost:\d{2,5}$/,
      /^http:\/\/127\.0\.0\.1:\d{2,5}$/,
      /^http:\/\/(10|172|192)\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}):\d{2,5}$/
    ];
    const matched = devAllowed.some((re) => re.test(origin));
    return callback(matched ? null : new Error('CORS not allowed'), matched);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-admin-pin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());



// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mavrix-cafe';

// Start server first, then try to connect to MongoDB
const startServer = () => {
  const PORT = process.env.PORT || 5000;
  
  // Create server instance
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mavrix Cafe API Server running on port ${PORT}`);
    console.log(`🌐 Server bound to: 0.0.0.0:${PORT}`);
    console.log(`📱 Authentication: ${twilioClient ? 'Twilio SMS Enabled' : 'Development Mode (Test Codes)'}`);
    console.log(`🔗 Health Check: http://0.0.0.0:${PORT}/health`);
    console.log(`📋 API Endpoints:`);
    console.log(`   - Menu: http://0.0.0.0:${PORT}/api/menu`);
    console.log(`   - Orders: http://0.0.0.0:${PORT}/api/orders`);
    console.log(`   - Auth: http://0.0.0.0:${PORT}/api/auth/send-verification`);
    console.log(`✅ Server is ready to accept requests!`);
  });

  // Handle server errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      console.log(`💡 Try using a different port: PORT=${PORT + 1} npm run dev`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🔄 Shutting down server gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
};

// Try to connect to MongoDB, but don't block server startup
const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  MongoDB not available - some features may not work');
    console.log('💡 To enable full functionality, start MongoDB:');
    console.log('   - Windows: Start MongoDB service');
    console.log('   - Mac/Linux: brew services start mongodb-community');
    console.log('   - Or use MongoDB Atlas for cloud database');
    console.log('   - Or set MONGODB_URI environment variable');
  }
};

// Start the server immediately
startServer();

// Try to connect to MongoDB after server starts
setTimeout(connectMongoDB, 1000);

// Add connection error handler
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Add connection success handler
mongoose.connection.once('open', () => {
  // MongoDB connection established successfully
});

// Authentication Routes
app.post('/api/auth/send-verification', async (req, res) => {
  try {
    const { phoneNumber, name } = req.body;
    
    if (!phoneNumber || !name) {
      return res.status(400).json({ error: 'Phone number and name are required' });
    }

    // Format phone number to include country code if not present
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+91${phoneNumber}`; // Default to India (+91)
    }

    // Check if user exists
    let user = await User.findOne({ phoneNumber: formattedPhone });
    
    if (!user) {
      // Create new user
      user = new User({
        phoneNumber: formattedPhone,
        name: name
      });
    }

    // Generate verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send SMS via Twilio
    if (twilioClient) {
      try {
        console.log(`📱 Sending SMS to ${formattedPhone} via Twilio...`);
        
        const verification = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID || 'your_twilio_verify_service_sid_here')
          .verifications.create({
            to: formattedPhone,
            channel: 'sms'
          });

        console.log(`✅ SMS sent successfully. Status: ${verification.status}`);
        
        res.json({ 
          message: 'Verification code sent successfully via SMS',
          phoneNumber: formattedPhone,
          status: verification.status
        });
      } catch (twilioError) {
        console.error('❌ Twilio SMS failed:', twilioError.message);
        console.error('❌ Twilio Error Code:', twilioError.code);
        console.error('❌ Twilio Error Details:', twilioError);
        
        // If Twilio fails, fall back to test mode
        let errorMessage = 'SMS service temporarily unavailable. Using test mode.';
        if (twilioError.message.includes('unverified')) {
          errorMessage = 'Trial account: Phone number not verified. Using test mode.';
        }
        
        res.json({ 
          message: errorMessage,
          phoneNumber: formattedPhone,
          testCode: verificationCode,
          error: 'SMS service unavailable',
          twilioError: twilioError.message,
          note: 'For real SMS, verify your phone number at twilio.com/user/account/phone-numbers/verified'
        });
      }
    } else {
      // Twilio not configured, use test mode
      console.log(`🧪 Development mode: Generated test code ${verificationCode} for ${formattedPhone}`);
      
      res.json({ 
        message: 'Verification code sent successfully (Development Mode)',
        phoneNumber: formattedPhone,
        testCode: verificationCode
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and verification code are required' });
    }

    // Format phone number
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+91${phoneNumber}`;
    }

    // Find user
    const user = await User.findOne({ phoneNumber: formattedPhone });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if verification code is expired
    if (user.isVerificationExpired()) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Verify code
    if (twilioClient) {
      try {
        console.log(`🔍 Verifying code ${code} for ${formattedPhone} via Twilio...`);
        
        const verificationCheck = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID || 'your_twilio_verify_service_sid_here')
          .verificationChecks.create({
            to: formattedPhone,
            code: code
          });

        console.log(`📋 Verification status: ${verificationCheck.status}`);

        if (verificationCheck.status === 'approved') {
          user.isVerified = true;
          user.verificationCode = null;
          user.verificationExpiry = null;
          user.lastLogin = new Date();
          await user.save();

          // Generate JWT token
          const token = jwt.sign(
            { userId: user._id, phoneNumber: user.phoneNumber },
            process.env.JWT_SECRET || 'your_jwt_secret_here',
            { expiresIn: '7d' }
          );

          console.log(` User ${user.name} verified successfully`);

          res.json({
            message: 'Phone number verified successfully',
            token: token,
            user: {
              id: user._id,
              name: user.name,
              phoneNumber: user.phoneNumber,
              isVerified: user.isVerified
            }
          });
        } else {
          console.log(`❌ Verification failed: ${verificationCheck.status}`);
          res.status(400).json({ error: 'Invalid verification code' });
        }
      } catch (twilioError) {
        console.error('❌ Twilio verification failed:', twilioError.message);
        
        // Fall back to test mode verification
        if (user.verificationCode === code) {
          user.isVerified = true;
          user.verificationCode = null;
          user.verificationExpiry = null;
          user.lastLogin = new Date();
          await user.save();

          const token = jwt.sign(
            { userId: user._id, phoneNumber: user.phoneNumber },
            process.env.JWT_SECRET || 'your_jwt_secret_here',
            { expiresIn: '7d' }
          );

          console.log(`✅ User ${user.name} verified via fallback method`);

          res.json({
            message: 'Phone number verified successfully (Fallback Mode)',
            token: token,
            user: {
              id: user._id,
              name: user.name,
              phoneNumber: user.phoneNumber,
              isVerified: user.isVerified
            }
          });
        } else {
          res.status(400).json({ error: 'Invalid verification code' });
        }
      }
    } else {
      // Twilio not configured, use test mode
      console.log(`🧪 Development mode: Verifying code ${code} for ${formattedPhone}`);
      
      if (user.verificationCode === code) {
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationExpiry = null;
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
          { userId: user._id, phoneNumber: user.phoneNumber },
          process.env.JWT_SECRET || 'your_jwt_secret_here',
          { expiresIn: '7d' }
        );

        console.log(`✅ User ${user.name} verified in development mode`);

        res.json({
          message: 'Phone number verified successfully (Development Mode)',
          token: token,
          user: {
            id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            isVerified: user.isVerified
          }
        });
      } else {
        console.log(`❌ Invalid test code: ${code} (expected: ${user.verificationCode})`);
        res.status(400).json({ error: 'Invalid verification code' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// User profile and orders
app.get('/api/user/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('orders');
    res.json({
      id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      orders: user.orders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.get('/api/user/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ timestamp: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// API Routes
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching menu items' });
  }
});

// Add GET endpoint for single menu item
app.get('/api/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid menu item ID format' });
    }
    res.status(500).json({ error: 'Error fetching menu item' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ error: 'Error creating menu item' });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ error: 'Error updating menu item' });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting menu item' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Add GET endpoint for single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    res.status(500).json({ error: 'Error fetching order' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // If user is authenticated, add user ID to order
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
        orderData.userId = decoded.userId;
      } catch (tokenError) {
        // Token is invalid, continue without user ID
      }
    }
    
    const order = new Order(orderData);
    await order.save();
    
    // If order has user ID, update user's orders array
    if (orderData.userId) {
      await User.findByIdAndUpdate(
        orderData.userId,
        { $push: { orders: order._id } }
      );
    }
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Error creating order' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Error updating order' });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const status = mongoStatus === 'connected' ? 'healthy' : 'degraded';
  
  res.json({ 
    status: status,
    mongodb: mongoStatus,
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString(),
    message: mongoStatus === 'connected' ? 'All systems operational' : 'Running without database'
  });
});

// Root endpoint for Render health checks
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mavrix Cafe API Server is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    host: '0.0.0.0'
  });
});

// Data Management Endpoints
// Admin: List users with login data
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, {
      name: 1,
      phoneNumber: 1,
      isVerified: 1,
      createdAt: 1,
      lastLogin: 1,
      orders: 1,
      role: 1,
      username: 1
    }).sort({ lastLogin: -1 }).lean();

    const result = users.map(u => ({
      _id: u._id,
      name: u.name,
      phoneNumber: u.phoneNumber,
      isVerified: !!u.isVerified,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      ordersCount: Array.isArray(u.orders) ? u.orders.length : 0,
      role: u.role,
      username: u.username
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin: Create staff user (admin only)
// Allow either Admin PIN header or JWT admin token
const allowAdmin = async (req, res, next) => {
  try {
    if (req.header('x-admin-pin') && req.header('x-admin-pin') === ADMIN_PIN) {
      return next();
    }
    // Fallback to JWT-based admin auth
    return auth(req, res, (err) => {
      if (err) return res.status(401).json({ error: 'Unauthorized' });
      return adminAuth(req, res, next);
    });
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

app.post('/api/admin/staff', allowAdmin, async (req, res) => {
  try {
    const { name, username, password } = req.body || {};
    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Name, username and password are required' });
    }
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const staff = await User.create({
      role: 'staff',
      name,
      username,
      password: hashed,
      isVerified: true
    });
    res.status(201).json({
      _id: staff._id,
      name: staff.name,
      username: staff.username,
      role: staff.role,
      createdAt: staff.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create staff' });
  }
});

// Staff login (username/password)
app.post('/api/auth/staff/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username }).select('+password');
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '7d' });
    res.json({
      token,
      user: { _id: user._id, name: user.name, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Staff-only: view orders
app.get('/api/staff/orders', auth, staffAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Staff: complete an order
app.put('/api/staff/orders/:id/complete', auth, staffAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If already completed, return idempotent success
    if (order.status === 'completed') {
      return res.json(order);
    }

    order.status = 'completed';
    await order.save();

    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    res.status(500).json({ error: 'Failed to complete order' });
  }
});
app.post('/api/orders/import', async (req, res) => {
    try {
        const orders = req.body;
        if (!Array.isArray(orders)) {
            return res.status(400).json({ message: 'Invalid data format. Expected array of orders.' });
        }

        await Order.deleteMany({}); // Clear existing orders
        await Order.insertMany(orders);
        
        res.json({ message: 'Orders imported successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to import orders', error: error.message });
    }
});

app.post('/api/menu/import', async (req, res) => {
    try {
        const menuItems = req.body;
        if (!Array.isArray(menuItems)) {
            return res.status(400).json({ message: 'Invalid data format. Expected array of menu items.' });
        }

        await MenuItem.deleteMany({}); // Clear existing menu items
        await MenuItem.insertMany(menuItems);
        
        res.json({ message: 'Menu items imported successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to import menu items', error: error.message });
    }
});

app.delete('/api/orders/all', async (req, res) => {
    try {
        await Order.deleteMany({});
        res.json({ message: 'All orders deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete orders', error: error.message });
    }
});

app.delete('/api/menu/all', async (req, res) => {
    try {
        await MenuItem.deleteMany({});
        res.json({ message: 'All menu items deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete menu items', error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Admin: Update staff password
app.put('/api/admin/staff/:id/password', allowAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body || {};
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password is required (min 4 chars)' });
    }

    const staff = await User.findById(id).select('+password');
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    if (staff.role !== 'staff' && staff.role !== 'admin') {
      return res.status(400).json({ error: 'User is not staff/admin' });
    }

    staff.password = await bcrypt.hash(password, 10);
    await staff.save();
    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Admin: Delete staff user
app.delete('/api/admin/staff/:id', allowAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findById(id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    if (staff.role !== 'staff') {
      return res.status(400).json({ error: 'Only staff accounts can be deleted' });
    }
    await User.findByIdAndDelete(id);
    res.json({ message: 'Staff deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete staff' });
  }
});

 