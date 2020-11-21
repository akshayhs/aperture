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
			if (foundUser) return res.redirect('/user/register');
			/* Reject account creation if password fields do not match */
			if (password !== c_password) return res.redirect('/user/register');
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
	res.render('./auth/login', {
		title: 'Login to your account',
		csrfToken: res.locals.csrfToken,
		user: res.locals.loggedInUser,
	});
};

exports.displaySignup = (req, res) => {
	res.render('./auth/register', {
		title: 'Get started',
		csrfToken: res.locals.csrfToken,
		user: res.locals.loggedInUser,
	});
};

exports.authenticateUser = (req, res) => {
	const user = req.body.user;
	const password = req.body.password;
	let currentUser;
	User.findOne({ $or: [ { username: user }, { email: user } ] })
		.then((foundUser) => {
			/* Redirect if user not found */
			if (!foundUser) return res.redirect('/user/login');
			currentUser = foundUser;
			return bcrypt.compare(password, foundUser.password);
		})
		.then((passwordsMatch) => {
			/* Redirect if authentication failed */
			if (!passwordsMatch) return res.redirect('/user/login');
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
