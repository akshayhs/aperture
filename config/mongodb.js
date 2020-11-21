const mongoose = require('mongoose');

const connectToDb = async () => {
	try {
		const db = await mongoose.connect('mongodb://localhost:27017/aperture', {
			useNewUrlParser: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log(`MongoDB database now available on ${db.connection.host}`);
	} catch (error) {
		console.log(error);
	}
};

module.exports = connectToDb;
