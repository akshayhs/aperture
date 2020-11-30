const multer = require('multer');
const moment = require('moment-timezone');

const dateIndia = moment.tz(Date.now(), 'Asia/Calcutta');

const fileFilter = (req, file, cb) => {
	/* Accept images if mimetypes match */
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
		cb(null, true);
	} else {
		/* Reject any other files incoming through the stream */
		cb(null, false);
	}
};

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './uploads/images');
	},
	filename: (req, file, cb) => {
		cb(null, `${file.originalname}${dateIndia}`);
	},
});

module.exports = multer({ fileFilter: fileFilter, storage: fileStorage }).single('image');
