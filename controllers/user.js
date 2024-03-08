const User = require("../models/User");
const Order = require("../models/Order")
const bcrypt = require('bcrypt');
const auth = require("../auth");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

module.exports.checkEmailExists = (req,res) => {
	if (req.body.email.includes("@")){
		return User.find({ email : req.body.email })
		.then(result => {
			if (result.length > 0) {
				return res.status(409).send({ error: "Duplicate Email Found" });
			} else {
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

module.exports.registerUser = (req,res) => {
	if (!req.body.email.includes("@")){
		return res.status(400).send({ error: "Email invalid" });
	}
	else if (req.body.mobileNo.length !== 11){
		return res.status(400).send({ error: "Mobile number invalid" });
	}
	else if (req.body.password.length < 8) {
		return res.status(400).send({ error: "Password must be atleast 8 characters" });
	}
	else {
		let newUser = new User({
			firstName : req.body.firstName,
			lastName : req.body.lastName,
			email : req.body.email,
			mobileNo : req.body.mobileNo,
			password : bcrypt.hashSync(req.body.password, 10)
		})
		newUser.save()
		.then((user) => res.status(201).send({ message: "Registered Successfully" }))
		.catch(err => {
			console.error("Error in saving: ", err)
			return res.status(500).send({ error: "Error in save"})
		})
	}
};

// START OF REGISTER CONFIRMATION
  // Registration email confirmation
  exports.sendRegistrationConfirmation = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user with the provided email exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).send({ message: 'User with this email already exists' });
        }

        // Create a new user (assuming this happens before sending confirmation email)

        // Construct email message
        const confirmationLink = 'http://localhost:4000/users/confirm-registration'; // Adjust the link accordingly
        const mailOptions = {
            from: 'eunicemarginel@gmail.com',
            to: email,
            subject: 'Registration Confirmation',
            html: `Thank you for registering with us! Please click <a href="${confirmationLink}">here</a> to confirm your registration.`,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Send success response
        res.status(200).send({ message: 'Registration confirmation email sent successfully' });
    } catch (error) {
        console.error('Error sending registration confirmation email:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
// END OF REGISTER CONFIRMATION

module.exports.loginUser = (req, res) => {
	if(req.body.email.includes("@")){
		User.findOne({ email : req.body.email })
		.then(result => {
			if(result == null){
				return res.status(404).send({ error: "No Email Found" });
			} else {
				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
				if (isPasswordCorrect) {
					return res.status(200).send({ access : auth.createAccessToken(result)})
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

module.exports.getProfile = (req, res) => {
    const userId = req.user.id;
    User.findById(userId)
    .then(user => {
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        user.password = undefined;

        return res.status(200).send({ user });
    })
    .catch(err => {
    	console.error("Error in fetching user profile", err)
    	return res.status(500).send({ error: 'Failed to fetch user profile' })
    });
};

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'eunicemarginelv@gmail.com',
	  pass: 'ozsb rklhshjr gkwk',
	},
  });

//   exports.requestPasswordReset = async (req, res) => {
// 	const { email } = req.body;
  
// 	try {
// 	  const user = await User.findOne({ email });
  
// 	  if (!user) {
// 		return res.status(404).json({ message: 'User not found' });
// 	  }
  
// 	  const resetToken = Math.random().toString(36).substring(7);
// 	  user.resetToken = resetToken;
  
// 	  await user.save();
  
// 	  const resetLink = `http://localhost:4000/users/reset-password?token=${resetToken}`;
// 	  const mailOptions = {
// 		from: 'eunicemarginel@gmail.com',
// 		to: user.email,
// 		subject: 'Password Reset Request',
// 		html: `Click the following link to reset your password: <a href="${resetLink}">${resetLink}</a>`,
// 	  };
  
// 	  await transporter.sendMail(mailOptions);
// 	  res.status(200).json({ message: 'Password reset email sent successfully' });
// 	} catch (error) {
// 	  console.error('Error requesting password reset:', error);
// 	  res.status(500).json({ message: 'Internal server error' });
// 	}
//   };
  
  exports.resetPassword = async (req, res) => {
	const { token, newPassword } = req.body;
  
	try {
	  const user = await User.findOne({ resetToken: token });
  
	  if (!user) {
		return res.status(400).json({ message: 'Invalid or expired reset token' });
	  }
  
	  user.password = newPassword;
	  user.resetToken = undefined;
  
	  await user.save();
  
	  res.status(200).json({ message: 'Password reset successfully' });
	} catch (error) {
	  console.error('Error resetting password:', error);
	  res.status(500).json({ message: 'Internal server error' });
	}
  };

// module.exports.resetPassword = async (req, res) => {
// 	try {
// 	  const { newPassword } = req.body;
// 	  const { id } = req.user;
// 	  const hashedPassword = await bcrypt.hash(newPassword, 10);

// 	  await User.findByIdAndUpdate(id, { password: hashedPassword });

// 	  res.status(200).send({ message: 'Password reset successfully' });
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).send({ message: 'Internal server error' });
// 	}
//   };

module.exports.updateProfile = async (req, res) => {
	try {
	  const userId = req.user.id;
	  const { firstName, lastName, mobileNo } = req.body;
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