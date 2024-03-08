// Dependencies and Modules
require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const passport = require('passport');
// const session = require('express-session');
// require('./passport');
const cors = require("cors");
const bodyParser = require('body-parser')

// Routes
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

// Environment Setup
const port = 4000;
const app = express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(bodyParser.json());
// app.use(session({
// 	secret: process.env.clientSecret,
// 	resave: false,
// 	saveUninitialized: false
// }));
// app.use(passport.initialize());
// app.use(passport.session())

// Database connection
mongoose.connect("mongodb+srv://valderama-mapusao:admin1234@ecommerce-api.qsbohqj.mongodb.net/?retryWrites=true&w=majority&appName=ECOMMERCE-API");

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

// Base endpoints
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);

// Server Gateway Response
if(require.main === module){
	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on port ${ process.env.PORT || port } `)
	});
}

module.exports = app;