const express = require('express');
const router = express.Router();
const AuthController = require('../controller/auth.js');
const requireAuthentication = require("../passport/index.js").authenticateUser

router.post('/signup', AuthController.signUp)
router.post('/login', AuthController.logIn)
router.post('/change-password', requireAuthentication, AuthController.changePassword)
router.get('/my-profile', requireAuthentication, AuthController.myProfile)
router.post('/edit-profile', requireAuthentication, AuthController.editProfile)
router.post('/file-upload', AuthController.fileUpload)
router.post('/otp-verify', AuthController.otpVerify)
router.post('/forget-password', AuthController.forgetPassword)
router.post('/resend-otp', AuthController.resendOtp)
router.post('/reset-passsword', AuthController.resetPasssword)

module.exports = router;