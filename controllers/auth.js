exports.displayLogin = (req, res) => {
	res.render('./auth/login', { title: 'Login to your account' });
};
