const User = require('../models/user');
const Image = require('../models/image');

/* CREATE */
exports.completeUserProfile = (req, res) => {
	const username = req.params.username;
	const { firstname, lastname, website, cameras, lenses, biography } = req.body;
	User.findOneAndUpdate(
		{ username },
		{ $set: { 'name.first': firstname, 'name.last': lastname, website, biography, cameras, lenses } }
	)
		.then((savedInfo) => {
			console.log(savedInfo);
			req.flash('updateSuccess', 'Your details were saved successfully.');
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
	let updateSuccessMessage = req.flash('updateSuccess');
	if (message.length === 0) message = null;
	if (updateSuccessMessage.length === 0) updateSuccessMessage = null;
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
				updateSuccess: updateSuccessMessage,
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
			if (!foundUser) return res.status(422).redirect('/user/auth/login');
			res.render('./user/details', {
				title: `User profile for ${foundUser.name.first} ${foundUser.name.last}`,
				user: res.locals.loggedInUser,
				isAuthenticated: res.locals.isAuthenticated,
				associatedUser: foundUser,
			});
		})
		.catch((error) => {
			console.log(error);
		});
};

exports.displayUserUploadedImages = async (req, res, next) => {
	const user = req.session.user;
	await Image.find({ createdBy: user._id })
		.then((images) => {
			res.status(200).render('./user/uploaded_images.ejs', {
				title: `Your works`,
				user: res.locals.loggedInUser,
				isAuthenticated: res.locals.isAuthenticated,
				associatedUser: user,
				images: images,
			});
		})
		.catch((error) => {
			next(error);
		});
};

/* UPDATE */
exports.saveUserDetails = async (req, res) => {
	const username = req.params.username;
	const { firstname, lastname, website, biography, cameras, lenses } = req.body;
	const image = req.file;
	await User.findOneAndUpdate(
		{ username },
		{ $set: { firstname, lastname, website, biography, cameras, lenses, avatar: image.path } },
		{ new: true }
	)
		.then((user) => {
			console.log(user);
			req.flash('updateSuccess', 'Your details were saved successfully.');
			res.redirect(`/users/${username}/profile`);
		})
		.catch((error) => {
			console.log(error);
		});
};

/* DELETE */
exports.deleteAccount = async (req, res, next) => {
	// const username = req.params.username;
	// await User.findByIdAndDelete({ username: username }).then((foundUser) => {
	// 	/* User not found */
	// 	if (!foundUser) return res.redirect('/');
	// });
};
