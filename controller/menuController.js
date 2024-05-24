const sequelize = require('sequelize');
const db = require('../models');
const helper = require('../config/helper');

const User = db.users;
const Menu = db.menu;
const CartItems = db.cart_items;
const OrderDetails = db.order_details;

module.exports= {
    addMenuItems: async (req, res) => {
        try {
            const required = {
                id: req.user.id,
                item_url: req.body.item_url,
                item_name: req.body.item_name,
                item_discreption: req.body.item_discreption,
                item_price: req.body.item_price
            };
            const non_required = {};
            const requestedData = await helper.validateObject(required, non_required);

            const user = await User.findOne({where: {id: requestedData.id}})

            if(user.role == 0){
                return helper.error(res, "You are not Admin. Only Admin can Add new Menu Items")
            }

            const data = await Menu.create({
                item_url: requestedData.item_url,
                item_name: requestedData.item_name,
                item_discreption: requestedData.item_discreption,
                item_price: requestedData.item_price
            });
            return helper.success(res, "Creating New Item in Menu Successfully", data)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    homePage: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)
    
            const data = await Menu.findAll()
            return helper.success(res, "Fatching Menu Items Successfully", data)
    
        } catch (error) {
            return helper.error(res, error)
        }
    },

    getMenuItemsDetails: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id,
                item_id: req.query.item_id
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const item_details = await Menu.findOne({ where: { id: requestedData.item_id } });

            // if (!item_details) {
            //     return helper.error(res, 'Item Not exist');
            // }
            return helper.success(res, 'Getting Menu Item Details Successfully', item_details);

        } catch (error) {
            return helper.error(res, error)
        }
    },

    addToCart: async (req, res) => {
        try {
            const required = {
                menu_id: req.body.menu_id,
                quantity: req.body.quantity
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const get_price = await Menu.findOne({ where: { id: requestedData.menu_id } })
            
            const checkMenuId = await CartItems.findOne({ where: {user_id: req.user.id, menu_id: requestedData.menu_id } })

            if (!!checkMenuId) {
                checkMenuId.quantity = parseInt(checkMenuId.quantity) + parseInt(requestedData.quantity)
                checkMenuId.total_price = checkMenuId.quantity * get_price.item_price
                checkMenuId.save();
                return helper.success(res, 'Increase Quantity', checkMenuId)
            }

            const data = await CartItems.create({
                user_id: req.user.id,
                menu_id: requestedData.menu_id,
                quantity: requestedData.quantity,
                total_price: get_price.item_price * requestedData.quantity
            })
            return helper.success(res, "Adding Items Successfully to Cart", data)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    getCartPage: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const cart_data = await CartItems.findAll({ where: { user_id: requestedData.user_id } })
            return helper.success(res, 'Fatching Cart Items Successfully', cart_data)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    orderPlaced: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id,
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const cu_id = await CartItems.findAll({ where: { user_id: requestedData.user_id } })

            cu_id.forEach(async (product) => {
                await OrderDetails.create({
                    user_id: requestedData.user_id,
                    cart_item_id: product.id,
                    // status: 1,
                    total_price: product.total_price
                })

            });
            cu_id.forEach(async(deleteItems)=>{
                await CartItems.destroy({where: {user_id: requestedData.user_id}})
            })
            return helper.success(res, 'Orders Placed Successfully')

            // for (const element of cu_id) {
            //     // console.log(element)

            //     const order_details = await OrderDetails.create({
            //         user_id: requestedData.user_id,
            //         cart_item_id: cart_data_id,
            //         status: 1,
            //         total_price: cart_data_price
            //     })
            // }

        } catch (error) {
            return helper.error(res, error)
        }
    },

    orderDetails: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id,
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const order_data = await OrderDetails.findAll({ where: { user_id: requestedData.user_id } })

            return helper.success(res, 'Orders Details Getting Successfully', order_data)

        } catch (error) {
            return helper.error(res, error)
        }
    },
}