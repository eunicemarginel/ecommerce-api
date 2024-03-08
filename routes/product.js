const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

const {verify, verifyAdmin} = require("../auth");

// Create Product (Admin Only)
router.post('/', verify, verifyAdmin, productController.createProduct);

// Retrieve All Products (Admin Only)
router.get('/', verify, verifyAdmin, productController.getAllProducts);

// Retrieve All Active Products
router.get('/active', productController.getActiveProducts);

// Retrieve Single Product
router.get('/:productId', productController.getSingleProduct);

// Update Product Information (Admin Only)
router.patch('/:productId/update', verify, verifyAdmin, productController.updateProduct);

// Archive Product (Admin Only)
router.patch('/:productId/archive', verify, verifyAdmin, productController.archiveProduct);

// Activate Product (Admin Only)
router.patch('/:productId/activate', verify, verifyAdmin, productController.activateProduct);

// Search Products by Name
router.post('/searchByName', productController.searchProductsByName);

// Search Products by Price Range
router.post('/searchByPrice', productController.searchProductsByPriceRange);

module.exports = router;
