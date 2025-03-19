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
                    .receipt {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                        box-shadow: none !important;
                    }
                    .receipt * {
                        visibility: visible;
                    }
                    .receipt-actions {
                        display: none !important;
                    }
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                }

                .receipt {
                    font-family: 'Arial', sans-serif;
                    max-width: 80mm;
                    margin: 0 auto;
                    padding: 20px;
                    background: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }

                .receipt-logo {
                    text-align: center;
                    margin-bottom: 15px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #2c3e50;
                }

                .receipt-header {
                    text-align: center;
                    border-bottom: 1px dashed #ccc;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }

                .receipt-info {
                    font-size: 14px;
                    margin: 5px 0;
                    color: #555;
                }

                .receipt-customer {
                    margin: 15px 0;
                    padding: 10px 0;
                    border-bottom: 1px dashed #ccc;
                }

                .receipt-items {
                    margin: 15px 0;
                }

                .receipt-item {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                    font-size: 14px;
                }

                .receipt-item-details {
                    flex: 1;
                }

                .receipt-item-price {
                    text-align: right;
                    font-weight: 500;
                }

                .receipt-subtotal {
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px dashed #ccc;
                }

                .receipt-total {
                    margin: 15px 0;
                    padding: 10px 0;
                    border-top: 2px solid #2c3e50;
                    border-bottom: 2px solid #2c3e50;
                    font-weight: bold;
                    font-size: 16px;
                    display: flex;
                    justify-content: space-between;
                }

                .receipt-footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }

                .receipt-qr {
                    text-align: center;
                    margin: 15px 0;
                }

                .receipt-qr img {
                    width: 100px;
                    height: 100px;
                }

                .receipt-contact {
                    text-align: center;
                    margin-top: 15px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
            <div class="receipt-logo">
                MAVRIX CAFE
            </div>
            <div class="receipt-header">
                <div class="receipt-info">Tax Invoice</div>
                <div class="receipt-info">Order #${order._id.slice(-6).toUpperCase()}</div>
                <div class="receipt-info">${formatDate(order.timestamp)}</div>
            </div>
            <div class="receipt-customer">
                <div class="receipt-info">Customer: ${order.customerName}</div>
                <div class="receipt-info">Phone: ${order.phoneNumber}</div>
                <div class="receipt-info">Table: ${order.tableNumber}</div>
            </div>
            <div class="receipt-items">
                <div class="receipt-item" style="font-weight: bold;">
                    <div class="receipt-item-details">Item × Qty</div>
                    <div class="receipt-item-price">Amount</div>
                </div>
                ${order.items.map(item => `
                    <div class="receipt-item">
                        <div class="receipt-item-details">
                            ${item.name} × ${item.quantity}
                        </div>
                        <div class="receipt-item-price">
                            ${formatCurrency(item.price * item.quantity)}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="receipt-subtotal">
                <div class="receipt-item">
                    <div class="receipt-item-details">Subtotal</div>
                    <div class="receipt-item-price">${formatCurrency(order.totalAmount)}</div>
                </div>
                <div class="receipt-item">
                    <div class="receipt-item-details">GST (5%)</div>
                    <div class="receipt-item-price">${formatCurrency(order.totalAmount * 0.05)}</div>
                </div>
            </div>
            <div class="receipt-total">
                <div>Total Amount</div>
                <div>${formatCurrency(order.totalAmount * 1.05)}</div>
            </div>
            <div class="receipt-footer">
                <p>Thank you for dining with us!</p>
                <p>Visit us again soon</p>
            </div>
            <div class="receipt-contact">
                <p>Contact: +91 9876543210</p>
                <p>www.mavrixcafe.com</p>
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
                <title>Invoice #${orderId.slice(-6).toUpperCase()}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
                ${receiptElement.outerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Export functions for use in admin.html
window.printReceipt = printReceipt;
window.generateReceiptHTML = generateReceiptHTML; 