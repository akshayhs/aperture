const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const upload = multer().single('image');

const Image = require('../models/image');
const User = require('../models/user');
const Critique = require('../models/imagecomment');

/* CREATE */
exports.attemptUpload = async (req, res, next) => {
	const user = req.session.user;
	const file = req.file;
	const {
		category,
		title,
		description,
		caption,
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
	const imageTitle = title.split(' ', '_');
	console.log(req.file);
	if (copyright !== 'on') {
		req.flash('consentError', 'The consent box must be checked. Please check the consent box to upload your work.');
		return res.redirect('/gallery/upload');
	} else {
		cloudinary.uploader.upload(
			file.path,
			{
				public_id: `projects/aperture/images/${imageTitle}`,
				resource_type: image,
				unique_filename: true,
				discard_original_filename: true,
				tags: tagsToAdd,
				allowed_formats: [ 'jpg', 'jpeg' ],
			},
			(error, result) => {
				if (error) console.log(error);
				console.log(result);
				const image = new Image({
					path: result.url,
					public_id: result.public_id,
					category,
					description,
					title,
					caption,
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
					.then((image) => {
						return User.findByIdAndUpdate(
							{ _id: user._id },
							{ $push: { images: image._id } },
							{ new: true }
						);
					})
					.then(() => {
						fs.unlink(file.path, (error) => {
							if (error) console.log(error);
							res.status(201).redirect('/gallery');
						});
					})
					.catch((error) => {
						console.log(error);
					});
			}
		);
	}
};

exports.addUserComment = (req, res) => {
	const imageId = req.params.id;
	const user = res.locals.loggedInUser;
	const critique = req.body.comment;
	const comment = new Critique({ imageId, user, comment: critique });
	comment
		.save()
		.then((savedComment) => {
			return Image.findByIdAndUpdate({ _id: imageId }, { $push: { critiques: savedComment._id } }, { new: true });
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

exports.displayImage = async (req, res) => {
	let message = req.flash('critiqueUpdateSuccess');
	let critiqueDeleteSuccess = req.flash('deleteSuccess');
	if (message.length === 0) message = null;
	if (critiqueDeleteSuccess.length === 0) deleteMessage = null;
	const id = req.params.id;
	try {
		let image = await Image.findById({ _id: id })
			.populate({
				path: 'createdBy',
				select: 'username name.first name.last',
				model: User,
			})
			.populate({
				path: 'critiques',
				select: '_id comment createdAt updatedAt',
				model: Critique,
				populate: { path: 'user', select: 'username name.first name.last', model: User },
			});
		res.render('./image/details', {
			title: `${image.title} by ${image.createdBy.name.first} ${image.createdBy.name.last}`,
			user: res.locals.loggedInUser,
			isAuthenticated: res.locals.isAuthenticated,
			image: image,
			critiques: image.critiques,
			csrfToken: res.locals.csrfToken,
			updatedCritique: message,
			critiqueDeleteSuccess,
		});
	} catch (error) {
		console.log(error);
	}
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

exports.editUserCritique = async (req, res) => {
	const { id, critiqueId } = req.params;
	const comment = req.body.updatedcomment;
	try {
		const critique = await Critique.findByIdAndUpdate(
			{
				_id: critiqueId,
				imageId: id,
			},
			{ $set: { comment } }
		);
		res.status(201).redirect(`/gallery/${id}`);
	} catch (error) {
		console.log(error);
	}
};

/* DELETE */
exports.deleteImage = async (req, res) => {
	const id = req.params.id;
	try {
		const image = await Image.findOneAndDelete({ _id: id });
		cloudinary.uploader.destroy(
			image.public_id,
			{
				resource_type: 'image',
				invalidate: true,
			},
			(error, result) => {
				if (error) console.log(error);
				console.log(result);
			}
		);
		await User.findOneAndUpdate(
			{ username: res.locals.loggedInUser.username },
			{ $pull: { images: id } },
			{ new: true }
		);
		req.flash('deleteSuccess', 'Your image has been deleted successfully');
		res.redirect('/gallery');
	} catch (error) {
		console.log(error);
	}
};

exports.deleteCritique = async (req, res) => {
	const critiqueId = req.params.critiqueid;
	const imageId = req.params.id;
	try {
		await Critique.findByIdAndDelete({ _id: critiqueId });
		await Image.findByIdAndUpdate({ _id: imageId }, { $pull: { critiques: critiqueId } });
		req.flash('critiqueDeleteSuccess', 'Your critique has been deleted successfullly.');
		return res.redirect('`/${gallery}/${imageId}');
	} catch (error) {
		console.log(error);
	}
};
