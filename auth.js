// Import JWT
const jwt = require("jsonwebtoken");
// User defined string data that will be used to create our JSON web tokens
// Used in the algorithm for encrypting our data which makes it difficult to decode the information without the defined secret keyword
const secret = "EcommerceAPI";

// [Section]JSON WEB Tokens
/*
	- JSON Web Token or JWT is a way of securely passing information from the server to the client or to other parts of a server
	- Information is kept secure through the use of secret ocde
	- Only the system that knows the secret code that can decode the encrypted information
*/

// [SECTION] Token Creation
/*
Analogy
	Pack the gift, and provide a lock with the secret code as the key 
*/

module.exports.createAccessToken = (user) => {
	const data = {
		id : user._id,
		email : user.email,
		isAdmin : user.isAdmin
	}

	return jwt.sign(data, secret, {});
}

module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization)

	let token = req.headers.authorization

	if(typeof token === "undefined"){
		return res.send({auth: "Failed. No Token"})
	} else {
		console.log(token);
		token = token.slice(7, token.length)
		console.log(token);

		jwt.verify(token, secret, function(err, decodedToken){
			if (err){
				return res.send({
					auth: "Failed",
					message: err.message
				})
			} else {
				console.log("result from verify method:")
				console.log(decodedToken)

				req.user = decodedToken;

				next();
			}
		})
	}
}

module.exports.verifyAdmin = (req, res, next) => {
	// Checks if the owner of the token is an admin.
	if(req.user.isAdmin){
		// If it is, move to the next middleware/controller using the next() method.
		next();
	} else {
		// Else, end the request-response cycle by sending the appropriate response and status code.
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
		console.log("result from verifyAdmin method");
		console.log(req.user);
	}

	module.exports.isLoggedIn = (req, res, next) => {
		if (req.user) {
			next();
		} else {
			res.standStatus(401);
		}
	}