// Print Receipt Functionality
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function generateReceiptHTML(order) {
    const date = new Date(order.timestamp).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    return `
        <div class="receipt" style="font-family: 'Courier New', monospace; width: 300px; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">Mavrix Cafe</h2>
                <p style="margin: 5px 0;">Order Receipt</p>
                <p style="margin: 5px 0;">Date: ${date}</p>
                <p style="margin: 5px 0;">Order #${order._id.slice(-6).toUpperCase()}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="margin: 5px 0;">Table: ${order.tableNumber}</p>
                <p style="margin: 5px 0;">Customer: ${order.customerName}</p>
                <p style="margin: 5px 0;">Phone: ${order.phoneNumber}</p>
            </div>
            
            <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin-bottom: 10px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td style="text-align: left;">${item.name}</td>
                                <td style="text-align: center;">×${item.quantity}</td>
                                <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="text-align: right; margin-bottom: 20px;">
                <p style="margin: 5px 0; font-weight: bold;">
                    Total: ${formatCurrency(order.totalAmount)}
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <p style="margin: 5px 0;">Thank you for visiting!</p>
                <p style="margin: 5px 0;">Please visit again</p>
            </div>
        </div>
    `;
}

function printReceipt(order) {
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Write receipt content to iframe
    iframe.contentDocument.write(`
        <html>
            <head>
                <title>Print Receipt</title>
                <style>
                    @page {
                        size: 80mm 200mm;
                        margin: 0;
                    }
                    @media print {
                        body {
                            width: 80mm;
                            margin: 0;
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                ${generateReceiptHTML(order)}
            </body>
        </html>
    `);
    
    // Wait for content to load
    iframe.onload = () => {
        // Print the iframe content
        iframe.contentWindow.print();
        
        // Remove iframe after printing
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };
} 