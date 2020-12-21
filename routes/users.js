const express = require('express');
const controller = require('../controllers/users');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/:username/images', controller.displayUserUploadedImages);
router.delete('/:username', auth, controller.deleteAccount);
router.patch('/:username/profile', auth, controller.saveUserDetails);
router.post('/:username/profile', auth, controller.completeUserProfile);
router.get('/:username/profile', auth, controller.displayProfile);
router.get('/:username/profile/complete', auth, controller.completeProfile);
router.get('/:username', controller.displayUserDetails);

module.exports = router;
