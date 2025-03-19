// Print Receipt Functionality
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
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
                        padding: 5mm;
                        margin: 0;
                    }
                    .receipt-actions {
                        display: none !important;
                    }
                }
                .receipt {
                    font-family: 'Courier New', monospace;
                    width: 80mm;
                    padding: 5mm;
                    text-align: center;
                    background: white;
                    border: 1px solid #ddd;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .receipt-logo {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #000;
                }
                .receipt-header {
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 1px dashed #000;
                }
                .receipt-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .receipt-info {
                    margin: 5px 0;
                    font-size: 14px;
                }
                .receipt-items {
                    margin: 15px 0;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 15px;
                }
                .receipt-item {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                    text-align: left;
                    font-size: 14px;
                }
                .receipt-item-details {
                    flex: 1;
                }
                .receipt-item-price {
                    text-align: right;
                    margin-left: 15px;
                }
                .receipt-subtotal {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    padding-top: 10px;
                    font-size: 14px;
                }
                .receipt-total {
                    display: flex;
                    justify-content: space-between;
                    margin: 15px 0;
                    padding-top: 10px;
                    border-top: 2px solid #000;
                    font-weight: bold;
                    font-size: 16px;
                }
                .receipt-footer {
                    margin-top: 20px;
                    font-size: 12px;
                    text-align: center;
                    padding-top: 15px;
                    border-top: 1px dashed #000;
                }
                .receipt-contact {
                    margin-top: 10px;
                    font-size: 12px;
                }
                .receipt-barcode {
                    margin-top: 15px;
                    font-family: 'Libre Barcode 39', cursive;
                    font-size: 40px;
                }
                @page {
                    size: 80mm auto;
                    margin: 0;
                }
            </style>
            <div class="receipt-logo">
                MAVRIX CAFE
            </div>
            <div class="receipt-header">
                <div class="receipt-title">TAX INVOICE</div>
                <div class="receipt-info">Order #${order._id.slice(-6).toUpperCase()}</div>
                <div class="receipt-info">${formatDate(order.timestamp)}</div>
                <div class="receipt-info">Table: ${order.tableNumber}</div>
                <div class="receipt-info">Customer: ${order.customerName}</div>
                <div class="receipt-info">Phone: ${order.phoneNumber}</div>
            </div>
            <div class="receipt-items">
                <div class="receipt-item" style="font-weight: bold; border-bottom: 1px solid #000;">
                    <div class="receipt-item-details">Item x Qty</div>
                    <div class="receipt-item-price">Amount</div>
                </div>
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
            <div class="receipt-subtotal">
                <span>Subtotal:</span>
                <span>${formatCurrency(order.totalAmount)}</span>
            </div>
            <div class="receipt-subtotal">
                <span>GST (5%):</span>
                <span>${formatCurrency(order.totalAmount * 0.05)}</span>
            </div>
            <div class="receipt-total">
                <span>TOTAL:</span>
                <span>${formatCurrency(order.totalAmount * 1.05)}</span>
            </div>
            <div class="receipt-footer">
                <p>Thank you for dining with us!</p>
                <p>Please visit again</p>
                <div class="receipt-contact">
                    <p>www.mavrixcafe.com</p>
                    <p>Contact: +91 9876543210</p>
                </div>
                <div class="receipt-barcode">
                    *${order._id.slice(-6).toUpperCase()}*
                </div>
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
                <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
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