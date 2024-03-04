const Product = require("../models/Product");
const User = require("../models/User");

module.exports.addProduct = (req, res) => {

	const newProduct = new Product({
		name : req.body.name,
		description : req.body.description,
		price : req.body.price
	});

	Product.findOne({ name: req.body.name })
	.then(existingProduct => {
		if (existingProduct){
			return res.status(409).send({ error: 'Product already exists' })
		}

		return newProduct.save()
		.then(savedProduct => {
			return res.status(201).send({ savedProduct })
		})
		.catch(saveErr => {
			console.error("Error in saving the product: ", saveErr)

			return res.status(500).send({ error: 'Failed to save the product'})
		})
	})
	.catch(findErr => {
		console.error("Error in finding the product: ", findErr)


		return res.status(500).send({ message: 'Error finding the product'})
	})	
}; 

module.exports.addProduct = (req, res) => {

	try {
		let newProduct = new Product({
			name : req.body.name,
			description : req.body.description,
			price : req.body.price
		});

		return newProduct.save()
		.then(result => res.send(result))
		.catch(err => res.send(err));
	} catch (err) {

		console.log("result of console.error:")
		console.error(err);
		console.log("result of console.log:")
		console.log(err);
		res.send("Error in variables")
	}
}; 

module.exports.getAllProducts = (req, res) => {
	 return Product.find({})
	.then(products => {
		if(products.length > 0) {
			return res.status(200).send({ products })
		} else {
			return res.status(200).send({ message: ' No products found. '})
		}
	})
	.catch(err => {
		console.error("Error in finding all products: ", err)
		return res.status(500).send({ error: 'Error finding products.' })
	});
};

module.exports.getAllActive = (req, res) => {

	Product.find({ isActive: true }).then(products => {
		if (products.length > 0){
			return res.status(200).send({ products});
		}
		else {
			return res.status(200).send({ message: 'No active products found.' })
		}
	}).catch(err => {
		console.error("Error in finding active product: ", err)
		return res.status(500).send({ error: 'Error finding active product.' })
	})
};

module.exports.getProduct = (req, res) => {
	const productId = req.params.productId;

	Product.findById(productId)
	.then(product => {
		if (!product) {
			return res.status(404).send({ error: 'Product not found' });
		}
		return res.status(200).send({ product });
	})
	.catch(err => {
		console.error("Error in fetching the product: ", err)
		return res.status(500).send({ error: 'Failed to fetch product' });
	})
};

module.exports.updateProduct = (req, res) => {

	let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }
	return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(updatedProduct => {
        if (!updatedProduct) {

            return res.status(404).send({ error: 'Product not found' });

        }
        return res.status(200).send({ 
        	message: 'Product updated successfully', 
        	updatedProduct: updatedProduct
        });

    })
    .catch(err => {
		console.error("Error in updating a product: ", err)
		return res.status(500).send({ error: 'Error in updating a product.' });
	});
};

module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {
        isActive: false
    }
    
    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(archiveProduct => {
        if (!archiveProduct) {
        	return res.status(404).send({ error: 'Product not found' });
        }
        return res.status(200).send({ 
        	message: 'Product archived successfully', 
        	archiveProduct: archiveProduct
        });
    })
    .catch(err => {
    	console.error("Error in archiving a product: ", err)
    	return res.status(500).send({ error: 'Failed to archive product' })
    });

};

module.exports.activateProduct= (req, res) => {

    let updateActiveField = {
        isActive: true
    }
    
    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(activateProduct => {
        if (!activateProduct) {
        	return res.status(404).send({ error: 'Product not found' });
        }
        return res.status(200).send({ 
        	message: 'Product activated successfully', 
        	activateProduct: activateProduct
        });
    })
    .catch(err => {
    	console.error("Error in activating a product: ", err)
    	return res.status(500).send({ error: 'Failed to activating a product' })
    });
};

module.exports.searchProductByName = async (req, res) => {
	try {
	  const { productName } = req.body;
  	  const products = await Product.find({
		name: { $regex: productName, $options: 'i' }
	  });
  
	  res.send(products);
	} catch (error) {
	  console.error(error);
	  res.status(500).send({ error: 'Internal Server Error' });
	}
  };
  
module.exports.getEmailsOfOrderedUsers = async (req, res) => {
	const productId = req.params.productId;

	try {
		const product = await Product.findById(productId);
	
		if (!product) {
			return res.status(404).send({ message: 'Product not found' });
		}
		const userIds = product.buyer.map(buyer => buyer.userId);
		const orderedUsers = await User.find({ id: { $in: userIds } });
		const emails = orderedUsers.map(user => user.email);
	
		res.status(200).send({ userEmails: emails });
	} catch (error) {
		res.status(500).send({ message: 'An error occurred while retrieving ordered users' });
	}
};