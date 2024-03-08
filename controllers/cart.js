const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get User's Cart
exports.getUserCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find the user's cart
        const cart = await Cart.findOne({ userId }).populate('cartItems.productId');

        // If user's cart is not found or it's empty, return appropriate response
        if (!cart || cart.cartItems.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty', cart });
        }

        // Send the cart data
        res.status(200).send({ cart });
    } catch (error) {
        console.error("Error fetching user's cart:", error);
        res.status(500).send({ error: 'Failed to fetch user cart' });
    }
};

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        // Extract user ID from request
        const userId = req.user.id;

        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).send({ error: 'productId and quantity are required' });
        }

        // Find the product by its ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        // Calculate the subtotal for the new item
        const subtotal = product.price * quantity;

        // Check if the user already has a cart
        let userCart = await Cart.findOne({ userId });

        if (!userCart) {
            // If user doesn't have a cart, create one
            userCart = new Cart({ userId, cartItems: [] });
        }

        // Push the new item to the cart with its subtotal
        userCart.cartItems.push({ productId, quantity, subtotal });

        // Calculate total price
        userCart.totalPrice = userCart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        await userCart.save();

        return res.status(201).send({ message: 'Item added to cart', cart: userCart });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        return res.status(500).send({ error: 'Failed to add item to cart' });
    }
};


// Update Cart Item (Change Product Quantities)
exports.updateCartItem = async (req, res) => {
    try {
        // Extract user ID from request
        const userId = req.user.id;

        // Extract productId and quantity from request body
        const { productId, quantity } = req.body;

        // Check if productId and quantity are provided in the request body
        if (!productId || !quantity) {
            return res.status(400).send({ error: 'productId and quantity are required' });
        }

        // Find the user's cart
        let userCart = await Cart.findOne({ userId });

        // If user doesn't have a cart, return error
        if (!userCart) {
            return res.status(404).send({ error: 'User cart not found' });
        }

        // Find the cart item to update
        const cartItemIndex = userCart.cartItems.findIndex(item => item.productId.toString() === productId);

        // If cart item is not found, return error
        if (cartItemIndex === -1) {
            return res.status(404).send({ error: 'Cart item not found' });
        }

        // Find the product related to the cart item
        const product = await Product.findById(productId);

        // If product not found, return error
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        // Update quantity of the cart item
        userCart.cartItems[cartItemIndex].quantity = quantity;

        // Recalculate subtotal of the cart item
        userCart.cartItems[cartItemIndex].subtotal = product.price * quantity;

        // Recalculate total price of the cart
        userCart.totalPrice = userCart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        // Save the updated cart to the database
        await userCart.save();

        // Send success response
        return res.status(200).send({ message: 'Cart item updated', cart: userCart });
    } catch (error) {
        // Handle errors
        console.error("Error updating cart item:", error);
        return res.status(500).send({ error: 'Failed to update cart item' });
    }
};


// Remove Cart Item (Remove Product from Cart)
exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        // Check if the user's cart contains any items
        const userCart = await Cart.findOne({ userId });

        // If user's cart is not found or it's empty, return appropriate response
        if (!userCart || userCart.cartItems.length === 0) {
            return res.status(400).send({ message: 'Your cart is empty' });
        }

        // Find the index of the item to be removed
        const itemIndex = userCart.cartItems.findIndex(item => item.productId.toString() === productId);

        // If the item is not found, return appropriate response
        if (itemIndex === -1) {
            return res.status(404).send({ message: 'Product not found in cart' });
        }

        // Remove the item from the cart
        userCart.cartItems.splice(itemIndex, 1);

        // Recalculate total price
        userCart.totalPrice = userCart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        // Save the updated cart to the database
        await userCart.save();

        // Send success response
        return res.status(200).send({ message: 'Product removed', cart: userCart });
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).send({ error: 'Failed to remove cart item' });
    }
};

// Clear Cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find the user's cart
        const userCart = await Cart.findOne({ userId });

        // If user's cart is not found or it's empty, return appropriate response
        if (!userCart || userCart.cartItems.length === 0) {
            return res.status(400).send({ message: 'Your cart is already empty' });
        }

        // Clear cart items
        userCart.cartItems = [];

        // Reset total price
        userCart.totalPrice = 0;

        // Save the updated cart to the database
        await userCart.save();

        // Send success response
        return res.status(200).send({ message: 'Cart cleared' });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).send({ error: 'Failed to clear cart' });
    }
};
