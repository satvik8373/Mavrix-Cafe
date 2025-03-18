require('dotenv').config();
const mongoose = require('mongoose');
const { MenuItem } = require('./models/MenuItem');

const sampleMenuItems = [
  {
    name: 'Espresso',
    price: 120,
    category: 'drinks',
    description: 'Rich and aromatic single shot espresso',
    image: 'https://images.unsplash.com/photo-1510591509098-f4b5d5c0634d',
    available: true
  },
  {
    name: 'Cappuccino',
    price: 150,
    category: 'drinks',
    description: 'Espresso with steamed milk foam and chocolate powder',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38',
    available: true
  },
  {
    name: 'Latte',
    price: 140,
    category: 'drinks',
    description: 'Espresso with steamed milk and light foam',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f',
    available: true
  },
  {
    name: 'Club Sandwich',
    price: 180,
    category: 'food',
    description: 'Triple-decker sandwich with chicken, bacon, lettuce, and tomato',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
    available: true
  },
  {
    name: 'Chicken Caesar Salad',
    price: 160,
    category: 'food',
    description: 'Fresh romaine lettuce, grilled chicken, parmesan, and caesar dressing',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9',
    available: true
  },
  {
    name: 'Chocolate Cake',
    price: 160,
    category: 'desserts',
    description: 'Rich chocolate layer cake with chocolate ganache',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    available: true
  },
  {
    name: 'Cheesecake',
    price: 150,
    category: 'desserts',
    description: 'New York style cheesecake with berry compote',
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50',
    available: true
  }
];

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    // Add sample menu items
    const result = await MenuItem.insertMany(sampleMenuItems);
    console.log('Added sample menu items:', result);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

// Run the initialization
initializeDatabase(); 