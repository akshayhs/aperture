const express = require('express');
const controller = require('../controllers/main');

const router = express.Router();

router.get('/blogs', controller.displayBlogs);
router.get('/members', controller.displayMembers);
router.get('/gallery', controller.displayGallery);
router.get('/about', controller.displayAbout);
router.get('/contact', controller.displayContact);
router.get('/', controller.displayIndex);
router.get('*', controller.catchAll);

module.exports = router;
