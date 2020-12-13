const multer = require('../config/multer');
const Image = require('../models/image');
const User = require('../models/user');
const Comment = require('../models/imagecomment');

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
	const comment = new Comment({ imageId, user, comment: critique });
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
	res.render('./image/upload', {
		title: 'Upload your image',
		csrfToken: req.csrfToken(),
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
	});
};

exports.displayImage = (req, res) => {
	const id = req.params.id;
	Image.findOne({ _id: id })
		.populate('createdBy critiques')
		.then((image) => {
			/* Redirect if no image found with the associated ID */
			if (!image) return res.redirect('/gallery');
			console.log(image);
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
