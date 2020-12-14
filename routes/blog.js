const express = require('express');
const controller = require('../controllers/blog');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/success', controller.saveBlog);
router.get('/add', auth, controller.createBlog);
router.post('/:id/comment', auth, controller.addUserComment);
router.get('/:id/delete', auth, controller.deleteBlog);
router.get('/:id/edit', controller.displayEditForm);
router.get('/:id', controller.displayBlog);

module.exports = router;
