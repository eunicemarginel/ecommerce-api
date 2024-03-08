// controllers/productController.js
const Product = require('../models/Product');

// Create Product (Admin Only)
exports.createProduct = async (req, res) => {
    try {
        // Check if request body contains required fields
        const { name, description, price } = req.body;
        if (!name || !description || !price) {
            return res.status(400).json({ error: 'Name, description, and price are required' });
        }

        // Create new product
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price
        });

        // Save product to database
        await product.save();

        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};



// Retrieve All Products (Admin Only)
exports.getAllProducts = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Only admin users can retrieve all products' });
        }
        
        const allProducts = await Product.find();
        res.status(200).json(allProducts);
    } catch (error) {
        console.error("Error retrieving all products:", error);
        res.status(500).json({ error: 'Failed to retrieve all products' });
    }
};

// Retrieve All Active Products
exports.getActiveProducts = async (req, res) => {
    try {
        const activeProducts = await Product.find({ isActive: true });
        res.status(200).json(activeProducts);
    } catch (error) {
        console.error("Error retrieving active products:", error);
        res.status(500).json({ error: 'Failed to retrieve active products' });
    }
};

// Retrieve Single Product
exports.getSingleProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error retrieving single product:", error);
        res.status(500).json({ error: 'Failed to retrieve single product' });
    }
};

// Update Product Information (Admin Only)
exports.updateProduct = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Only admin users can update products' });
        }
        
        const productId = req.params.productId;
        const { name, description, price } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(productId, { name, description, price }, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// Archive Product (Admin Only)
exports.archiveProduct = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Only admin users can archive products' });
        }
        
        const productId = req.params.productId;
        const archivedProduct = await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true });
        if (!archivedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(archivedProduct);
    } catch (error) {
        console.error("Error archiving product:", error);
        res.status(500).json({ error: 'Failed to archive product' });
    }
};

// Activate Product (Admin Only)
exports.activateProduct = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Only admin users can activate products' });
        }
        
        const productId = req.params.productId;
        const activatedProduct = await Product.findByIdAndUpdate(productId, { isActive: true }, { new: true });
        if (!activatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(activatedProduct);
    } catch (error) {
        console.error("Error activating product:", error);
        res.status(500).json({ error: 'Failed to activate product' });
    }
};

// Search Products by Name
exports.searchProductsByName = async (req, res) => {
	try {
	  const { productName } = req.body;
  
	  const product = await Product.find({
		name: { $regex: productName, $options: 'i' }
	  });
  
	  res.send(product);
	} catch (error) {
	  console.error("Error searching products: ", error);
	  res.status(500).json({ error: 'Failed to search product' });
	}
  };

// Search Products by Price Range
exports.searchProductsByPriceRange = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;

        // Validate that minPrice and maxPrice are valid numbers
        const parsedMinPrice = parseFloat(minPrice);
        const parsedMaxPrice = parseFloat(maxPrice);

        // Check if minPrice and maxPrice are valid numbers
        if (isNaN(parsedMinPrice) || isNaN(parsedMaxPrice)) {
            return res.status(400).json({ error: 'Invalid price values' });
        }

        // Perform the search based on the valid price range
        const products = await Product.find({
            price: { $gte: parsedMinPrice, $lte: parsedMaxPrice }
        });

        res.status(200).json(products);
    } catch (error) {
        console.error("Error searching products by price range:", error);
        res.status(500).json({ error: 'Failed to search products by price range' });
    }
};
