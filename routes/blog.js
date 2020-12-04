const express = require('express');
const controller = require('../controllers/blog');
const mainController = require('../controllers/main');

const router = express.Router();

router.get('/add', controller.createBlog);
router.get('/', mainController.displayBlogs);

module.exports = router;
