const express = require('express');
const router = express.Router();
const AuthController = require('../controller/menuController.js');
const requireAuthentication = require("../passport/index.js").authenticateUser

router.post('/add-menu-items',requireAuthentication, AuthController.addMenuItems)
router.get('/home-page', requireAuthentication, AuthController.homePage)
router.get('/get-menu-items-detailes',requireAuthentication, AuthController.getMenuItemsDetails)
router.post('/add-to-cart', requireAuthentication, AuthController.addToCart)
router.get('/get-cart-page', requireAuthentication, AuthController.getCartPage)
router.post('/order-placed', requireAuthentication, AuthController.orderPlaced)
router.get('/get-order-details', requireAuthentication, AuthController.orderDetails)

module.exports = router;