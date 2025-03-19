// Print Receipt Functionality
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

function generateReceiptHTML(order) {
    return `
        <div class="receipt" id="receipt-${order._id}">
            <style>
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #receipt-${order._id}, #receipt-${order._id} * {
                        visibility: visible;
                    }
                    #receipt-${order._id} {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                        padding: 10mm;
                    }
                    .receipt-actions {
                        display: none !important;
                    }
                }
                .receipt {
                    font-family: 'Courier New', monospace;
                    width: 80mm;
                    padding: 10mm;
                    text-align: center;
                }
                .receipt-header {
                    margin-bottom: 10px;
                }
                .receipt-title {
                    font-size: 1.2em;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .receipt-info {
                    margin: 5px 0;
                    font-size: 0.9em;
                }
                .receipt-items {
                    margin: 10px 0;
                    border-top: 1px dashed #000;
                    border-bottom: 1px dashed #000;
                    padding: 10px 0;
                }
                .receipt-item {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                    text-align: left;
                }
                .receipt-item-details {
                    flex: 1;
                }
                .receipt-total {
                    margin: 10px 0;
                    font-weight: bold;
                    text-align: right;
                }
                .receipt-footer {
                    margin-top: 10px;
                    font-size: 0.8em;
                }
                .receipt-actions {
                    margin-top: 20px;
                    text-align: center;
                }
                @page {
                    size: 80mm 200mm;
                    margin: 0;
                }
            </style>
            <div class="receipt-header">
                <div class="receipt-title">MAVRIX CAFE</div>
                <div class="receipt-info">Order #${order._id.slice(-6).toUpperCase()}</div>
                <div class="receipt-info">${formatDate(order.timestamp)}</div>
                <div class="receipt-info">Table: ${order.tableNumber}</div>
                <div class="receipt-info">Customer: ${order.customerName}</div>
                <div class="receipt-info">Phone: ${order.phoneNumber}</div>
            </div>
            <div class="receipt-items">
                ${order.items.map(item => `
                    <div class="receipt-item">
                        <div class="receipt-item-details">
                            ${item.name} x ${item.quantity}
                        </div>
                        <div class="receipt-item-price">
                            ${formatCurrency(item.price * item.quantity)}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="receipt-total">
                Total: ${formatCurrency(order.totalAmount)}
            </div>
            <div class="receipt-footer">
                <p>Thank you for dining with us!</p>
                <p>Visit us again</p>
            </div>
            <div class="receipt-actions">
                <button onclick="printReceipt('${order._id}')" class="print-btn">
                    <i class="fas fa-print"></i> Print Receipt
                </button>
            </div>
        </div>
    `;
}

function printReceipt(orderId) {
    const receiptElement = document.getElementById(`receipt-${orderId}`);
    if (!receiptElement) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Order Receipt #${orderId.slice(-6).toUpperCase()}</title>
            </head>
            <body>
                ${receiptElement.outerHTML}
            </body>
        </html>
    `);
    
    // Wait for content to load
    printWindow.document.close();
    printWindow.focus();
    
    // Print the receipt
    setTimeout(() => {
        printWindow.print();
        // Close the window after printing
        printWindow.addEventListener('afterprint', () => {
            printWindow.close();
        });
    }, 500);
}

// Export functions for use in admin.html
window.printReceipt = printReceipt;
window.generateReceiptHTML = generateReceiptHTML; 