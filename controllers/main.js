exports.displayIndex = (req, res) => {
	res.render('./index', { title: 'Welcome!', user: res.locals.loggedInUser });
};

exports.displayAbout = (req, res) => {
	res.render('./about', { title: 'About', user: res.locals.loggedInUser });
};

exports.displayGallery = (req, res) => {
	res.render('./gallery', { title: 'Gallery', user: res.locals.currentloggedInUserUser });
};
