exports.displayIndex = (req, res) => {
	res.render('./index', { title: 'Welcome!' });
};

exports.displayAbout = (req, res) => {
	res.render('./about', { title: 'About' });
};

exports.displayGallery = (req, res) => {
	res.render('./gallery', { title: 'Gallery' });
};

