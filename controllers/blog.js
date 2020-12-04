exports.createBlog = (req, res) => {
	res.render('./blog/add', {
		title: 'Ad your blog',
		user: res.locals.loggedInUser,
		csrfToken: res.locals.csrfToken,
		isAuthenticated: res.locals.isAuthenticated,
	});
};
