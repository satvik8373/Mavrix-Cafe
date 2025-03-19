// Print Receipt Function
function printOrderReceipt(order) {
    // Create a new window for the receipt
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    
    // Get current date and time
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    // Calculate total quantity
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Create receipt HTML
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order Receipt</title>
            <style>
                @page {
                    size: 80mm 200mm;
                    margin: 0;
                }
                body {
                    font-family: 'Courier New', monospace;
                    width: 80mm;
                    margin: 0;
                    padding: 10px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .info {
                    font-size: 12px;
                    margin-bottom: 5px;
                }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 10px 0;
                }
                .item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    margin-bottom: 5px;
                }
                .item-name {
                    flex: 1;
                }
                .item-quantity {
                    width: 30px;
                    text-align: center;
                }
                .item-price {
                    width: 60px;
                    text-align: right;
                }
                .total {
                    font-size: 14px;
                    font-weight: bold;
                    text-align: right;
                    margin-top: 10px;
                }
                .footer {
                    text-align: center;
                    font-size: 12px;
                    margin-top: 20px;
                }
                @media print {
                    body {
                        width: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Mavrix Cafe</div>
                <div class="info">Order #${order._id.slice(-6).toUpperCase()}</div>
                <div class="info">Date: ${date}</div>
                <div class="info">Time: ${time}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="info">
                Customer: ${order.customerName}<br>
                Table: ${order.tableNumber}<br>
                Phone: ${order.phoneNumber}
            </div>
            
            <div class="divider"></div>
            
            <div class="items">
                <div class="item" style="font-weight: bold;">
                    <span class="item-name">Item</span>
                    <span class="item-quantity">Qty</span>
                    <span class="item-price">Price</span>
                </div>
                ${order.items.map(item => `
                    <div class="item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">${item.quantity}</span>
                        <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="divider"></div>
            
            <div class="total">
                Total Items: ${totalQuantity}<br>
                Total Amount: ₹${order.totalAmount.toFixed(2)}
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
                Thank you for dining with us!<br>
                Please visit again
            </div>
        </body>
        </html>
    `;
    
    // Write the receipt HTML to the new window
    printWindow.document.write(receiptHTML);
    
    // Wait for content to load
    printWindow.document.close();
    printWindow.onload = function() {
        // Print the receipt
        printWindow.print();
        // Close the window after printing
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
}

// Export the function
window.printOrderReceipt = printOrderReceipt; 