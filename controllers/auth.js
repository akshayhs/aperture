exports.displayLogin = (req, res) => {
	res.render('./auth/login', { title: 'Login to your account' });
};

exports.displaySignup = (req, res) => {
	res.render('./auth/register', { title: 'Get started' });
};
