const express = require('express');
const controller = require('../controllers/auth');

const router = express.Router();

router.get('/register', controller.displaySignup);
router.post('/register', controller.createAccount);
router.post('/login/auth', controller.authenticateUser);
router.get('/login', controller.displayLogin);

module.exports = router;
