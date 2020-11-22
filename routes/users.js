const express = require('express');
const controller = require('../controllers/users');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:username/profile', auth, controller.displayProfile);

module.exports = router;
