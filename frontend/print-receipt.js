// Print Receipt Functionality
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function generateReceiptHTML(order) {
    try {
        // Get all store details from localStorage
        const storeDetails = {
            name: localStorage.getItem('storeName') || 'Mavrix Cafe',
            tagline: localStorage.getItem('storeTagline') || 'Your Premium Coffee Destination',
            address: localStorage.getItem('storeAddress') || '123 Coffee Street, Bangalore',
            phone: localStorage.getItem('storePhone') || '+91 80 1234 5678',
            gst: localStorage.getItem('storeGST') || '29ABCDE1234F1Z5',
            email: localStorage.getItem('storeEmail') || 'info@mavrixcafe.com',
            thankYouMessage: localStorage.getItem('thankYouMessage') || 'Thank you for choosing',
            footerMessage: localStorage.getItem('footerMessage') || 'We hope to serve you again soon'
        };
        
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
                    <h2 style="margin: 0; font-size: 24px; color: #2c3e50;">${storeDetails.name}</h2>
                    <p style="margin: 5px 0; color: #666; font-size: 12px;">${storeDetails.tagline}</p>
                    <div style="margin: 15px 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 10px 0;">
                        <p style="margin: 0; font-size: 14px;">${storeDetails.address}</p>
                        <p style="margin: 5px 0; font-size: 14px;">Tel: ${storeDetails.phone}</p>
                        <p style="margin: 5px 0; font-size: 14px;">Email: ${storeDetails.email}</p>
                        <p style="margin: 0; font-size: 14px;">GST No: ${storeDetails.gst}</p>
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
                    <p style="margin: 5px 0; font-size: 14px;">${storeDetails.thankYouMessage} ${storeDetails.name}!</p>
                    <p style="margin: 5px 0; font-size: 12px;">${storeDetails.footerMessage}</p>
                </div>
            </div>
        `;
    } catch (error) {
        return `<div class="receipt-error">Error generating receipt. Please try again.</div>`;
    }
}

function printReceipt(order) {
    try {
        // Get store name for the title
        const storeName = localStorage.getItem('storeName') || 'Mavrix Cafe';
        
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
                <title>${storeName} - Receipt</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @page {
                        size: 98.4mm 225.4mm; /* Envelope #9 size */
                        margin: 0;
                    }
                    
                    html {
                        height: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                        min-height: fit-content;
                        height: auto;
                        width: 98.4mm;
                        position: relative;
                        box-sizing: border-box;
                    }
                    
                    .receipt {
                        width: 90mm !important;
                        margin: 0 auto !important;
                        padding: 10px 5px !important;
                        box-sizing: border-box !important;
                        background: white;
                        height: fit-content;
                    }
                    
                    @media print {
                        html, body {
                            width: 98.4mm !important;
                            height: auto !important;
                            min-height: 0 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        
                        .receipt {
                            margin: 0 auto !important;
                            padding: 5px !important;
                            width: 90mm !important;
                            height: auto !important;
                            page-break-after: avoid !important;
                            page-break-before: avoid !important;
                        }
                        
                        /* Compact spacing for print */
                        .receipt > div {
                            margin-bottom: 8px !important;
                        }
                        
                        .receipt h2 {
                            font-size: 18px !important;
                            margin: 5px 0 !important;
                        }
                        
                        .receipt h3 {
                            font-size: 14px !important;
                            margin: 5px 0 !important;
                        }
                        
                        .receipt p {
                            margin: 3px 0 !important;
                            line-height: 1.2 !important;
                        }
                        
                        .receipt table {
                            margin: 5px 0 !important;
                        }
                        
                        .receipt td, .receipt th {
                            padding: 3px 0 !important;
                        }
                        
                        /* Remove any page breaks */
                        * {
                            page-break-inside: avoid !important;
                        }
                    }
                    
                    /* Print preview adjustments */
                    @media screen {
                        body {
                            background: #f0f0f0;
                            padding: 20px 0;
                            min-height: fit-content;
                        }
                        
                        .receipt {
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
        
        // Wait for content to load and ensure proper rendering
        setTimeout(() => {
            try {
                // Force single page print
                const style = document.createElement('style');
                style.textContent = '@page { size: 98.4mm 225.4mm; margin: 0; }';
                iframe.contentDocument.head.appendChild(style);
                
                // Print the iframe content
                iframe.contentWindow.print();
                
                // Remove iframe after printing
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            } catch (error) {
                showNotification('Error printing receipt. Please try again.', 'error', 'Print Failed');
            }
        }, 500);
    } catch (error) {
        showNotification('Error preparing receipt for print. Please try again.', 'error', 'Print Failed');
    }
} 