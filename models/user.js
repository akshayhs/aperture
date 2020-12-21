const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), 'Asia/Calcutta');

const Image = require('./image');
const Blog = require('./blog');
const BlogComment = require('./blogcomment');
const ImageComment = require('./imagecomment');

const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		username: {
			type: String,
			lowercase: true,
			required: true,
			unique: true,
		},
		avatar: {
			type: String,
			default: '../uploads/avatar/default.jpeg',
		},
		email: {
			type: String,
			lowercase: true,
			required: true,
			unique: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			first: { type: String, trim: true },
			last: { type: String, trim: true },
		},
		website: {
			type: String,
			trim: true,
		},
		biography: {
			type: String,
		},
		cameras: {
			type: String,
			trim: true,
		},
		lenses: {
			type: String,
			trim: true,
		},
		images: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
		blogs: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Blog',
			},
		],
	},
	{ timestamps: true }
);

userSchema.pre('remove', async (next) => {
	try {
		await Image.remove({ createdBy: this._id });
		await Blog.remove({ author: this._id });
		await BlogComment.remove({ author: this._id });
		await ImageComment.remove({ user: this._id });
		next();
	} catch (error) {
		console.log(error);
	}
});

module.exports = mongoose.model('User', userSchema);
