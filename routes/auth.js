const express = require('express');
const controller = require('../controllers/auth');

const router = express.Router();

router.get('/user/password/reset/:token', controller.attemptUserPasswordReset);
router.post('/user/password/reset/', controller.resetUserPassword);
router.get('/user/password/reset', controller.displayPasswordResetForm);
router.get('/register', controller.displaySignup);
router.post('/register', controller.createAccount);
router.post('/login/succeeded', controller.authenticateUser);
router.get('/login', controller.displayLogin);
router.get('/logout', controller.attemptLogout);

module.exports = router;
