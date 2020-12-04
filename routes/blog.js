const express = require('express');
const controller = require('../controllers/blog');

const router = express.Router();

router.post('/success', controller.saveBlog);
router.get('/add', controller.createBlog);
router.get('/:id/delete', controller.deleteBlog);
router.get('/:id', controller.displayBlog);

module.exports = router;
