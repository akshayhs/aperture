const express = require('express');
const controller = require('../controllers/gallery');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:id', controller.displayImage);
router.get('/upload', auth, controller.displayUploadForm);
router.post('/', controller.attemptUpload);

module.exports = router;
