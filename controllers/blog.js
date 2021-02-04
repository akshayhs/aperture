const fs = require('fs'); // Required for .unlink()
const cloudinary = require('../config/cloudinary');

const Blog = require('../models/blog');
const User = require('../models/user');
const Comment = require('../models/blogcomment');
const BlogComment = require('../models/blogcomment');

/* CREATE */

exports.saveBlog = (req, res) => {
	const author = req.session.user;
	const image = req.file;
	const { caption, alt_text, title, copyright, abstract, description, shorts } = req.body;
	console.log(req.file);
	console.log(req.body);
	/* Reject the upload if the author does not check the copyright box */
	if (copyright != 'on') {
		req.flash('copyrightError', 'Please check the copyright checkbox to complete uploading your blog');
		return res.status(422).redirect('/blogs/add');
	}
	if (!image) image = '';
	if (alt_text.length === 0) alt_text = null;
	if (caption.length === 0) caption = null;
	const imageTitle = title.replace(' ', '_');
	/* Upload the file to cloudinary */
	cloudinary.uploader.upload(
		image.path,
		{
			public_id: `projects/aperture/images/blogs/${imageTitle}`,
			resource_type: 'image',
			unique_filename: true,
			discard_original_filename: true,
		},
		(error, result) => {
			if (error) console.log(error);
			console.log(result);
			const blog = new Blog({
				image: result.url,
				public_id: result.public_id,
				caption,
				title,
				alt_text,
				abstract,
				description,
				copyright: true,
				author: author._id,
			});
			blog
				.save()
				.then((blog) => {
					return User.findByIdAndUpdate({ _id: author._id }, { $set: { blogs: blog._id } }, { new: true });
				})
				.then(() => {
					fs.unlink(image.path, (error) => {
						if (error) console.log(error);
						res.status(201).redirect('/blogs');
					});
				})
				.catch((error) => {
					console.log(error);
				});
		}
	);
};

exports.addUserComment = (req, res) => {
	const id = req.params.id;
	const user = res.locals.loggedInUser;
	const text = req.body.comment;
	const comment = new Comment({ blogId: id, author: user, text });
	comment
		.save()
		.then((savedComment) => {
			console.log(savedComment);
			return Blog.findByIdAndUpdate({ _id: id }, { $push: { comments: savedComment._id } });
		})
		.then(() => {
			res.redirect(`/blogs/${id}`);
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

exports.displayBlog = async (req, res) => {
	let commentDeleteMessage = req.flash('deleteCommentSuccess');
	let commentUpdateMessage = req.flash('commentEditSuccess');
	if (commentUpdateMessage.length === 0) commentUpdateMessage = null;
	if (commentDeleteMessage.length === 0) commentDeleteMessage = null;
	try {
		const blog = await Blog.findById({ _id: req.params.id })
			.populate({ path: 'author', model: User })
			.populate({ path: 'comments', model: Comment })
			.populate({ path: 'comments', populate: { path: 'author', model: User } });
		res.render('./blog/display', {
			title: `${blog.title}`,
			isAuthenticated: res.locals.isAuthenticated,
			user: res.locals.loggedInUser,
			blog: blog,
			comments: blog.comments,
			author: blog.author,
			updateSuccess: commentUpdateMessage,
			deleteSuccess: commentDeleteMessage,
		});
	} catch (error) {
		console.log(error);
	}
};

exports.displayEditForm = (req, res) => {
	const id = req.params.id;
	Blog.findById({ _id: id }).then((blog) => {
		res.status(200).render('./blog/edit', {
			title: 'Edit your blog',
			csrfToken: res.locals.csrfToken,
			isAuthenticated: res.locals.isAuthenticated,
			user: res.locals.loggedInUser,
			blog: blog,
		});
	});
};

/* UPDATE */
exports.editBlog = (req, res) => {
	const id = req.params.id;
	const { title, abstract, description } = req.body;
	Blog.findByIdAndUpdate(
		{ _id: id },
		{ $set: { title, abstract, description } },
		{ new: true }
	).then((updatedBlog) => {
		console.log(updatedBlog);
		res.redirect(`/blogs/${id}`);
	});
};

exports.editUserComment = async (req, res) => {
	const { id, commentId } = req.params;
	const { updatedcomment } = req.body;
	try {
		await BlogComment.findByIdAndUpdate(
			{ _id: commentId, blogId: id },
			{ $set: { text: updatedcomment } },
			{ new: true }
		);
		req.flash('commentEditSuccess', 'Your comment was updated successfully.');
		res.status(201).redirect(`/blogs/${id}`);
	} catch (error) {
		console.log(error);
	}
};

/* DELETE */
exports.deleteBlog = async (req, res) => {
	const user = req.session.user;
	const id = req.params.id;
	try {
		const blog = await Blog.findByIdAndDelete({ _id: id });
		cloudinary.uploader.destroy(
			blog.public_id,
			{
				resource_type: 'image',
				invalidate: true,
			},
			(error, result) => {
				if (error) console.log(error);
				console.log(result);
			}
		);
		await User.findOneAndUpdate({ _id: user._id }, { $pull: { blogs: blog._id } }, { new: true });
		req.flash(
			'deleteSuccess',
			'The blog you previously posted has been successfully deleted. It is no longer accessible by anyone.'
		);
		return res.redirect('/blogs');
	} catch (error) {
		console.log(error);
	}
};

exports.deleteBlogComment = async (req, res) => {
	const { commentId, id } = req.params;
	try {
		await Comment.findByIdAndDelete({ _id: commentId });
		req.flash('deleteCommentSuccess', 'Your comment was deleted successfully.');
		return res.redirect(`/blogs/${id}`);
	} catch (error) {
		console.log(error);
	}
};
