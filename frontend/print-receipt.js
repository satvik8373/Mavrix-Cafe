// Print Receipt Functionality
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function generateReceiptHTML(order) {
    try {
        const date = new Date(order.timestamp).toLocaleString('en-IN', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).split(',');

        const itemsHTML = order.items.map(item => `
            <tr style="border-bottom: 1px dotted #ddd;">
                <td style="text-align: left; padding: 8px 0;">${item.name}</td>
                <td style="text-align: center; padding: 8px 0;">${item.quantity}</td>
                <td style="text-align: right; padding: 8px 0;">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
        `).join('');

        // Calculate GST
        const gstRate = 0.025; // 2.5% SGST and 2.5% CGST
        const subtotal = order.totalAmount / (1 + (gstRate * 2));
        const sgst = subtotal * gstRate;
        const cgst = subtotal * gstRate;
        const roundOff = order.totalAmount - (subtotal + sgst + cgst);

        return `
            <div class="receipt" style="font-family: 'Arial', sans-serif; width: 80mm; padding: 10px; color: #000;">
                <!-- Logo and Header -->
                <div style="text-align: center; margin-bottom: 10px;">
                    <div style="border: 2px solid #000; border-radius: 50%; width: 60px; height: 60px; margin: 0 auto; display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
                        <span style="font-size: 24px; font-weight: bold;">MC</span>
                    </div>
                    <h2 style="margin: 5px 0; font-size: 20px;">Mavrix Cafe</h2>
                    <p style="margin: 2px 0; font-size: 12px;">Mavrix Cafe, Sahkari Jin</p>
                    <p style="margin: 2px 0; font-size: 12px;">Contact: +91 9558268373</p>
                    <p style="margin: 2px 0; font-size: 12px;">GST No: 24AAWFT2171R1ZA</p>
                </div>

                <!-- Order Details -->
                <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 8px 0; margin: 10px 0; font-size: 12px;">
                    <table style="width: 100%;">
                        <tr>
                            <td>Date: ${date[0]}</td>
                            <td style="text-align: right;">Time: ${date[1]}</td>
                        </tr>
                        <tr>
                            <td>Bill No: ${order._id.slice(-6).toUpperCase()}</td>
                            <td style="text-align: right;">Table: ${order.tableNumber}</td>
                        </tr>
                        <tr>
                            <td colspan="2">Name: ${order.customerName}</td>
                        </tr>
                        <tr>
                            <td colspan="2">Phone: ${order.phoneNumber}</td>
                        </tr>
                    </table>
                </div>

                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="border-bottom: 1px solid #000;">
                            <th style="text-align: left; padding: 5px 0;">Item</th>
                            <th style="text-align: center; padding: 5px 0;">Qty</th>
                            <th style="text-align: right; padding: 5px 0;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>

                <!-- Totals Section -->
                <div style="margin-top: 10px; font-size: 12px;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="text-align: right;">Sub Total:</td>
                            <td style="text-align: right; width: 80px;">${formatCurrency(subtotal)}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right;">SGST 2.5%:</td>
                            <td style="text-align: right;">${formatCurrency(sgst)}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right;">CGST 2.5%:</td>
                            <td style="text-align: right;">${formatCurrency(cgst)}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right;">Round off:</td>
                            <td style="text-align: right;">${formatCurrency(roundOff)}</td>
                        </tr>
                        <tr style="font-weight: bold;">
                            <td style="text-align: right; padding-top: 5px;">Grand Total:</td>
                            <td style="text-align: right; padding-top: 5px; border-top: 1px dashed #000;">${formatCurrency(order.totalAmount)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 15px; font-size: 12px;">
                    <p style="margin: 5px 0;">Thank You Visit Again!!!!</p>
                    <p style="margin: 5px 0;">Cash on Delivery</p>
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
                    <title>Print Receipt</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        @media print {
                            body {
                                width: 80mm;
                                margin: 0;
                                padding: 0;
                            }
                            .receipt {
                                width: 100% !important;
                            }
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        * {
                            box-sizing: border-box;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
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