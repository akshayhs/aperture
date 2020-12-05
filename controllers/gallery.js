const multer = require('../config/multer');
const Image = require('../models/image');
const User = require('../models/user');

/* CREATE */
exports.attemptUpload = (req, res) => {
	const username = req.session.user._id;
	const path = req.file.path;
	const { category, title, description, tags, camera, lens, exposure, shutterspeed, copyright } = req.body;
	const tagsValue = tags.split(',');
	multer(req, res, (error) => {
		if (error) {
			res.status(500);
			if (error.code == 'LIMIT_FILE_SIZE') {
				error.message = 'The uploaded file size is too large. Allowed file size is 250KB';
				error.success = false;
				return res.redirect('/gallery/upload');
			}
		} else if (copyright !== 'on') {
			return res.redirect('/gallery/upload');
		} else {
			User.findById({ _id: username })
				.then((user) => {
					return user;
				})
				.then((foundUser) => {
					/* Create the image object */
					const image = new Image({
						path,
						category,
						description,
						title,
						tags: tagsValue,
						camera,
						lens,
						exposure,
						shutterspeed,
						copyright: true,
						createdBy: foundUser._id,
					});
					return image.save();
				})
				.then((savedImage) => {
					console.log(savedImage);
					res.redirect('/gallery');
				})
				.catch((error) => {
					console.log(error);
				});
		}
	});
};

/* READ */
exports.displayUploadForm = (req, res) => {
	res.render('./image/upload', {
		title: 'Upload your image',
		csrfToken: req.csrfToken(),
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
	});
	console.log(req.session.user._id);
};
