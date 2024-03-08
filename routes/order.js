const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');

const {verify, verifyAdmin} = require("../auth");

// Non-admin User Checkout (Create Order)
router.post('/checkout', verify, orderController.createOrder);

// Retrieve Authenticated User's Orders
router.get('/user', verify, orderController.getUserOrders);

// Retrieve All Orders (Admin Only)
router.get('/all-orders', verify, verifyAdmin, orderController.getAllOrders);

module.exports = router;
