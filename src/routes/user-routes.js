const express = require('express');
const router = express.Router();

const {register,login} = require('../controllers/user-controller.js');
const {verifyOTP} = require('../controllers/user-otp-verification-controller.js');

router.post('/register',register);
router.post('/:id/verifyOTP',verifyOTP)
router.post('/login',login);

module.exports =  router;