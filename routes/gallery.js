const express = require('express');
const controller = require('../controllers/gallery');

const router = express.Router();

router.get('/upload', controller.displayUploadForm);
router.post('/', controller.attemptUpload);
module.exports = router;
