// Print Receipt Functionality
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function generateReceiptHTML(order) {
    try {
        const date = new Date(order.timestamp).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        const itemsHTML = order.items.map(item => `
            <tr>
                <td style="text-align: left; padding: 8px 0;">${item.name}</td>
                <td style="text-align: center; padding: 8px 0;">×${item.quantity}</td>
                <td style="text-align: right; padding: 8px 0;">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
        `).join('');

        const subtotal = order.totalAmount;
        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + tax;

        return `
            <div class="receipt" style="font-family: 'Courier New', monospace; width: 300px; padding: 20px; background: white;">
                <!-- Store Logo and Header -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <svg width="60" height="60" viewBox="0 0 24 24" style="margin: 0 auto;">
                            <path fill="#2c3e50" d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H20M16,5H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V5Z" />
                        </svg>
                    </div>
                    <h2 style="margin: 0; font-size: 24px; color: #2c3e50;">Mavrix Cafe</h2>
                    <p style="margin: 5px 0; color: #666; font-size: 12px;">Your Premium Coffee Destination</p>
                    <div style="margin: 15px 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 10px 0;">
                        <p style="margin: 0; font-size: 14px;">123 Coffee Street, Bangalore</p>
                        <p style="margin: 5px 0; font-size: 14px;">Tel: +91 80 1234 5678</p>
                        <p style="margin: 0; font-size: 14px;">GST No: 29ABCDE1234F1Z5</p>
                    </div>
                </div>

                <!-- Order Details -->
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <table style="width: 100%; margin-bottom: 10px;">
                        <tr>
                            <td style="font-size: 14px;">Order #:</td>
                            <td style="text-align: right; font-weight: bold;">${order._id.slice(-6).toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="font-size: 14px;">Date:</td>
                            <td style="text-align: right;">${date}</td>
                        </tr>
                        <tr>
                            <td style="font-size: 14px;">Table:</td>
                            <td style="text-align: right;">${order.tableNumber}</td>
                        </tr>
                    </table>
                </div>

                <!-- Customer Details -->
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #2c3e50;">Customer Information</h3>
                    <table style="width: 100%;">
                        <tr>
                            <td style="font-size: 14px;">Name:</td>
                            <td style="text-align: right;">${order.customerName}</td>
                        </tr>
                        <tr>
                            <td style="font-size: 14px;">Phone:</td>
                            <td style="text-align: right;">${order.phoneNumber}</td>
                        </tr>
                    </table>
                </div>

                <!-- Order Items -->
                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #2c3e50;">Order Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid #ddd;">
                                <th style="text-align: left; padding: 8px 0;">Item</th>
                                <th style="text-align: center; padding: 8px 0;">Qty</th>
                                <th style="text-align: right; padding: 8px 0;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </div>

                <!-- Payment Summary -->
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 4px 0;">Subtotal:</td>
                            <td style="text-align: right;">${formatCurrency(subtotal)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;">GST (5%):</td>
                            <td style="text-align: right;">${formatCurrency(tax)}</td>
                        </tr>
                        <tr style="font-weight: bold; font-size: 1.1em;">
                            <td style="padding: 8px 0; border-top: 1px dashed #ccc;">Total:</td>
                            <td style="text-align: right; border-top: 1px dashed #ccc;">${formatCurrency(total)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 20px; color: #666;">
                    <p style="margin: 5px 0; font-size: 14px;">Thank you for choosing Mavrix Cafe!</p>
                    <p style="margin: 5px 0; font-size: 12px;">We hope to serve you again soon.</p>
                    
                    
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error generating receipt HTML:', error);
        return `<div class="receipt-error">Error generating receipt. Please try again.</div>`;
    }
}

function printReceipt(order) {
    try {
        // Validate order object
        if (!order || typeof order !== 'object') {
            throw new Error('Invalid order data');
        }

        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Write receipt content to iframe
        const receiptHTML = generateReceiptHTML(order);
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Receipt - Mavrix Cafe</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        @media print {
                            body {
                                width: 80mm;
                            }
                            .receipt {
                                width: 100% !important;
                                padding: 10px !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${receiptHTML}
                </body>
            </html>
        `;
        
        iframe.contentDocument.open();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();
        
        // Wait for content to load
        setTimeout(() => {
            try {
                // Print the iframe content
                iframe.contentWindow.print();
                
                // Remove iframe after printing
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            } catch (error) {
                console.error('Error during print operation:', error);
                showNotification('Error printing receipt. Please try again.', 'error', 'Print Failed');
            }
        }, 500);
    } catch (error) {
        console.error('Error in printReceipt:', error);
        showNotification('Error preparing receipt for print. Please try again.', 'error', 'Print Failed');
    }
} 