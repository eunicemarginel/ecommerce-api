const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create Order (non-admin user checkout)
exports.createOrder = async (req, res) => {
    try {
        // Extract user ID from request
        const userId = req.user.id;

        // Find the user's cart
        const userCart = await Cart.findOne({ userId }).populate('cartItems.productId');

        // If user's cart is not found, send appropriate response
        if (!userCart) {
            return res.status(404).json({ error: 'User cart not found' });
        }

        // If cart is empty, send appropriate response
        if (userCart.cartItems.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty' });
        }

        // Construct the productsOrdered array for the new order
        const productsOrdered = userCart.cartItems.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            subtotal: item.subtotal
        }));

        // Calculate total price
        const totalPrice = userCart.totalPrice;

        // Construct the new order document
        const newOrder = new Order({
            userId,
            productsOrdered,
            totalPrice
        });

        // Save the new order
        const savedOrder = await newOrder.save();

        // Clear the user's cart after order creation
        userCart.cartItems = [];
        userCart.totalPrice = 0;
        await userCart.save();
        
        return res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ error: 'Failed to create order' });
    }
};

// Retrieve Authenticated User's Orders
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const userOrders = await Order.find({ userId });

        res.status(200).json(userOrders);
    } catch (error) {
        console.error("Error retrieving user's orders:", error);
        res.status(500).json({ error: 'Failed to retrieve user orders' });
    }
};

// Retrieve All Orders (Admin Only)
exports.getAllOrders = async (req, res) => {
    try {
        // Check if the user is an admin
        if (!req.user.isAdmin) {
            // If not admin, return unauthorized status
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // If user is admin, retrieve all orders
        const allOrders = await Cart.find();

        // Send the orders to the client
        res.status(200).json(allOrders);
    } catch (error) {
        console.error("Error retrieving all orders:", error);
        res.status(500).json({ error: 'Failed to retrieve all orders' });
    }
};