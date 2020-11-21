const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');
const csrf = require('csurf');

/* ROUTES */
const authRoutes = require('./routes/auth');
const mainRoutes = require('./routes/main');

/* Databse connection */
const db = require('./config/mongodb');

/* MongoDB store */
const MongoStore = require('connect-mongodb-session')(session);

const store = new MongoStore({
	uri: 'mongodb://localhost:27017/aperture',
	collection: 'sessions',
});

/* For CSRF protection */
const csrfToken = csrf();

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
/* CSRF token */
app.use(csrfToken);

/* LOCALS */
app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.loggedInUser = req.session.user;
	res.locals.csrfToken = req.csrfToken();
	next();
});

/* EXPRESS ROUTES */
app.use('/auth', authRoutes);
app.use(mainRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	db();
	console.log(`Node.js application now live on port ${port}`);
});
