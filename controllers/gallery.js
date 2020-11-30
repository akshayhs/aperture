exports.displayUpload = (req, res) => {
	res.status(200).render('./image/add', {
		title: 'Add your image',
		isAuthenticated: res.locals.isAuthenticated,
		csrfToken: res.locals.csrfToken,
		user: res.locals.loggedInUser,
	});
};

