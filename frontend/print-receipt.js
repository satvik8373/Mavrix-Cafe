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
        <div class="receipt-modal" id="receiptModal-${order._id}">
            <div class="receipt-modal-content">
                <div class="receipt" id="receipt-${order._id}">
                    <style>
                        .receipt-modal {
                            display: none;
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.5);
                            z-index: 1000;
                            justify-content: center;
                            align-items: center;
                        }

                        .receipt-modal-content {
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            max-width: 400px;
                            width: 90%;
                            max-height: 90vh;
                            overflow-y: auto;
                            position: relative;
                        }

                        .receipt {
                            font-family: 'Courier New', monospace;
                            width: 100%;
                            padding: 20px;
                            background: white;
                        }

                        .receipt-header {
                            text-align: center;
                            margin-bottom: 20px;
                            border-bottom: 2px solid #000;
                            padding-bottom: 10px;
                        }

                        .receipt-title {
                            font-size: 24px;
                            font-weight: bold;
                            margin: 0;
                            color: #2c3e50;
                        }

                        .receipt-subtitle {
                            font-size: 14px;
                            color: #7f8c8d;
                            margin: 5px 0;
                        }

                        .receipt-info {
                            margin: 15px 0;
                            padding: 10px;
                            background: #f8f9fa;
                            border-radius: 4px;
                        }

                        .receipt-info-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 5px 0;
                            font-size: 14px;
                        }

                        .receipt-items {
                            margin: 20px 0;
                            border-top: 1px dashed #000;
                            border-bottom: 1px dashed #000;
                            padding: 10px 0;
                        }

                        .receipt-item {
                            display: flex;
                            justify-content: space-between;
                            margin: 8px 0;
                            font-size: 14px;
                        }

                        .receipt-item-name {
                            flex: 2;
                        }

                        .receipt-item-quantity {
                            flex: 1;
                            text-align: center;
                        }

                        .receipt-item-price {
                            flex: 1;
                            text-align: right;
                        }

                        .receipt-total {
                            margin: 20px 0;
                            padding: 10px;
                            background: #2c3e50;
                            color: white;
                            border-radius: 4px;
                            text-align: right;
                            font-weight: bold;
                            font-size: 16px;
                        }

                        .receipt-footer {
                            text-align: center;
                            margin-top: 20px;
                            padding-top: 10px;
                            border-top: 2px solid #000;
                            font-size: 12px;
                            color: #7f8c8d;
                        }

                        .receipt-actions {
                            display: flex;
                            gap: 10px;
                            margin-top: 20px;
                        }

                        .receipt-btn {
                            flex: 1;
                            padding: 10px;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 500;
                            transition: all 0.3s ease;
                        }

                        .print-btn {
                            background: #2c3e50;
                            color: white;
                        }

                        .close-btn {
                            background: #e74c3c;
                            color: white;
                        }

                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            .receipt-modal {
                                position: absolute;
                                left: 0;
                                top: 0;
                            }
                            .receipt-modal * {
                                visibility: visible;
                            }
                            .receipt-actions {
                                display: none !important;
                            }
                        }
                    </style>
                    <div class="receipt-header">
                        <h1 class="receipt-title">MAVRIX CAFE</h1>
                        <p class="receipt-subtitle">Your Favorite Coffee Shop</p>
                        <p class="receipt-subtitle">GST: XXXXXXXXXXXXXXX</p>
                    </div>
                    <div class="receipt-info">
                        <div class="receipt-info-row">
                            <span>Order #:</span>
                            <span>${order._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div class="receipt-info-row">
                            <span>Date:</span>
                            <span>${formatDate(order.timestamp)}</span>
                        </div>
                        <div class="receipt-info-row">
                            <span>Table:</span>
                            <span>${order.tableNumber}</span>
                        </div>
                        <div class="receipt-info-row">
                            <span>Customer:</span>
                            <span>${order.customerName}</span>
                        </div>
                    </div>
                    <div class="receipt-items">
                        <div class="receipt-item" style="font-weight: bold;">
                            <span class="receipt-item-name">Item</span>
                            <span class="receipt-item-quantity">Qty</span>
                            <span class="receipt-item-price">Amount</span>
                        </div>
                        ${order.items.map(item => `
                            <div class="receipt-item">
                                <span class="receipt-item-name">${item.name}</span>
                                <span class="receipt-item-quantity">${item.quantity}</span>
                                <span class="receipt-item-price">${formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="receipt-total">
                        Total: ${formatCurrency(order.totalAmount)}
                    </div>
                    <div class="receipt-footer">
                        <p>Thank you for dining with us!</p>
                        <p>Visit us again soon!</p>
                        <p>Follow us on Instagram @mavrixcafe</p>
                    </div>
                    <div class="receipt-actions">
                        <button onclick="window.print()" class="receipt-btn print-btn">
                            <i class="fas fa-print"></i> Print
                        </button>
                        <button onclick="closeReceipt('${order._id}')" class="receipt-btn close-btn">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showReceipt(orderId) {
    const modal = document.getElementById(`receiptModal-${orderId}`);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeReceipt(orderId) {
    const modal = document.getElementById(`receiptModal-${orderId}`);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Export functions for use in admin.html
window.showReceipt = showReceipt;
window.closeReceipt = closeReceipt;
window.generateReceiptHTML = generateReceiptHTML; 