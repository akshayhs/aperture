const bodyParser = require('body-parser');
require('dotenv').config();
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('./config/multer');

/* ROUTES */
const galleryRoutes = require('./routes/gallery');
const blogRoutes = require('./routes/blog');
const userRoutes = require('./routes/users');
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
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/gallery/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));
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
/* For flash messages */
app.use(flash());
/* For image uploads via multer */
app.use(multer);

/* LOCALS */
app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.loggedInUser = req.session.user;
	res.locals.csrfToken = req.csrfToken();
	next();
});

/* EXPRESS ROUTES */
app.use('/gallery', galleryRoutes);
app.use('/blogs', blogRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use(mainRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	db();
	console.log(`Node.js application now live on port ${port}`);
});
