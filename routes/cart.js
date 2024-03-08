const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');

const {verify} = require("../auth");

// Get User's Cart
router.get('/', verify, cartController.getUserCart);

// Add to Cart
router.post('/add', verify, cartController.addToCart);

// Change Product Quantities
router.patch('/update-cart-quantity', verify, cartController.updateCartItem);

// Remove Product from Cart
router.patch('/:productId/remove-from-cart', verify, cartController.removeCartItem);

// Clear Cart
router.put('/clear-cart', verify, cartController.clearCart);

module.exports = router;
