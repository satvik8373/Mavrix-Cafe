const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { MenuItem } = require('./models/MenuItem');
const { Order } = require('./models/Order');

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mavrix Cafe API Server',
    status: 'running',
    endpoints: {
      menu: '/api/menu',
      orders: '/api/orders',
      health: '/health'
    }
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Add timeout
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if cannot connect to MongoDB
});

// Add connection error handler
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Add connection success handler
mongoose.connection.once('open', () => {
  console.log('MongoDB connection established successfully');
});

// API Routes
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
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
    console.error('Error fetching menu item:', error);
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
    console.error('Error creating menu item:', error);
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
    console.error('Error updating menu item:', error);
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
    console.error('Error deleting menu item:', error);
    res.status(400).json({ error: 'Error deleting menu item' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
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
    console.error('Error fetching order:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    res.status(500).json({ error: 'Error fetching order' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
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
    console.error('Error updating order:', error);
    res.status(400).json({ error: 'Error updating order' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Data Management Endpoints
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
  console.error(err.stack);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 