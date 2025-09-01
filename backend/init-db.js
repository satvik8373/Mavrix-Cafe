const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MenuItem } = require('./models/MenuItem');

dotenv.config();

const sampleMenuItems = [
    {
        name: 'Espresso',
        price: 120,
        category: 'drinks',
        description: 'Strong brewed coffee',
        available: true
    },
    {
        name: 'Cappuccino',
        price: 150,
        category: 'drinks',
        description: 'Espresso with steamed milk foam',
        available: true
    },
    {
        name: 'Club Sandwich',
        price: 180,
        category: 'food',
        description: 'Classic club sandwich with chicken',
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
        // Connected to MongoDB

        // Clear existing menu items
        await MenuItem.deleteMany({});
        // Cleared existing menu items

        // Insert sample menu items
        const result = await MenuItem.insertMany(sampleMenuItems);
        // Added sample menu items

        // Database initialization completed successfully
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
    }
}

// Run the initialization
initializeDatabase(); 