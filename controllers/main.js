const User = require('../models/user');

exports.displayIndex = (req, res) => {
	console.log(res.locals.currentUser)
	res.render('./index', { title: 'Welcome!', user: res.locals.currentUser });
};

exports.displayAbout = (req, res) => {
	res.render('./about', { title: 'About', user: res.locals.currentUser });
};

exports.displayGallery = (req, res) => {
	res.render('./gallery', { title: 'Gallery', user: res.locals.currentUser });
};

exports.displayMembers = async (req, res) => {
	res.render('./members', {
		title: 'Members',
		user: res.locals.currentUser,
		count: await User.find().countDocuments(),
		users: await User.find(),
	});
};
