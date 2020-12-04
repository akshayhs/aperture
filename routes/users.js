const express = require('express');
const controller = require('../controllers/users');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/:username/profile', auth, controller.saveUserProfile);
router.get('/:username/profile', auth, controller.displayProfile);
router.get('/:username/profile/complete', auth, controller.completeProfile);
router.get('/:username', controller.displayUserDetails);

module.exports = router;
