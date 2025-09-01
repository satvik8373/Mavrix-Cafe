// API URL
const API_URL = 'http://localhost:3000/api';

// Fetch menu items from MongoDB
async function getMenuItems() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        const menuItems = await response.json();
        return menuItems;
    } catch (error) {
        return [];
    }
}

// Save order to MongoDB
async function saveOrder(orderData) {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        const order = await response.json();
        return order;
    } catch (error) {
        throw error;
    }
}

// Get table number from URL
function getTableNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('table')) || 1;
}

// Initialize menu
async function initializeMenu() {
    const menuItems = await getMenuItems();
    displayMenuItems('all', menuItems);
}

// Display menu items
function displayMenuItems(category, menuItems) {
    const menuContainer = document.getElementById('menuItems');
    menuContainer.innerHTML = '';

    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category.toLowerCase() === category.toLowerCase());

    filteredItems.forEach(item => {
        if (item.available) {
            const itemElement = createMenuItemElement(item);
            menuContainer.appendChild(itemElement);
        }
    });
}

// Create menu item element
function createMenuItemElement(item) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="price-add">
            <span>₹${item.price.toFixed(2)}</span>
            <button onclick="addToOrder('${item._id}', '${item.name}', ${item.price})">
                <i class="fas fa-plus"></i> Add
            </button>
        </div>
    `;
    return div;
}

// Cart functionality
let cart = [];

function addToOrder(itemId, name, price) {
    const existingItem = cart.find(item => item.itemId === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ itemId, name, price, quantity: 1 });
    }
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const totalElement = document.getElementById('totalAmount');
    cartItems.innerHTML = '';

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>₹${itemTotal.toFixed(2)}</span>
            <button onclick="removeFromCart('${item.itemId}')">
                <i class="fas fa-minus"></i>
            </button>
        `;
        cartItems.appendChild(itemElement);
    });

    totalElement.textContent = `₹${total.toFixed(2)}`;
    document.getElementById('cartCount').textContent = cart.length;
}

function removeFromCart(itemId) {
    const itemIndex = cart.findIndex(item => item.itemId === itemId);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
        updateCart();
    }
}

// Place order
async function placeOrder() {
    const customerName = document.getElementById('customerName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    if (!customerName || !phoneNumber) {
        alert('Please enter your name and phone number');
        return;
    }

    if (cart.length === 0) {
        alert('Please add items to your order');
        return;
    }

    const orderData = {
        tableNumber: getTableNumber(),
        items: cart,
        totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        customerName,
        phoneNumber
    };

    try {
        showLoadingOverlay();
        const order = await saveOrder(orderData);
        cart = [];
        updateCart();
        document.getElementById('customerName').value = '';
        document.getElementById('phoneNumber').value = '';
        showSuccessMessage();
    } catch (error) {
        alert('Error placing order. Please try again.');
    } finally {
        hideLoadingOverlay();
    }
}

// Loading overlay
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="coffee-cup"></div>
            <p>Preparing your order...</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>Order placed successfully!</p>
    `;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

// Initialize the menu when the page loads
document.addEventListener('DOMContentLoaded', initializeMenu);

// Category filter buttons
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.category-btn.active').classList.remove('active');
        button.classList.add('active');
        const category = button.getAttribute('data-category');
        initializeMenu(category);
    });
}); 