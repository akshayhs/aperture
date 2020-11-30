const express = require('express');
const controller = require('../controllers/gallery');
const router = express.Router();

router.get('/add', controller.displayUpload);


module.exports = router;
