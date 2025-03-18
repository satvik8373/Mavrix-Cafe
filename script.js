// Menu data
const menuData = {
    drinks: [
        { id: 1, name: 'Espresso', price: 3.50, category: 'drinks' },
        { id: 2, name: 'Cappuccino', price: 4.50, category: 'drinks' },
        { id: 3, name: 'Latte', price: 4.00, category: 'drinks' },
        { id: 4, name: 'Green Tea', price: 3.00, category: 'drinks' },
    ],
    food: [
        { id: 5, name: 'Club Sandwich', price: 8.50, category: 'food' },
        { id: 6, name: 'Caesar Salad', price: 7.00, category: 'food' },
        { id: 7, name: 'Margherita Pizza', price: 12.00, category: 'food' },
        { id: 8, name: 'Pasta Alfredo', price: 10.00, category: 'food' },
    ],
    desserts: [
        { id: 9, name: 'Chocolate Cake', price: 5.00, category: 'desserts' },
        { id: 10, name: 'Ice Cream', price: 4.00, category: 'desserts' },
        { id: 11, name: 'Apple Pie', price: 4.50, category: 'desserts' },
        { id: 12, name: 'Cheesecake', price: 5.50, category: 'desserts' },
    ]
};

// Get table number from URL
const urlParams = new URLSearchParams(window.location.search);
const tableNumber = urlParams.get('table') || '1';
document.getElementById('tableNumber').textContent = tableNumber;

// Current order
let currentOrder = [];

// DOM Elements
const menuItemsContainer = document.getElementById('menuItems');
const orderItemsContainer = document.getElementById('orderItems');
const categoryButtons = document.querySelectorAll('.category-btn');
const submitOrderBtn = document.getElementById('submitOrder');
const orderSuccessModal = document.getElementById('orderSuccess');

// Data persistence functions
const STORAGE_KEYS = {
    PRODUCTS: 'mavrix_cafe_products',
    ORDERS: 'mavrix_cafe_orders',
    BACKUP: 'mavrix_cafe_backup',
    LAST_SYNC: 'mavrix_cafe_last_sync'
};

// Initialize default data if not exists
function initializeDefaultData() {
    try {
        let products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        let orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        
        // If no products exist, initialize with default menu
        if (!products) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(menuData));
            console.log('Initialized default products');
        }
        
        // If no orders exist, initialize empty array
        if (!orders) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
            console.log('Initialized empty orders');
        }
        
        createDataBackup();
        
        // Verify data was saved correctly
        const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        
        if (!savedProducts || !savedOrders) {
            throw new Error('Data initialization failed');
        }
        
        console.log('Data initialized successfully');
    } catch (error) {
        console.error('Error initializing data:', error);
        // Fallback to default data
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(menuData));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }
}

// Create backup of all data
function createDataBackup() {
    try {
        const backup = {
            products: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)),
            orders: JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)),
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backup));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        console.log('Data backup created:', backup);
    } catch (error) {
        console.error('Error creating backup:', error);
    }
}

// Restore data from backup if main data is corrupted
function restoreFromBackup() {
    try {
        const backup = JSON.parse(localStorage.getItem(STORAGE_KEYS.BACKUP));
        if (backup) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(backup.products));
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(backup.orders));
            console.log('Data restored from backup');
            return true;
        }
    } catch (error) {
        console.error('Error restoring from backup:', error);
    }
    return false;
}

// Enhanced getMenuData with improved error handling and logging
function getMenuData() {
    try {
        const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        console.log('Retrieved raw products data:', products);
        
        if (products) {
            const parsedProducts = JSON.parse(products);
            
            // Validate data structure
            if (!parsedProducts || typeof parsedProducts !== 'object') {
                throw new Error('Invalid products data structure');
            }
            
            // Ensure all required categories exist
            const requiredCategories = ['drinks', 'food', 'desserts'];
            requiredCategories.forEach(category => {
                if (!parsedProducts[category]) {
                    parsedProducts[category] = [];
                }
            });
            
            // Save validated structure back to storage
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsedProducts));
            console.log('Validated products data:', parsedProducts);
            
            return parsedProducts;
        }
        throw new Error('No products found');
    } catch (error) {
        console.error('Error getting menu data:', error);
        if (restoreFromBackup()) {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
        }
        return menuData;
    }
}

// Enhanced getOrders with backup recovery
function getOrders() {
    try {
        const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (orders) {
            const parsedOrders = JSON.parse(orders);
            if (!Array.isArray(parsedOrders)) {
                throw new Error('Invalid orders data');
            }
            return parsedOrders;
        }
        throw new Error('No orders found');
    } catch (error) {
        console.error('Error getting orders:', error);
        // Try to restore from backup
        if (restoreFromBackup()) {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS));
        }
        // If backup fails, return empty array
        return [];
    }
}

// Enhanced saveOrders with backup creation
function saveOrders(orders) {
    try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        createDataBackup(); // Create backup after successful save
        console.log('Orders saved successfully');
    } catch (error) {
        console.error('Error saving orders:', error);
        alert('There was an error saving the order. Please try again.');
    }
}

// Enhanced saveProducts with validation and sync
function saveProducts(products) {
    try {
        // Validate products structure
        if (!products || typeof products !== 'object') {
            throw new Error('Invalid products data');
        }
        
        // Ensure all products have required fields
        Object.values(products).flat().forEach(product => {
            if (!product.id || !product.name || typeof product.price !== 'number') {
                throw new Error(`Invalid product data: ${JSON.stringify(product)}`);
            }
        });
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        console.log('Products saved successfully:', products);
        
        // Create backup
        createDataBackup();
        
        // Verify save was successful
        const savedData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (!savedData) {
            throw new Error('Product save verification failed');
        }
        
        return true;
    } catch (error) {
        console.error('Error saving products:', error);
        alert('There was an error saving the products. Please try again.');
        return false;
    }
}

// Periodic backup check (every 5 minutes)
setInterval(() => {
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (!lastSync || (new Date() - new Date(lastSync)) > 5 * 60 * 1000) {
        createDataBackup();
    }
}, 5 * 60 * 1000);

// Initialize menu
function initializeMenu() {
    displayMenuItems('all');
    setupCategoryButtons();
    setupOrderSubmission();
}

// Display menu items
function displayMenuItems(category) {
    try {
        menuItemsContainer.innerHTML = '<div class="loading">Loading menu items...</div>';
        
        const products = getMenuData();
        let items = [];
        
        if (category === 'all') {
            Object.keys(products).forEach(cat => {
                if (Array.isArray(products[cat])) {
                    items = items.concat(products[cat]);
                }
            });
        } else if (products[category] && Array.isArray(products[category])) {
            items = products[category];
        }
        
        menuItemsContainer.innerHTML = '';
        
        if (items.length === 0) {
            menuItemsContainer.innerHTML = `
                <div class="no-items-message">
                    <p>No items available in this category</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            if (!item || typeof item !== 'object') {
                console.error('Invalid item:', item);
                return;
            }

            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            
            if (item.available === false) {
                menuItem.classList.add('unavailable');
            }
            
            menuItem.innerHTML = `
                <h3>${item.name || 'Unnamed Item'}</h3>
                <p>₹${(item.price || 0).toFixed(2)}</p>
                ${item.available === false ? 
                    `<p class="unavailable-text">Currently Unavailable</p>` :
                    `<button onclick="addToOrder(${item.id})" ${item.available === false ? 'disabled' : ''}>
                        Add to Order
                    </button>`
                }
            `;
            menuItemsContainer.appendChild(menuItem);
        });
    } catch (error) {
        console.error('Error displaying menu items:', error);
        menuItemsContainer.innerHTML = `
            <div class="error-message">
                <p>Error loading menu items. Please try refreshing the page.</p>
            </div>
        `;
    }
}

// Setup category buttons
function setupCategoryButtons() {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayMenuItems(button.dataset.category);
        });
    });
}

// Add item to order
function addToOrder(itemId) {
    const products = getMenuData();
    const allItems = [...(products.drinks || []), ...(products.food || []), ...(products.desserts || [])];
    const item = allItems.find(item => item.id === itemId);
    
    if (item && item.available !== false) {
        const existingItem = currentOrder.find(orderItem => orderItem.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            currentOrder.push({ ...item, quantity: 1 });
        }
        updateOrderDisplay();
    }
}

// Update order display
function updateOrderDisplay() {
    orderItemsContainer.innerHTML = '';
    let total = 0;

    currentOrder.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>$${itemTotal.toFixed(2)}</span>
            <button onclick="removeFromOrder(${item.id})">Remove</button>
        `;
        orderItemsContainer.appendChild(orderItem);
    });

    if (currentOrder.length > 0) {
        const totalElement = document.createElement('div');
        totalElement.className = 'order-item total';
        totalElement.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
        orderItemsContainer.appendChild(totalElement);
    }
}

// Remove item from order
function removeFromOrder(itemId) {
    currentOrder = currentOrder.filter(item => item.id !== itemId);
    updateOrderDisplay();
}

// Modified setupOrderSubmission with enhanced error handling
function setupOrderSubmission() {
    submitOrderBtn.addEventListener('click', () => {
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();

        if (!customerName || !customerPhone) {
            alert('Please fill in your name and phone number');
            return;
        }

        if (currentOrder.length === 0) {
            alert('Please add items to your order');
            return;
        }

        try {
            const orders = getOrders();
            console.log('Existing orders:', orders);

            const newOrder = {
                id: Date.now().toString(),
                tableNumber,
                customerName,
                customerPhone,
                items: currentOrder,
                status: 'pending',
                timestamp: new Date().toISOString(),
                total: currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };
            console.log('New order:', newOrder);

            orders.push(newOrder);
            saveOrders(orders);
            
            // Show success modal
            orderSuccessModal.style.display = 'flex';
            
            // Reset order
            currentOrder = [];
            updateOrderDisplay();
            document.getElementById('customerName').value = '';
            document.getElementById('customerPhone').value = '';

        } catch (error) {
            console.error('Error processing order:', error);
            alert('There was an error processing your order. Please try again.');
        }
    });
}

// Close modal
function closeModal() {
    orderSuccessModal.style.display = 'none';
}

// Add these styles for better mobile display
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .menu-item {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
        transition: transform 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .menu-item h3 {
        margin: 0;
        color: #333;
        font-size: 1.1rem;
    }

    .menu-item p {
        margin: 0;
        color: #666;
        font-weight: 500;
    }

    .menu-item button {
        background: var(--primary-color, #2c3e50);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s ease;
    }

    .menu-item button:hover {
        background: var(--secondary-color, #34495e);
    }

    .menu-item.unavailable {
        opacity: 0.7;
    }

    .unavailable-text {
        color: #dc3545;
        font-size: 0.9rem;
    }

    .no-items-message,
    .error-message {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    @media (max-width: 768px) {
        .menu-item {
            margin: 0.5rem;
            padding: 0.8rem;
        }

        .menu-item h3 {
            font-size: 1rem;
        }

        .menu-item button {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
        }
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: var(--coffee-dark);
        font-weight: 500;
    }
    
    .menu-item {
        opacity: 0;
        animation: fadeIn 0.3s ease forwards;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleSheet);

// Initialize data when the application starts
initializeDefaultData();

// Initialize the application
initializeMenu();

// Add synchronization check on page load
window.addEventListener('load', () => {
    try {
        initializeDefaultData();
        
        // Verify data accessibility
        const products = getMenuData();
        const orders = getOrders();
        
        console.log('Initial data load - Products:', products);
        console.log('Initial data load - Orders:', orders);
        
        // Setup periodic data refresh
        setInterval(() => {
            displayMenuItems(document.querySelector('.category-btn.active')?.dataset.category || 'all');
        }, 30000); // Refresh every 30 seconds
        
    } catch (error) {
        console.error('Error during initial data load:', error);
    }
}); 