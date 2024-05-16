const sequelize = require('sequelize');
const db = require('../models');
const helper = require('../config/helper');
const bcrypt = require("bcryptjs");
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');

const User = db.users;

module.exports = {
    signUp: async (req, res) => {
        try {
            const required = {
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
            }
            const non_required = {};
            const requestedData = await helper.validateObject(required, non_required);

            const existingUser = await User.findOne({ where: { email: requestedData.email } });
            if (!!existingUser) {
                return helper.error(res, "Email Already Exist");
            }

            // Hashing Password
            const salt = 10;
            const hashPassword = await bcrypt.hash(requestedData.password, salt);
            let otp = randomstring.generate({ length: 6, charset: 'numeric' });

            const user = await User.create({
                email: requestedData.email,
                username: requestedData.username,
                password: hashPassword,
                otp: otp
            });

            // Creating JWT Token
            const credentials = { id: user.id, email: user.email }
            const token = jwt.sign({ data: credentials }, process.env.JWT_SECRET);

            const body = {
                user: user,
                token: token
            }

            return helper.success(res, 'SignUp Successfully', body)
        } catch (error) {
            return helper.error(res, error);
        }
    },

    logIn: async (req, res) => {
        try {
            const required = {
                email: req.body.email,
                password: req.body.password
            }
            const non_required = {};
            const requestedData = await helper.validateObject(required, non_required);

            const user = await User.findOne({ where: { email: requestedData.email } });
            if (!user) {
                return helper.error(res, 'Invalid Email');
            }

            const compPassword = await bcrypt.compare(requestedData.password, user.password);
            if (!compPassword) {
                return helper.error(res, 'Incorrect Password');
            }
            
            let otp = randomstring.generate({ length: 6, charset: 'numeric' });
            if(user.is_verified === 0){
                user.otp = otp
                user.save();
            }

            const payload = { id: user.id, email: user.email }
            const token = jwt.sign({ data: payload }, process.env.JWT_SECRET);

            const body = {
                token: token,
                user: user,
            }
            return helper.success(res, 'LogIn Successfully ', body);
        } catch (error) {
            return helper.error(res, error);
        }
    },

    changePassword: async (req, res) => {
        try {
            const required = {
                id: req.user.id,
                old_password: req.body.old_password,
                new_password: req.body.new_password
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const user = await User.findOne({ where: { id: requestedData.id } })
            // if (!user) {
            //     return helper.error(res, 'User not Found')
            // }

            const compPassword = await bcrypt.compare(requestedData.old_password, user.password)
            if (!compPassword) {
                return helper.error(res, "Old Password does't match")
            }
            const salt = 10;
            const hashPassword = await bcrypt.hash(requestedData.new_password, salt)
            const compNewPassword = await bcrypt.compare(requestedData.new_password, user.password)
            if(compNewPassword){
                return helper.error(res, "New Password is same as Old Password")
            }

            user.password = hashPassword;
            user.save();
            return helper.success(res, 'Password Changed Successfully')


        } catch (error) {
            return helper.error(res, error)
        }
    },

    myProfile: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const user = await User.findOne({ where: { id: requestedData.user_id } })
            // if (!user) {
            //     return helper.error(res, 'User can not match');
            // }
            return helper.success(res, "Getting User Profile Successfully", user)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    editProfile: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id
            }
            const non_required = {
                new_email: req.body.new_email,
                new_username: req.body.new_username
            }
            const requestedData = await helper.validateObject(required, non_required)

            const user = await User.findOne({ where: { id: requestedData.user_id } })
            // if (!user) {
            //     return helper.error(res, "User not Found")
            // }

            const existingEmail = await User.findOne({ where: { email: requestedData.new_email } })
            if (existingEmail) {
                return helper.error(res, "Email Already Exist");
            }

            user.email = requestedData.new_email
            user.username = requestedData.new_username
            user.save();
            return helper.success(res, "Profile Details Changed Successfully", user)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    fileUpload: async (req, res) => {
        try {
            const required = {
                attatchment: req.files.image
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            // const attatchment = req.files.image;
            const file_name = requestedData.attatchment.name;
            const file_extension = file_name.split(".")[1];
            let result = randomstring.generate(10) + "." + file_extension;

            requestedData.attatchment.mv(process.cwd() + `/public/uploads/${result}`, function (err) {
                if (err) throw err
            });

            const name = "localhost:4321/uploads/" + result;
            return helper.success(res, "File Uploaded Successfully", name);

        } catch (error) {
            return helper.error(res, error)
        }
    },

    otpVerify: async (req, res) => {
        try {
          const required = {
            email: req.body.email,
            otp: req.body.otp
          }
          const non_required = {}
          const requestedData = await helper.validateObject(required, non_required);
    
          const user = await User.findOne({ where: { email: requestedData.email } })
          if (!user) {
            return helper.error(res, 'Email not found')
          }
    
          if (user.otp != requestedData.otp) {
            return helper.error(res, 'Incorrect OTP')
          }
          user.is_verified = 1
          user.save();
          return helper.success(res, "OTP Verified")
    
        } catch (err) {
          return helper.error(res, err)
        }
      },

      forgetPassword: async (req, res) => {
        try {
          const required = {
            email: req.body.email,
          }
          const non_required = {}
          const requestedData = await helper.validateObject(required, non_required);
    
          const user = await User.findOne({ where: { email: requestedData.email } })
          if (!user) {
            return helper.error(res, 'Email not found')
          }
          let otp = randomstring.generate({ length: 6, charset: 'numeric' });
          user.is_verified = 0
          user.otp = otp
          user.save();
    
          return helper.success(res, "Otp send successfully")
        } catch (error) {
          return helper.error(res, err)
        }
      },
    
      resendOtp: async (req, res) => {
        try {
          const required = {
            email: req.body.email,
          }
          const non_required = {}
          const requestedData = await helper.validateObject(required, non_required);
    
          const user = await User.findOne({ where: { email: requestedData.email } })
          if (!user) {
            return helper.error(res, 'Email not found')
          }
    
          let otp = randomstring.generate({ length: 6, charset: 'numeric' });
          user.otp = otp
          user.save();
          return helper.success(res, 'Otp Resent')
    
        } catch (error) {
          return helper.error(res, error)
        }
      },
    
      resetPasssword: async (req, res) => {
        try {
          const required = {
            email: req.body.email,
            new_password: req.body.new_password
          }
          const non_required = {}
          const requestedData = await helper.validateObject(required, non_required);
    
          const user = await User.findOne({ where: { email: requestedData.email } })
          if (!user) {
            return helper.error(res, 'Email not found')
          }
    
          const salt = 10;
          const hashPassword = await bcrypt.hash(requestedData.new_password, salt)
    
          user.password = hashPassword
          user.save();
          return helper.success(res, 'Password Reset Successfully')
        } catch (error) {
          return helper.error(res, error)
        }
    
      },

};