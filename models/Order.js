const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is Required']
    },
    orderedProducts: [
        {
            productId: {
                type: String,
                required: [true, 'Product ID is Required']
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: [true, 'totalPrice is Required']
    },
    orderedOn: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'Ordered'
    }
});

module.exports = mongoose.model('Order', orderSchema);