const multer = require('../config/multer');
const Image = require('../models/image');
const User = require('../models/user');

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
