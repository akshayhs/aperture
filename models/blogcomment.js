const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
	{
		blogId: {
			type: Schema.Types.ObjectId,
			ref: 'Blog',
			required: true,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		text: {
			type: String,
			required: true,
			maxlength: 300,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
