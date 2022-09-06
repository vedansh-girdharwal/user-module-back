const express = require('express');
const router = express.Router();

const {register,login, getUsers,getUser,updateProfile,updateImage,changeRole} = require('../controllers/user-controller.js');
const {verifyOTP, resendOTP} = require('../controllers/user-otp-verification-controller.js');
const {sendResetLink, resetPassword} = require('../controllers/password-controller.js');
const {authenticate, authorize} = require('../middlewares/auth.js');

router.post('/register',register);
router.post('/:id/verifyOTP',verifyOTP)
router.post('/:id/resendOTP',resendOTP)
router.post('/login',login);
router.post('/forgotPassword',sendResetLink);
router.post('/:id/resetPassword',resetPassword);
router.get('/user',authenticate, getUser);
router.get('/users',authenticate, authorize(['admin']),getUsers);
router.patch('/:id/updateProfile',updateProfile);
router.patch('/:id/updateImage',updateImage);
router.patch('/changeRole/:id',authenticate, authorize(['admin']),changeRole);

module.exports =  router;