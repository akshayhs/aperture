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
	let passwordReset = req.flash('passwordResetSuccess');
	if (message.length === 0) message = null;
	if (passwordResetMessage.length === 0) passwordResetMessage = null;
	if (userErrorMessage.length === 0) userErrorMessage = null;
	if (passwordReset.length === 0) passwordReset = null;
	res.render('./auth/login', {
		title: 'Login to your account',
		csrfToken: res.locals.csrfToken,
		user: res.locals.loggedInUser,
		error: message,
		passwordResetNotification: passwordResetMessage,
		userNotFoundError: userErrorMessage,
		passwordResetSuccess: passwordReset,
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
				res.redirect('/gallery');
			});
		})
		.catch((error) => {
			console.log(error);
		});
};

exports.attemptLogout = (req, res) => {
	req.session.destroy((error) => {
		if (error) console.log(error);
		res.redirect('/');
	});
};

exports.displayPasswordResetForm = async (req, res) => {
	let resetSuccess = req.flash('resetRequestSuccess');
	let resetError = req.flash('userNotFoundError');
	if (resetSuccess.length === 0) resetSuccess = null;
	if (resetError.length === 0) resetError = null;
	res.render('./auth/reset_page', {
		title: 'Reset your password',
		csrfToken: res.locals.csrfToken,
		user: res.locals.loggedInUser,
		currentYear: new Date().getFullYear(),
		successMessage: resetSuccess,
		errorMessage: resetError,
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
					return res.redirect('/auth/user/password/reset');
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
				res.redirect('/auth/user/password/reset');
				transporter.sendMail({
					to: user.email,
					from: 'ak.prodigy24@gmail.com',
					subject: 'Reset your password on Aperture',
					html: `<h3>Hey,&nbsp;${user.name.first || user.username}!</h3>
						<p>We have received a request for resetting your user account password on Aperture.</p>
	
						<p>If you are sure you did request for a new password, please click <a target="_blank" href="http://localhost:3000/auth/user/password/reset/${token}">here</a>&nbsp;to set a new password on your account.
						
						<p></p>If you are not able to click the link above, please copy the following text and paste it in the address bar of your browser: http://localhost:3000/auth/user/password/reset/${token}</p>

						<p><strong>Please remember, the link will only stay active for 30 minutes from receiving this email, after which you have to request for a new password once again!</strong></p>
	
						<p>Should you have received this email when you did not request for a new password, you can simply ignore this email as anybody else trying to access your account cannot proceed further without the access to the link above.</p>
						`,
				});
			})
			.catch((error) => {
				console.log(error);
			});
	});
};

exports.attemptUserPasswordReset = async (req, res) => {
	const token = req.params.token;
	/* Flash messages */
	let passwordError = req.flash('passwordMismatchError');
	if (passwordError.length === 0) null;
	try {
		const user = await User.findOne({ pwResetToken: token, tokenExpiry: { $gt: Date.now() } });
		res.render('./auth/reset', {
			title: 'Reset your password',
			csrfToken: res.locals.csrfToken,
			user: res.locals.loggedInUser,
			associatedUser: user._id.toString(),
			token: token,
			error: passwordError,
			id: user._id.toString(),
		});
	} catch (error) {
		throw new Error(error);
	}
};

/* UPDATE */
exports.confirmUserPasswordReset = async (req, res) => {
	const password = req.body.password;
	const c_password = req.body.c_password;
	const token = req.params.token;
	const id = req.body.id;
	try {
		const user = await User.findOne({ pwResetToken: token, tokenExpiry: { $gt: Date.now() }, _id: id });
		if (password !== c_password) {
			req.flash('passwordMismatchError', 'The entered passwords do not match. Please try again.');
			return res.redirect(`/auth/user/password/reset/${token}`);
		}
		const updatedPassword = await bcrypt.hash(c_password, 12);
		user.password = updatedPassword;
		user.pwResetToken = undefined; // Will not have values once password is reset.
		user.tokenExpiry = undefined; // Will not be required again once password is reset.
		user.save();
		req.flash(
			'passwordResetSuccess',
			'Your password has been reset successfully. Please login to your account again.'
		);
		res.status(201).redirect('/auth/login');
	} catch (error) {
		throw new Error(error);
	}
};

/* DELETE */
exports.deleteUserAccount = (req, res) => {
	/* Fetch the username for reference and to send delete confirmation email */
	const username = req.body.username;
	/* Create random bytes as a token to attach to user to confirm the user indeed requested deletion */
	try {
		const generatedToken = crypto.randomBytes(32, (error, buffer) => {
			return buffer.toString('hex');
		});
		/* Find the user whose account must be deleted */
		let user = User.findOne({ username: username });
		transporter.sendMail({
			to: user.email,
			from: 'ak.prodigy24@gmail.com',
			subject: 'Confirm deletion of your account on Aperture',
			html: `<h3>Hey,&nbsp;${user.name.first || user.username}!</h3>
				<p>Unfortunatey, someone<em>(hoping it is you)</em> has requested your account be deleted on Aperture.</p>

				<p>If you wish to confirm this request, please click <a target="blank" href="http://localhost:8000/users/${user.username}/auth/delete/confirm/${generatedToken}">here.</a> to confirm the deletion process.</p>

				<p>If you have problems with the platform itself, consider <a href="mailto:moderator@webfluence.dev?subject=Problems%20with%20the%20platform">writing to us first</a>.&nbspIn most cases, we will be able to help you with your queries.</p>

				<p>If you wish to delete your account permanently, we understand and respect your decision. Thank you for staying with us for so long. We are sorry to see you go. Once an account is scheduled for deletion, it cannot be restored manually under any circumstances. Should you wish to post your works, blogs and comment on others' works, you will have to create a new account once again.</p>
			`,
		});
		/* Redirect the user once the request is complete */
		return res.redirect('/');
	} catch (error) {
		console.log(error);
	}
};
