const mongoose = require('mongoose');
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
			default:
				'https://res.cloudinary.com/webfluence/image/upload/v1612030904/projects/aperture/images/avatar/default.svg',
		},
		public_id: {
			type: String,
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
			maxlength: 500,
		},
		cameras: [
			{
				type: String,
				trim: true,
			},
		],
		lenses: {
			type: Array,
			trim: true,
		},
		images: {
			type: Array,
			trim: true,
		},
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
