const User = require('../models/user');

exports.displayIndex = (req, res) => {
	console.log(res.locals.currentUser);
	res.render('./index', {
		title: 'Welcome!',
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
	});
};

exports.displayAbout = (req, res) => {
	res.render('./about', {
		title: 'About',
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
	});
};

exports.displayGallery = (req, res) => {
	res.render('./gallery', {
		title: 'Gallery',
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
	});
};

exports.displayBlogs = (req, res) => {
	res.render('./blogs', {
		title: 'Blogs/discussions',
		user: res.locals.loggedInUser,
		isAuthenticated: res.locals.isAuthenticated,
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
	});
};

exports.catchAll = (req, res) => {
	res.status(404).send('No such route! Redirecting to homepage within 5 seconds...');
};
