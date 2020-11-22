const express = require('express');
const controller = require('../controllers/main');

const router = express.Router();

router.get('/blogs', controller.displayBlogs);
router.get('/members', controller.displayMembers);
router.get('/gallery', controller.displayGallery);
router.get('/about', controller.displayAbout);
router.get('/', controller.displayIndex);

module.exports = router;
