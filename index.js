require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const passport = require('passport');
const session = require('express-session');
require('./passport');
const cors = require("cors");
const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/course");
const port = 4000;
const app = express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(session({
	secret: process.env.clientSecret,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session())

mongoose.connect("mongodb+srv://eunicemarginel:admin1234@ecommerce-api.jq9ucxe.mongodb.net/?retryWrites=true&w=majority&appName=Ecommerce-API");

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

app.use("/users", userRoutes);
app.use("/courses", courseRoutes);

if(require.main === module){
	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on port ${ process.env.PORT || port } `)
	});
}

module.exports = app;