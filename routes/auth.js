const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:id', authController.verifyEmail);
router.post('/password-reset-request', authController.passwordResetRequest);
router.post('/password-reset', authController.passwordReset);

module.exports = router;
