const User = require('../models/user');

/* CREATE */
exports.saveUserProfile = (req, res) => {
	const username = req.params.username;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const website = req.body.website;
	const update = {
		'name.first': firstname,
		'name.last': lastname,
		website,
	};
	User.findOneAndUpdate({ username: username }, update, { new: true })
		.then((savedData) => {
			console.log(savedData);
			res.redirect(`/users/${username}/profile`);
		})
		.catch((error) => {
			console.log(error);
		});
};

/* READ */
exports.completeProfile = (req, res) => {
	res.render('./user/complete', {
		title: 'Complete your user profile',
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
		csrfToken: res.locals.csrfToken,
	});
};

exports.displayProfile = async (req, res, next) => {
	let message = req.flash('error');
	if (message.length === 0) message = null;
	const username = req.params.username;
	User.findOne({ username: username })
		.then((foundUser) => {
			if (!foundUser) return res.redirect('/user/auth/login');
			res.render('./user/profile', {
				title: `User profile for ${foundUser.username}`,
				user: res.locals.loggedInUser,
				isAuthenticated: res.locals.isAuthenticated,
				error: message,
				name: res.locals.loggedInUser.name,
			});
			console.log(foundUser);
		})
		.catch((error) => {
			console.log(error);
		});
};

exports.displayUserDetails = async (req, res) => {
	const username = req.params.username;
	await User.findOne({ username: username })
		.then((foundUser) => {
			if (!foundUser) return res.redirect('/user/auth/login');
			res.render('./user/details', {
				title: `User profile for ${foundUser.username}`,
				user: res.locals.loggedInUser,
				isAuthenticated: res.locals.isAuthenticated,
			});
		})
		.catch((error) => {
			console.log(error);
		});
};

exports.completeUserProfile = (req, res) => {};

/* DELETE */
exports.deleteAccount = async (req, res, next) => {
	const username = req.params.username;
	await User.findByIdAndDelete({ username: username }).then((foundUser) => {
		/* User not found */
		if (!foundUser) return res.redirect('/');
	});
};
