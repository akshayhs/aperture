const express = require('express');
const controller = require('../controllers/gallery');

const router = express.Router();


router.post('/', controller.attemptUpload);
module.exports = router;
