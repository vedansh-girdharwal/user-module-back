const express = require('express');
const router = express.Router();

const {register,login} = require('../controllers/user-controller.js');
const {verifyOTP, resendOTP} = require('../controllers/user-otp-verification-controller.js');
const {sendResetLink, resetPassword} = require('../controllers/password-controller.js');

router.post('/register',register);
router.post('/:id/verifyOTP',verifyOTP)
router.post('/:id/resendOTP',resendOTP)
router.post('/login',login);
router.post('/forgotPassword',sendResetLink);
router.post('/:id/resetPassword',resetPassword)

module.exports =  router;