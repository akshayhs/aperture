const express = require('express');
const controller = require('../controllers/gallery');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/:id/critiques/:critiqueid', controller.deleteCritique);

router.get('/upload', auth, controller.displayUploadForm);
router.get('/categories/:category', controller.displayImagesByCategory);
router.get('/tags/:tag', controller.displayImagesByTags);
router.post('/:id/comment', controller.addUserComment);
router.patch('/:id/', controller.editImageDetails);
router.get('/:id/edit', controller.displayImageEditForm);
router.post('/:id', controller.deleteImage);
router.get('/:id', controller.displayImage);
router.post('/', controller.attemptUpload);

module.exports = router;
