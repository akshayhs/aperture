const express = require('express');
const controller = require('../controllers/auth');

const router = express.Router();

router.get('/register', controller.displaySignup);
router.get('/login', controller.displayLogin);

module.exports = router;
