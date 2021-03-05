const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contactSchema = new Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		default: '',
	},
	email: {
		type: String,
		required: true,
		lowercase: true,
	},
	phone: {
		type: Number,
		required: true,
	},
	reason: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: true,
		maxlength: 300,
	},
	dateReceived: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = new mongoose.model('Enquiries', contactSchema);
