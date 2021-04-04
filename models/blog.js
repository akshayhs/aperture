const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Blog = new Schema(
	{
		image: {
			type: String,
		},
		public_id: {
			type: String,
		},
		caption: {
			type: String,
			maxlength: 155,
		},
		title: {
			type: String,
			required: true,
		},
		alt_text: {
			type: String,
			maxlength: 120,
			default: this.title,
		},
		abstract: {
			type: String,
			required: true,
			maxlength: 140,
		},
		description: {
			type: String,
			required: true,
			maxlength: 1500,
		},
		copyright: {
			type: Boolean,
			required: true,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		comments: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Comment',
			},
		],
	},
	{ timestamps: true }
);

Blog.pre('remove', async function (next) {
	try {
		mongoose.model('Comment').remove({ blogId: this._id });
		console.log(`Comments associated with ${this.title} were removed automatically using the remove hook.`);
		next();
	} catch (error) {
		console.log(error);
	}
});

module.exports = mongoose.model('Blog', Blog);
