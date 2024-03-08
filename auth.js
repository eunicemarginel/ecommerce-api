const jwt = require("jsonwebtoken");
const secret = "EcommerceAPI";

// Token Creation
module.exports.createAccessToken = (user) => {
	const data = {
		id : user._id,
		email : user.email,
		isAdmin : user.isAdmin
	}

	return jwt.sign(data, secret, {});
}

// Token Verification
module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization)

	let token = req.headers.authorization

	if(typeof token === "undefined"){
		return res.send({ auth: "Failed. No Token"})
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

// Verify Admin
module.exports.verifyAdmin = (req, res, next) => {
	// Check if req.user exists and has isAdmin property
	if (req.user && req.user.isAdmin) {
		next(); // User is admin, proceed to next middleware
	} else {
		// User is not admin, send forbidden response
		return res.status(403).send("You do not have the rights to do this.");
	}
};

module.exports.isLoggedIn = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.standStatus(401);
	}
}