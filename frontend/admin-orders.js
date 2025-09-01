// Order filtering and pagination functionality
let currentPage = 1;
const ordersPerPage = 20;
let filteredOrders = [];

// Filter parameters
const filterParams = {
    orderNo: '',
    date: '',
    phoneNumber: '',
    startDate: '',
    endDate: ''
};

// Initialize orders display with filters
async function initializeOrdersDisplay() {
    setupFilterListeners();
    await fetchAndDisplayOrders();
    setupPagination();
}

// Setup filter input listeners
function setupFilterListeners() {
    document.getElementById('orderNoFilter').addEventListener('input', debounce(handleFilterChange, 300));
    document.getElementById('phoneFilter').addEventListener('input', debounce(handleFilterChange, 300));
    document.getElementById('startDate').addEventListener('change', handleFilterChange);
    document.getElementById('endDate').addEventListener('change', handleFilterChange);
}

// Handle filter changes
async function handleFilterChange(event) {
    const { id, value } = event.target;
    switch(id) {
        case 'orderNoFilter':
            filterParams.orderNo = value;
            break;
        case 'phoneFilter':
            filterParams.phoneNumber = value;
            break;
        case 'startDate':
            filterParams.startDate = value;
            break;
        case 'endDate':
            filterParams.endDate = value;
            break;
    }
    currentPage = 1; // Reset to first page when filters change
    await fetchAndDisplayOrders();
}

// Fetch and display orders with filters
async function fetchAndDisplayOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        let orders = await response.json();

        // Apply filters
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            const matchesOrderNo = !filterParams.orderNo || order._id.includes(filterParams.orderNo);
            const matchesPhone = !filterParams.phoneNumber || order.phoneNumber.includes(filterParams.phoneNumber);
            const matchesDateRange = (!filterParams.startDate || orderDate >= new Date(filterParams.startDate)) &&
                                   (!filterParams.endDate || orderDate <= new Date(filterParams.endDate + 'T23:59:59'));
            return matchesOrderNo && matchesPhone && matchesDateRange;
        });

        // Sort orders by date (newest first)
        filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Update pagination
        setupPagination();
        
        // Display current page
        displayOrdersPage();

            } catch (error) {
            showNotification('Failed to fetch orders', 'error');
        }
}

// Display orders for current page
function displayOrdersPage() {
    const ordersGrid = document.getElementById('ordersGrid');
    ordersGrid.innerHTML = '';

    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToDisplay = filteredOrders.slice(startIndex, endIndex);

    if (ordersToDisplay.length === 0) {
        ordersGrid.innerHTML = '<div class="no-orders">No orders found matching the filters</div>';
        return;
    }

    ordersToDisplay.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersGrid.appendChild(orderCard);
    });
}

// Setup pagination controls
function setupPagination() {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevButton = createPaginationButton('Previous', currentPage > 1, () => {
        if (currentPage > 1) {
            currentPage--;
            displayOrdersPage();
            setupPagination();
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i.toString(), true, () => {
            currentPage = i;
            displayOrdersPage();
            setupPagination();
        });
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nextButton = createPaginationButton('Next', currentPage < totalPages, () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayOrdersPage();
            setupPagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Create pagination button
function createPaginationButton(text, enabled, onClick) {
    const button = document.createElement('button');
    button.className = `pagination-btn ${!enabled ? 'disabled' : ''}`;
    button.textContent = text;
    if (enabled) {
        button.addEventListener('click', onClick);
    }
    return button;
}

// Debounce function for input handlers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Helper function to format date
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initializeOrdersDisplay); 