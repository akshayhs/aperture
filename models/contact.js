const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), 'Asia/Calcutta');

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
		default: dateIndia,
	},
});

module.exports = new mongoose.model('Enquiries', contactSchema);
