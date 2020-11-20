const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');

/* ROUTES */
const mainRoutes = require('./routes/main');

/* Databse connection */
const db = require('./config/mongodb');

/* MongoDB store */
const MongoStore = require('connect-mongodb-session')(session);

const store = new MongoStore({
	uri: 'mongodb://localhost:27017',
	collection: 'sessions',
});

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(
	session({
		secret: 'TheQuickBrownFoxJumpsOverTheLazyDog',
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

/* EXPRESS ROUTES */
app.use(mainRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	db();
	console.log(`Node.js application now live on port ${port}`);
});
