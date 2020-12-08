const User = require('../models/user');
const Enquiries = require('../models/contact');
const Blog = require('../models/blog');
const Image = require('../models/image');

const transporter = require('../config/sendgrid');
const { Schema } = require('mongoose');

/* CREATE */
exports.submitResponse = (req, res) => {
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const email = req.body.email;
	const phone = req.body.phone;
	const reason = req.body.reason;
	const message = req.body.message;
	const enquiry = new Enquiries({
		firstName: firstname,
		lastName: lastname,
		email,
		phone,
		reason,
		message,
	});
	let details;
	enquiry
		.save()
		.then((savedInfo) => {
			details = savedInfo;
			res.redirect('/contact');
			const mailToUser = {
				from: 'ak.prodigy24@gmail.com',
				to: savedInfo.email,
				subject: 'Your enquiry on Aperture',
				html: `Hey, ${savedInfo.firstName}!\n
				Thank you for writing to us on Aperture.
			`,
			};
			return transporter.sendMail(mailToUser, (error, result) => {
				if (error) console.log(error);
				console.log(result);
			});
		})
		.then((notifyAdmin) => {
			const email = {
				to: 'akshay@webfluence.dev',
				from: 'ak.prodigy24@gmail.com',
				subject: `New contact request from ${details.firstName} ${details.lastName}`,
				html: `You have received a new contact request with the following details:\n
				First Name: ${details.firstName}\n
				Last Name: ${details.lastName}\n
				Email: ${details.email}\n
				Phone: ${details.phone}\n
				Reason: ${details.reason}\n
				Message: ${details.message}\n
				`,
			};
			transporter.sendMail(email, (error, success) => {
				if (error) console.log(error);
				console.log(success);
			});
		})
		.catch((error) => {
			console.log(error);
		});
};

exports.displayIndex = (req, res) => {
	res.render('./index', {
		title: 'Welcome!',
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
		csrfToken: res.locals.csrfToken,
	});
};

exports.displayAbout = (req, res) => {
	res.render('./about', {
		title: 'About',
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
	});
};

exports.displayGallery = async (req, res) => {
	await Image.find()
		.populate('createdBy')
		.then((images) => {
			res.render('./gallery', {
				title: 'Gallery',
				user: res.locals.loggedInUser,
				isAuthenticated: res.locals.isAuthenticated,
				csrfToken: res.locals.csrfToken,
				images: images,
			});
		})
		.catch((error) => {
			console.log(error);
		});
};

exports.displayBlogs = (req, res) => {
	Blog.find().populate('author', 'username').then((blogs) => {
		blogs.forEach((blog) => {});
		res.render('./blogs', {
			title: 'Blogs/discussions',
			user: res.locals.loggedInUser,
			isAuthenticated: res.locals.isAuthenticated,
			csrfToken: res.locals.csrfToken,
			blogs: blogs,
		});
	});
};

exports.displayMembers = async (req, res) => {
	res.render('./members', {
		title: 'Members',
		user: res.locals.currentUser,
		count: await User.find().countDocuments(),
		users: await User.find(),
		isAuthenticated: res.locals.isAuthenticated,
		user: res.locals.loggedInUser,
	});
};

exports.displayContact = async (req, res) => {
	res.render('./contact', {
		title: 'Blogs/discussions',
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
		csrfToken: res.locals.csrfToken,
	});
};

exports.catchAll = (req, res) => {
	res.status(404).send('No such route! Redirecting to homepage within 5 seconds...');
};
