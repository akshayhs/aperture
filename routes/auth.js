const express = require('express');
const controller = require('../controllers/auth');

const router = express.Router();

/* ========================
  PASSWORD RELATED
========================== */
router.patch('/user/password/reset/:token/confirm', controller.confirmUserPasswordReset); // Actual password recovery route
router.get('/user/password/reset/:token', controller.attemptUserPasswordReset); // Will be sent part of the email
router.post('/user/password/reset/', controller.resetUserPassword); // After user enters email
router.get('/user/password/reset', controller.displayPasswordResetForm);
/* =========================
  AUTH ROUTES
==========================*/
router.get('/register', controller.displaySignup);
router.post('/register', controller.createAccount);
router.post('/login/succeeded', controller.authenticateUser);
router.get('/login', controller.displayLogin);
router.post('/logout', controller.attemptLogout);

module.exports = router;
