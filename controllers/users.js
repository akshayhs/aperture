const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const User = require('../models/user');
const Image = require('../models/image');
const { update } = require('../models/user');

/* CREATE */
exports.completeUserProfile = async (req, res) => {
	const username = req.params.username;
	const image = req.file;
	const { firstname, lastname, website, biography, cameras, lenses } = req.body;
	const cameraDetails = cameras.split(',');
	const lensDetails = lenses.split(',');
	const updatedUserDetails = {
		firstname,
		lastname,
		website,
		biography,
		cameras: cameraDetails,
		lenses: lensDetails,
	};
	/* No file was uploaded by the user */
	if (!image) {
		try {
			await User.findByIdAndUpdate({ _id: req.session.user._id }, { $set: updatedUserDetails }, { new: true });
			req.flash('infoUpdateSuccess', 'Your details were updated successfully.');
			return res.status(201).redirect(`/users/${username}/profile`);
		} catch (error) {
			console.log(error);
		}
		/* An associated file was found in the file object */
	} else {
		const assetName = `${firstname}_${lastname}`;
		cloudinary.uploader.upload(
			image.path,
			{
				public_id: `projects/aperture/images/avatar/${assetName}`,
				unique_filename: true,
				discard_original_filename: true,
				allowed_formats: [ 'jpg', 'jpeg' ],
			},
			(error, result) => {
				if (error) console.log(error);
				return User.findByIdAndUpdate(
					{ _id: req.session.user._id },
					{ $set: { updatedUserDetails, avatar: result.url } },
					{ new: true }
				)
					.then(() => {
						req.flash('infoUpdateSuccess', 'Your details were updated successfully.');
						return res.status(201).redirect(`/users/${username}/profile`);
					})
					.catch((error) => {
						console.log(error);
					});
			}
		);
	}
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
	let updateSuccessMessage = req.flash('infoUpdateSuccess');
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
