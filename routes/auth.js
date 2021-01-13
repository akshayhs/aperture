const express = require('express');
const controller = require('../controllers/auth');

const router = express.Router();

router.post('/user/password/reset', controller.resetUserPassword);
router.get('/register', controller.displaySignup);
router.post('/register', controller.createAccount);
router.post('/login/succeeded', controller.authenticateUser);
router.get('/login', controller.displayLogin);
router.get('/logout', controller.attemptLogout);

module.exports = router;
