const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const transporter = require('../config/sendgrid');
const crypto = require('crypto');

/* CREATE */
exports.createAccount = (req, res) => {
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	const c_password = req.body.c_password;
	User.findOne({ $or: [ { username: username }, { email: email } ] })
		.then((foundUser) => {
			/* Reject account creation if details already exist */
			if (foundUser) {
				req.flash('error', 'The entered username/email already exists. Please choose a new username');
				return res.redirect('/auth/register');
			}
			/* Reject account creation if password fields do not match */
			if (password !== c_password) {
				req.flash('error', 'The entered passwords do not match. Please try again.');
				return res.redirect('/auth/register');
			}
			return bcrypt.hash(c_password, 12);
		})
		.then((encryptedPassword) => {
			const user = new User({
				username: username,
				email: email,
				password: encryptedPassword,
			});
			console.log(
				`A new user has been created with the following details:\nUsername: ${user.username}\nEmail:${user.email}`
			);
			return user.save();
		})
		.then((newUser) => {
			req.session.isLoggedIn = true;
			req.session.user = newUser;
			req.session.save((error) => {
				if (error) console.log(error);
				res.redirect(`/users/${newUser.username}/profile/complete`);
			});
			const email = {
				to: `${newUser.email}`,
				from: 'ak.prodigy24@gmail.com',
				subject: 'Welcome to aperture!',
				html: '<p>Get started!</p><br><br><p><a href="/auth/login" Login to your account now!</p>',
			};
			transporter.sendMail(email, (error, success) => {
				if (error) console.log(error);
			});
		})
		.catch((error) => {
			console.log(error);
		});
};

/* READ */
exports.displayLogin = (req, res) => {
	let message = req.flash('error');
	let userErrorMessage = req.flash('userNotFoundError');
	let passwordResetMessage = req.flash('resetRequestSuccess');
	if (message.length === 0) message = null;
	if (passwordResetMessage.length === 0) passwordResetMessage = null;
	if (userErrorMessage.length === 0) userErrorMessage = null;
	res.render('./auth/login', {
		title: 'Login to your account',
		csrfToken: res.locals.csrfToken,
		user: res.locals.loggedInUser,
		error: message,
		passwordResetNotification: passwordResetMessage,
		userNotFoundError: userErrorMessage,
	});
};

exports.displaySignup = (req, res) => {
	let message = req.flash('error');
	if (message.length === 0) message = null;
	res.render('./auth/register', {
		title: 'Get started',
		csrfToken: res.locals.csrfToken,
		user: res.locals.loggedInUser,
		error: message,
	});
};

exports.authenticateUser = (req, res) => {
	const user = req.body.user;
	const password = req.body.password;
	let currentUser;
	User.findOne({ $or: [ { username: user }, { email: user } ] })
		.then((foundUser) => {
			/* Redirect if user not found */
			if (!foundUser) {
				return res.redirect('/auth/login');
			}
			currentUser = foundUser;
			return bcrypt.compare(password, foundUser.password);
		})
		.then((passwordsMatch) => {
			/* Redirect if authentication failed */
			if (!passwordsMatch) {
				req.flash('error', 'The entered username/password is incorrect. Please try again.');
				return res.redirect('/auth/login');
			}
			req.session.isLoggedIn = true;
			req.session.user = currentUser;
			req.session.save((error) => {
				if (error) console.log(error);
				res.redirect('/');
			});
		})
		.catch((error) => {
			console.log(error);
		});
};

exports.attemptLogout = (req, res) => {
	req.session.isLoggedIn = false;
	req.session.user = null;
	req.session.destroy((error) => {
		if (error) console.log(error);
		res.redirect('/');
	});
};

exports.resetUserPassword = (req, res) => {
	/* Will either get username or email depending on user entered input */
	const userInfo = req.body.info;
	crypto.randomBytes(64, (error, buffer) => {
		if (error) {
			throw new Error(error);
		}
		/* Unique token for auth purposes */
		const token = buffer.toString('hex');
		User.findOne({ $or: [ { username: userInfo }, { email: userInfo } ] })
			.then((user) => {
				if (!user) {
					req.flash('userNotFoundError', 'No user details were found with the associated email or username');
					return res.redirect('/auth/login');
				}
				user.pwResetToken = token;
				user.tokenExpiry = Date.now() + 1800000; // Adds 30 minutes before expiring
				return user.save();
			})
			.then((user) => {
				req.flash(
					'resetRequestSuccess',
					'Your request has been successfully processed. Please check your email id to reset your password.'
				);
				res.redirect('/auth/login');
				transporter.sendMail({
					to: user.email,
					from: 'ak.prodigy24@gmail.com',
					subject: 'Reset your account password on Aperture',
					html: `<h3>Hey,&nbsp;${user.name.first || user.username}!</h3>
						<p>We have received a request for resetting your user account password on Aperture.</p>
	
						<p>If you are sure you did request for a new password, please click <a target="blank" href="http://localhost:8000/auth/user/password/reset/confirm/${token}">here</a>&nbsp;to set a new password on your account.
						
						<p></p>If you are not able to click the link above, please copy the following text and paste it in the address bar of your browser: http://localhost:8000/auth/user/password/reset/confirm/${token}</p>

						<p><strong>Please remember, the link will only stay active for 30 minutes from sending this email, after which you have to request for a new password once again!</strong></p>
	
						<p>Should you have received this email when you did not request for a new password, you can simply ignore this email as anybody else trying to access your account cannot proceed further without the access to the link above!</p>
						`,
				});
			})
			.catch((error) => {
				console.log(error);
			});
	});
};
