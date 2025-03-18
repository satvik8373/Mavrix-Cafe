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

// Get products from localStorage or use default menu
function getMenuData() {
    const products = localStorage.getItem('cafeProducts');
    if (products) {
        return JSON.parse(products);
    }
    // If no products in localStorage, use default menu
    return menuData;
}

// Initialize menu
function initializeMenu() {
    displayMenuItems('all');
    setupCategoryButtons();
    setupOrderSubmission();
}

// Display menu items
function displayMenuItems(category) {
    menuItemsContainer.innerHTML = '';
    
    let items = [];
    const products = getMenuData();
    
    if (category === 'all') {
        items = [...(products.drinks || []), ...(products.food || []), ...(products.desserts || [])];
    } else {
        items = products[category] || [];
    }

    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        if (item.available === false) {
            menuItem.classList.add('unavailable');
        }
        
        menuItem.innerHTML = `
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)}</p>
            ${item.available === false ? 
                `<p class="unavailable-text">Currently Unavailable</p>` :
                `<button onclick="addToOrder(${item.id})" ${item.available === false ? 'disabled' : ''}>
                    Add to Order
                </button>`
            }
        `;
        menuItemsContainer.appendChild(menuItem);
    });
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

// Get orders from localStorage
function getOrders() {
    const orders = localStorage.getItem('cafeOrders');
    return orders ? JSON.parse(orders) : [];
}

// Save orders to localStorage
function saveOrders(orders) {
    localStorage.setItem('cafeOrders', JSON.stringify(orders));
}

// Setup order submission
function setupOrderSubmission() {
    submitOrderBtn.addEventListener('click', () => {
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;

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
                id: Date.now().toString(), // Convert to string to match comparison in admin
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
            console.log('Orders after save:', getOrders());
            
            // Show success modal
            orderSuccessModal.style.display = 'flex';
            
            // Reset order
            currentOrder = [];
            updateOrderDisplay();
            document.getElementById('customerName').value = '';
            document.getElementById('customerPhone').value = '';

        } catch (error) {
            console.error('Error saving order:', error);
            alert('There was an error saving your order. Please try again.');
        }
    });
}

// Close modal
function closeModal() {
    orderSuccessModal.style.display = 'none';
}

// Add these styles to your styles.css file
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .menu-item.unavailable {
        opacity: 0.7;
        position: relative;
    }
    
    .unavailable-text {
        color: #dc3545;
        font-weight: 500;
        margin: 0.5rem 0;
    }
    
    .menu-item.unavailable button {
        background: #ccc;
        cursor: not-allowed;
    }
`;
document.head.appendChild(styleSheet);

// Initialize the application
initializeMenu(); 