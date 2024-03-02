const express = require("express");
const passport = require('passport');
const userController = require("../controllers/user");
const router = express.Router();
const {verify, isLoggedIn} = require("../auth");

router.get("/details", verify, userController.getProfile);

router.post("/checkEmail", userController.checkEmailExists);

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.post('/enroll', verify, userController.enroll)

router.get('/getEnrollments', verify, userController.getEnrollments);

router.post('/reset-password', verify, userController.resetPassword);

router.put('/profile', verify, userController.updateProfile);

router.get('/google', 
	passport.authenticate('google', {
		scope:['email', 'profile'],
	}
));

router.get('/google/callback', 
	passport.authenticate('google', {
		failureRedirect: '/users/failed',
	}),
	function (req, res) {
		res.redirect('/users/success')
	}
);

router.get("/failed", (req, res) => {
	console.log('User is not authenticated')
	res.send("Failed")
})

router.get("/success", isLoggedIn, (req, res) => {
	console.log('You are logged in')
	console.log(req.user)
	res.send(`Welcome ${req.user.displayName}`)
})

router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log('Error while destroying session:', err)
		} else {
			req.logout(() => {
				console.log('You are logged out');
				res.redirect('/');
			})
		}
	})
})

module.exports = router;