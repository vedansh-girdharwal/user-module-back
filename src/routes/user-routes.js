const express = require('express');
const router = express.Router();
const passport = require('passport')

const {register,login, getUsers,getUser,updateProfile,updateImage,changeRole,deleteAcc} = require('../controllers/user-controller.js');
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
router.patch('/:id/updateProfile',authenticate,updateProfile);
router.patch('/:id/updateImage',authenticate,updateImage);
router.patch('/:id/changeRole',authenticate, authorize(['admin']),changeRole);
router.delete('/:id/deleteUser',authenticate,deleteAcc);
router.get('/google',passport.authenticate('google',{scope:['profile', 'email'],session:false}));
router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/',session:false}),function (req,res){
    let {name, token,role} = res.req.user;
    res.redirect(`${process.env.FRONTEND_URL}/middleware?name=${name}&token=${token}&role=${role}`)
})

module.exports =  router;