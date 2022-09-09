const express = require('express');
const router = express.Router();
const passport = require('passport')

const {register,login, getUsers,getUser,updateProfile,updateImage,changeRole,deleteAcc,googlelogin} = require('../controllers/user-controller.js');
const {verifyOTP, resendOTP} = require('../controllers/user-otp-verification-controller.js');
const {sendResetLink, resetPassword} = require('../controllers/password-controller.js');
const {authenticate, authorize} = require('../middlewares/auth.js');

router.post('/register',register);
router.post('/:id/verifyOTP',verifyOTP)
router.post('/:id/resendOTP',resendOTP)
router.post('/login',login);
router.post('/googlelogin',googlelogin);
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
    let {name, token} = res.req.user;
    console.log(res.req);
    // res.redirect(`http://localhost:8080/middleware?name=${name}&token=${token}`)
    res.redirect(`https://fynd-user-module.netlify.app/middleware?name=${name}&token=${token}`)
})

module.exports =  router;