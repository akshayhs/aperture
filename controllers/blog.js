const Blog = require('../models/blog');
const User = require('../models/user');

/* CREATE */

exports.saveBlog = (req, res) => {
	const author = req.session.user;
	const title = req.body.title;
	const blog = new Blog({ title, author });
	let post;
	blog
		.save()
		.then((savedBlog) => {
			post = savedBlog;
			return User.findOne({ username: author });
		})
		.then((foundUser) => {
			if (!foundUser) {
				return res.redirect('/');
			}
			return foundUser._id.toString();
		})
		.then((savedPost) => {
			res.redirect('/blogs');
		})
		.catch((error) => {
			console.log(error);
		});
};

/* READ */

exports.createBlog = (req, res) => {
	res.status(200).render('./blog/add', {
		title: 'Add your blog',
		isAuthenticated: res.locals.isAuthenticated,
		user: res.locals.loggedInUser,
		csrfToken: res.locals.csrfToken,
	});
};

exports.displayBlog = (req, res) => {
	const id = req.params.id;
	Blog.findById({ _id: id }).then((blog) => {
		if (!blog) {
			return;
		}
		res.status(200).render('./blog/display', {
			title: `${blog.title}`,
			isAuthenticated: res.locals.isAuthenticated,
			user: res.locals.loggedInUser,
			blog: blog,
		});
	});
};

/* UPDATE */

/* DELETE */
exports.deleteBlog = (req, res) => {
	const id = req.params.id;
	Blog.findByIdAndDelete({ _id: id })
		.then((blog) => {
			if (!blog) {
				return;
			}
			res.status(200).redirect('/');
		})
		.catch((error) => {
			console.log(error);
		});
};
