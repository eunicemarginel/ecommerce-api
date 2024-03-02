// [SECTION] Dependencies and Modules
// The "User" variable is defined using a capitalized letter to indicate that what we are using is the "User" model for code readability

const User = require("../models/User");
const Enrollment = require("../models/Enrollment")
const bcrypt = require('bcrypt');
const auth = require("../auth");

/*[SECTION] Check if the email already exists
	Steps: 
		1. Use mongoose "find" method to find duplicate emails
		2. Use the "then" method to send a response back to the client application based on the result of the "find" method
*/

module.exports.checkEmailExists = (req,res) => {
// validations can be done in either routes or controllers, however, we must be careful in placing our validations in the controllers for it may return data other than a Promise (e.g. primitive data types) which cannot be caught by the routes.
	// validation if the request body sent has the "@" symbol.
	if (req.body.email.includes("@")){
		return User.find({ email : req.body.email })
		.then(result => {
			// The "find" method returns a record if a match is found
			if (result.length > 0) {
				return res.status(409).send({ error: "Duplicate Email Found" });
			// No duplicate email found
			// The user is not yet registered in the database
			} else {

				// If there is no duplicate email, send false with 204 http status back to the client
				return res.status(404).send({ message: "Email not found" });
			};
		})
		.catch(err => {
			console.error("Error in find", err)

			return res.status(500).send({ error: "Error in find"});
		});
	} else {
	    res.status(400).send({ error: "Invalid Email"})
	};
}
/*
	IMPORTANT NOTE
		- What happens in the user's browser when running the frontend code we've developed is beyond our control. The browser is a black box that, at some point, after the user has interacted with our code, might send us back a piece of data that our application cannot process. There is no guarantee that the data provided is what we need.
		- We can only validate the data coming from users to check if our backend recieved the information it is intended to receive.
		- We have done validations in the earlier stages of our API developtment.
		- That validation is the schema-level validation wherein we are checking if the data to be stored in our database is aligned with the properties of the models we have set for a collection/schema. e.g. User, Course, and Enrollment 
		-409 HTTP Status code refers to duplicate record which means that there is a duplicate document found in our database.
		- Usually, true/false response doesn't test the application response. However, for better communication to the client, it's better to send specific messages to validate wheter or not the data received needs correction. 
*/

// [SECTION] User registration
/*
	Steps: 
		1. Create a new User object using the mongoose model and the information from the request body
		2. Make sure that the password is encrypted
		3. Save the new User to the database
*/
module.exports.registerUser = (req,res) => {
	// checks if the email is in the right format
	if (!req.body.email.includes("@")){
		return res.status(400).send({ error: "Email invalid" });
	}
	// checks if the mobile number has the correct number of characters
	else if (req.body.mobileNo.length !== 11){
		return res.status(400).send({ error: "Mobile number invalid" });
	}
	// checks if the password has atleast 8 characters
	else if (req.body.password.length < 8) {
		return res.status(400).send({ error: "Password must be atleast 8 characters" });
	}
	// if all needed formats are achieved
	else {
		// Creates a variable "newUser" and instantiates a new "User" object using the mongoose model
		// Uses the information from the request body to provide all the necessary information
		let newUser = new User({
			firstName : req.body.firstName,
			lastName : req.body.lastName,
			email : req.body.email,
			mobileNo : req.body.mobileNo,
			password : bcrypt.hashSync(req.body.password, 10)
		})
		// Saves the created object to our database
		// Then, return result to the handler function. No return keyword used because we're using arrow function's implicit return feature
		// catch the error and return to the handler function. No return keyword used because we're using arrow function's implicit return feature
		newUser.save()
		.then((user) => res.status(201).send({ message: "Registered Successfully" }))
		.catch(err => {
			console.error("Error in saving: ", err)
			return res.status(500).send({ error: "Error in save"})
		})
	}
};
/*
	IMPORTANT NOTE: 
		-201 is used instead of 200 since a new record is created in the database in registering a new account.
		-200 would be valid as well, but for more clarity, 201 is used to highlight a new document creation.
		-500 http status refers to an internal server error which means that the request is valid, but an error occured in sending the response.
*/

// [SECTION] User authentication
/*
	Steps:
	1. Check the database if the user email exists
	2. Compare the password provided in the login form with the password stored in the database
	3. Generate/return a JSON web token if the user is succesffuly logged in and return false if not
*/

module.exports.loginUser = (req, res) => {
	// The "findOne" method returns the first record in the collection that matches the search criteria
	// We use the "findOne" method instead of the "find" method which returns all records that match the search criteria
	if(req.body.email.includes("@")){
		User.findOne({ email : req.body.email })
		.then(result => {
			// if the email is not found in the database
			if(result == null){
				// send the message to the user
				return res.status(404).send({ error: "No Email Found" });
			} else {

				// Creates the variable "isPasswordCorrect" to return the result of comparing the login form password and the database password
				// The "compareSync" method is used to compare a non encrypted password from the login form to the encrypted password retrieved from the database and returns "true" or "false" value depending on the result
				// A good coding practice for boolean variable/constants is to use the word "is" or "are" at the beginning in the form of is+Noun
					//example. isSingle, isDone, isAdmin, areDone, etc..
				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				// If the passwords match/result of the above code is true
				if (isPasswordCorrect) {

					// Generate an access token
					// Uses the "createAccessToken" method defined in the "auth.js" file
					// Returning an object back to the client application is common practice to ensure information is properly labeled and real world examples normally return more complex information represented by objects
					return res.status(200).send({ access : auth.createAccessToken(result)})

				// Passwords do not match
				} else {
					return res.status(401).send({ message: "Email and password do not match" });
				}
			}
		})
		.catch(err => {
			console.error("Error in find: ", err)
			return res.status(500).send({ error: "Error in find"})
		})
		}
		else {
			return res.status(400).send({error: "Invalid Email"})
		}
};
/*
	IMPORTANT NOTE: 
		-unlike register, sending 200 is more appropriate upon succesful logging in since we're just looking for a document in the database and match it with the credentials sent from the request body.
		- 404 http status code refers to documents or resources that are not found e.g. pages in the website or documents in the database
		- 401 http status code refers to unauthorized access. This is used mostly if the credentials provided in the request body do not match the document found in the database.
*/

//[SECTION] Retrieve user details
/*
	Steps:
	1. Retrieve the user document using it's id
	2. Change the password to an empty string to hide the password
	3. Return the updated user record
*/
//[SECTION] Retrieve user details
// The "getProfile" method now has access to the "req" and "res" objects because of the "next" function in the "verify" method.
module.exports.getProfile = (req, res) => {
    const userId = req.user.id;

    // / The "return" keyword ensures the end of the getProfile method.
	// // Since getProfile is now used as a middleware it should have access to "req.user" if the "verify" method is used before it.
	// Order of middlewares is important. This is because the "getProfile" method is the "next" function to the "verify" method, it receives the updated request with the user id from it.
    User.findById(userId)
    .then(user => {
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Exclude sensitive information like password
        user.password = undefined;

        return res.status(200).send({ user });
    })
    .catch(err => {
    	console.error("Error in fetching user profile", err)
    	return res.status(500).send({ error: 'Failed to fetch user profile' })
    });
};
/*
	IMPORTANT NOTE:
		- The status code of a response is a three-digit integer code that describes the result of the request and the semantics of the response, including whether the request was successful and what content is enclosed (if any). All vakud status codes are within the range of 100 to 599, inclusive.
		- The first digit of the status code defines the class of response. The last two digits do not have any categorization role. There are five values for the first digit:
			-1xx (Informational): The request was received, continuing process.
			-2xx (Successful): The request was successfully received, understood, and accepted.
			-3xx (Redirection): Further action needs to be taken in order to complete the request
			-4xx (Client Error): The request contains bad syntax or cannot be fulfilled 
			-5xx (Server Error): The server failed to fulfill an apparently valid request
		-HTTP response status codes indicate wheter or not a specific HTTP request has been successfully completed
		-For a get request, 200 code refers to successful request, meaning the server processed the request and returned a response back to the client without any errors.
		-500 http status refer to an internal server error which means that the request is valid, but an error occured in send the response. e.g. database issues, server-side codes, or server problems.

*/

/*
Important Note
	- With this, routes now simply handle the activation of the controller.
	- Controllers now handle all business logic.
	- The controllers now end the cycle as it is now expected to use res.send() and send a response.
	- next can be omitted from a middleware/controller if it will not pass the data to another function.
	- Controllers as middleware then make our code more readable and modular. Where you can simply add or remove controllers or middleware from a route.
*/
// [SECTION] For Enrolling A user
module.exports.enroll = (req, res) => {

	console.log(req.user.id) //the user's id from the decoded token after verify()
	console.log(req.body.enrolledCourses) //the course from our request body

	//process stops here and sends response IF user is an admin
	if(req.user.isAdmin){
		return res.status(403).send({ error: "Admin is forbidden" });
	}

	let newEnrollment = new Enrollment ({
		 // Adds the id of the logged in user from the decoded token
		userId : req.user.id,
		// gets the courseId from the request body
		enrolledCourses: req.body.enrolledCourses,
		totalPrice: req.body.totalPrice
	})
	
	return newEnrollment.save()
	.then(enrolled => {
		return res.status(201).send({ 
				message: "Successfully Enrolled",
				enrolled: enrolled
		 });
	})
	.catch(err => {
		console.error("Error in enrolling: ", err)
		return res.status(500).send({ error: "Error in enrolling" })
	})
}

// [SECTION] Getting All Enrollements
module.exports.getEnrollments = (req, res) => {
return Enrollment.find({userId : req.user.id})
	.then(enrollments => {
		if (!enrollments) {
			return res.status(404).send({ error: 'No enrollments not found' });
		}
		return res.status(200).send({ enrollments });
	})
	.catch(err => {
		console.error("Error in fetching enrollments")
		return res.status(500).send({ error: 'Failed to fetch enrollments' })
	});
};

// Function to reset the password
module.exports.resetPassword = async (req, res) => {
	try {
	  const { newPassword } = req.body;
	  const { id } = req.user; // Extracting user ID from the authorization header
  
	  // Hashing the new password
	  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
	  // Updating the user's password in the database
	  await User.findByIdAndUpdate(id, { password: hashedPassword });
  
	  // Sending a success response
	  res.status(200).send({ message: 'Password reset successfully' });
	} catch (error) {
	  console.error(error);
	  res.status(500).send({ message: 'Internal server error' });
	}
  };

  // Controller function to update the user profile
module.exports.updateProfile = async (req, res) => {
	try {
	  // Get the user ID from the authenticated token
	  const userId = req.user.id;
  
	  // Retrieve the updated profile information from the request body
	  const { firstName, lastName, mobileNo } = req.body;
  
	  // Update the user's profile in the database
	  const updatedUser = await User.findByIdAndUpdate(
		userId,
		{ firstName, lastName, mobileNo },
		{ new: true }
	  );
  
	  res.send(updatedUser);
	} catch (error) {
	  console.error(error);
	  res.status(500).send({ message: 'Failed to update profile' });
	}
  }