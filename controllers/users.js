const User = require('../models/user');

exports.displayProfile = async (req, res, next) => {
	let message = req.flash('error');
	if (message.length === 0) message = null;
	const username = req.params.username;
	await User.findOne({ username: username })
		.then((foundUser) => {
			if (!foundUser) return res.redirect('/user/auth/login');
			res.render('./user/profile', {
				title: `User profile for ${foundUser.username}`,
				user: res.locals.loggedInUser,
				isAuthenticated: res.locals.isAuthenticated,
				error: message,
			});
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

/* DELETE */
exports.deleteAccount = async (req, res, next) => {
	const username = req.params.username;
	await User.findByIdAndDelete({username: username}).then(foundUser => {
		/* User not found */
		if(!foundUser) return res.redirect('/');
	})
};
