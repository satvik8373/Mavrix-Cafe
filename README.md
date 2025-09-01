# Quick Cafe Order System

A simple, mobile-first restaurant ordering system with QR code support and admin dashboard.

## Features

- Mobile-first responsive design
- QR code-based table ordering
- Simple menu with categories (Drinks, Food, Desserts)
- Order submission with customer details
- Admin dashboard for order management
- Real-time order status updates
- No payment integration required

## How to Use

### For Customers

1. Scan the QR code on your table
2. Browse the menu by category
3. Add items to your order
4. Enter your name and phone number
5. Submit your order

### For Restaurant Staff

1. Access the admin dashboard at `admin.html`
2. View all orders, filter by status (All/Pending/Completed)
3. Mark orders as completed
4. Track order details including table number, customer info, and items

## Setup

1. Clone or download this repository
2. Open `index.html` in a web browser
3. For testing different tables, use the URL parameter: `?table=11` (replace 11 with any table number)
4. Open `admin.html` to access the admin dashboard

## Technical Details

- Built with vanilla JavaScript
- Responsive design using CSS Grid and Flexbox
- No backend required (can be extended with a server)
- Uses local storage for order management
- Modern UI with animations and transitions

## Customization

- Edit `script.js` to modify menu items
- Update styles in `styles.css`
- Modify admin dashboard in `admin.html`

## Note

This is a frontend-only implementation. For a production environment, you would need to:
1. Add a backend server
2. Implement proper data persistence
3. Add authentication for the admin dashboard
4. Set up a proper database
5. Implement real-time updates 