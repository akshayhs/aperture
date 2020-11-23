const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

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
				req.flash('error', 'The entered username already exists. Please choose a new username');
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
			res.redirect('/');
		})
		.catch((error) => {
			console.log(error);
		});
};

/* READ */
exports.displayLogin = (req, res) => {
	message = req.flash('error');
	if (message.length === 0) message = null;
	console.log(message);
	res.render('./auth/login', {
		title: 'Login to your account',
		csrfToken: res.locals.csrfToken,
		user: res.locals.loggedInUser,
		error: message,
	});
};

exports.displaySignup = (req, res) => {
	let message = req.flash('error');
	console.log(message);
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
