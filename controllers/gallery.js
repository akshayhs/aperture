const multer = require('../config/multer');
const image = require('../models/image');
const Image = require('../models/image');
const user = require('../models/user');
const User = require('../models/user');

/* CREATE */
exports.attemptUpload = (req, res) => {
	const user = req.session.user;
	const path = req.file.path;
	const {
		category,
		title,
		description,
		tags,
		camera,
		lens,
		exposure,
		shutterspeed,
		copyright,
		pptechniques,
	} = req.body;
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
				pptechniques,
				copyright: true,
				createdBy: user._id,
			});
			image
				.save()
				.then((savedImage) => {
					return User.findOneAndUpdate(
						{ username: username },
						{ $push: { images: savedImage._id } },
						{ new: true }
					);
				})
				.then((info) => {
					console.log(info);
					res.redirect('/gallery');
				})
				.catch((error) => {
					console.log(error);
				});
			// User.findById({ _id: username })
			// 	.then((user) => {
			// 		return user;
			// 	})
			// 	.then((foundUser) => {
			// 		/* Create the image object */
			// 		const image = new Image({
			// 			path,
			// 			category,
			// 			description,
			// 			title,
			// 			tags: tagsValue,
			// 			camera,
			// 			lens,
			// 			exposure,
			// 			shutterspeed,
			// 			pptechniques,
			// 			copyright: true,
			// 			createdBy: foundUser._id,
			// 		});
			// 		return image.save();
			// 	})
			// 	.then((savedImage) => {
			// 		console.log(savedImage);
			// 		res.redirect('/gallery');
			// 	})
			// 	.catch((error) => {
			// 		console.log(error);
			// 	});
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

exports.displayImage = (req, res) => {
	const id = req.params.id;
	Image.findOne({ _id: req.params.id })
		.populate('createdBy')
		.then((image) => {
			/* Redirect if no image found with the associated ID */
			if (!image) return res.redirect('/gallery');
			res.render('./image/details', {
				title: `${image.title} by ${image.createdBy.name.first} ${image.createdBy.name.last}`,
				user: res.locals.loggedInUser,
				isAuthenticated: res.locals.isAuthenticated,
				image: image,
			});
		})
		.catch((error) => {
			console.log(error);
		});
};

exports.displayImagesByCategory = (req, res) => {
	const category = req.params.category;
	Image.find({ category: category }).populate('createdBy').then((images) => {
		res.render('./image/images_by_category', {
			title: `Images under ${req.params.category}`,
			user: res.locals.loggedInUser,
			isAuthenticated: res.locals.isAuthenticated,
			images: images,
			category: category,
		});
	});
};

exports.displayImagesByTags = (req, res) => {
	const tag = req.params.tag;
	Image.find({ tags: tag }).populate('createdBy').then((images) => {
		res.render('./image/images_by_tag', {
			title: `Images for tag: ${req.params.tag}`,
			user: res.locals.loggedInUser,
			isAuthenticated: res.locals.isAuthenticated,
			images: images,
			tag: tag,
		});
	});
};
