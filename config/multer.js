const multer = require('multer');
const { set } = require('./sendgrid');

const fileFilter = (req, file, cb) => {
	/* Accept images if mimetypes match */
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
		cb(null, true);
	} else {
		/* Reject any other files incoming through the stream */
		cb(null, false);
	}
};

const date = new Date();
const setFileDate = `${date.getDate()}${date.getMonth()}${date.getFullYear()}${date.getHours()}${date.getMinutes()}${date.getMilliseconds()}`;

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './uploads/images');
	},
	filename: (req, file, cb) => {
		cb(null, `${setFileDate}${req.session.user.username}${file.originalname}`);
	},
});

module.exports = multer({
	fileFilter: fileFilter,
	storage: fileStorage,
	limits: { files: 1, fileSize: 0.25 * 1024 * 1024 }, // 250MB
}).single('image');
