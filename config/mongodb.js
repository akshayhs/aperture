const mongoose = require('mongoose');
const mongo_uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env
	.MONGO_USER_PWD}@aperture.wnhi2.mongodb.net/${process.env.MONGO_DBNAME}?retryWrites=true&w=majority`;
	
const connectToDb = async () => {
	try {
		const db = await mongoose.connect(mongo_uri, {
			useNewUrlParser: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log(`MongoDB database now available on ${db.connection.host}`);
	} catch (error) {
		throw Error(error);
	}
};

module.exports = connectToDb;
