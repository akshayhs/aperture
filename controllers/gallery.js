const multer = require('../config/multer');
const Image = require('../models/image');
const User = require('../models/user');
const Critique = require('../models/imagecomment');
const { update } = require('../models/user');

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
		sensitivity,
	} = req.body;
	const tagsToAdd = tags.split(',');
	multer(req, res, (error) => {
		if (error) {
			res.status(500);
			if (error.code == 'LIMIT_FILE_SIZE') {
				error.message = 'The uploaded file size is too large as it exceeds the permitted limit of 250KB';
				error.success = false;
				req.flash('sizeError', `${error.message}`);
				return res.redirect('/gallery/upload');
			}
		} else if (copyright !== 'on') {
			req.flash('consentError', 'The consent box must be checked. Please check the box to upload the image.');
			return res.redirect('/gallery/upload');
		} else {
			const image = new Image({
				path,
				category,
				description,
				title,
				tags: tagsToAdd,
				camera,
				lens,
				exposure,
				shutterspeed,
				pptechniques,
				copyright: true,
				createdBy: user,
				sensitivity,
			});
			image
				.save()
				.then((savedImage) => {
					return User.findOneAndUpdate(
						{ username: user.username },
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
		}
	});
};

exports.addUserComment = (req, res) => {
	const imageId = req.params.id;
	const user = res.locals.loggedInUser;
	const critique = req.body.comment;
	const comment = new Critique({ imageId, user, comment: critique });
	comment
		.save()
		.then((savedComment) => {
			return Image.findByIdAndUpdate({ _id: imageId }, { $push: { critiques: savedComment._id } });
		})
		.then((information) => {
			console.log(information);
			res.redirect(`/gallery/${imageId}`);
		})
		.catch((error) => {
			console.log(error);
		});
};

/* READ */
exports.displayUploadForm = (req, res) => {
	let errorMessage = req.flash('sizeError');
	let consentMessage = req.flash('consentError');
	if (errorMessage.length === 0) errorMessage = null;
	if (consentMessage.length === 0) consentMessage = null;
	res.render('./image/upload', {
		title: 'Upload your image',
		csrfToken: req.csrfToken(),
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
		error: errorMessage,
		consentError: consentMessage,
	});
};

exports.displayImage = (req, res) => {
	const id = req.params.id;
	Image.findOne({ _id: id })
		.populate('createdBy critiques')
		.then((image) => {
			/* Redirect if no image found with the associated ID */
			if (!image) return res.redirect('/gallery');
			res.render('./image/details', {
				title: `${image.title} by ${image.createdBy.name.first} ${image.createdBy.name.last}`,
				user: res.locals.loggedInUser,
				isAuthenticated: res.locals.isAuthenticated,
				image: image,
				critiques: image.critiques,
			});
		})
		.catch((error) => {
			console.log(error);
		});
};

exports.displayImageEditForm = (req, res) => {
	const id = req.params.id;
	Image.findById({ _id: id }).then((image) => {
		res.render('./image/edit', {
			title: 'Edit image details',
			user: res.locals.loggedInUser,
			isAuthenticated: res.locals.isAuthenticated,
			image: image,
		});
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

/* UPDATE */
exports.editImageDetails = (req, res) => {
	const id = req.params.id;
	const newImage = req.file;
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
		sensitivity,
	} = req.body;
	const tagsToAdd = tags.split(',');
	multer(req, res, (error) => {
		if (error) {
			res.status(500);
			if (error.code == 'LIMIT_FILE_SIZE') {
				error.message = 'The uploaded file size is too large as it exceeds the permitted limit of 250KB';
				error.success = false;
				req.flash('sizeError', `${error.message}`);
				return res.redirect('/gallery/upload');
			}
		} else if (copyright !== 'on') {
			req.flash('consentError', 'The consent box must be checked. Please check the box to upload the image.');
			return res.redirect('/gallery/upload');
		} else {
			const updatedImageDetails = {
				title,
				category,
				description,
				tags: tagsToAdd,
				camera,
				lens,
				exposure,
				shutterspeed,
				copyright: true,
				pptechniques,
				sensitivity,
			};
			/* Only add a new file if found in the request object */
			if (newImage) {
				updatedImageDetails.path = newImage.path;
			}
			Image.findByIdAndUpdate(
				{ _id: id },
				{
					$set: updatedImageDetails,
				},
				{ new: true }
			)
				.then((image) => {
					res.redirect(`/gallery/${id}`);
				})
				.catch((error) => {
					console.log(error);
				});
		}
	});
};

/* DELETE */
exports.deleteImage = (req, res) => {
	const id = req.params.id;
	Image.findByIdAndDelete({ _id: id }).then((foundImage) => {
		/* Return back to gallery if image does not exist */
		if (!foundImage) return res.redirect('/gallery');
		console.log(foundImage);
		req.flash(
			'deleteSuccess',
			'The image you added has been successfully deleted. It is no longer accessible by anyone.'
		);
		return res.redirect('/gallery');
	});
};
