const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const imageCommentSchema = new Schema(
	{
		comment: {
			type: String,
			required: true,
		},
		imageId: {
			type: Schema.Types.ObjectId,
			ref: 'Image',
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Comment', imageCommentSchema);
