const multer = require('multer');
const path = require('path');

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
		cb(null, path.join('public', 'uploads'));
	},
	filename: (req, file, cb) => {
		cb(null, `${setFileDate}_${file.originalname.replace(' ', '_')}`);
	},
});

module.exports = multer({
	fileFilter: fileFilter,
	storage: fileStorage,
	limits: { files: 1, fileSize: 0.25 * 1024 * 1024 }, // 250MB
}).single('image');
