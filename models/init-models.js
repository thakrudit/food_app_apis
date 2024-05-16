var DataTypes = require("sequelize").DataTypes;
var _cart_items = require("./cart_items");
var _menu = require("./menu");
var _order_details = require("./order_details");
var _users = require("./users");

function initModels(sequelize) {
  var cart_items = _cart_items(sequelize, DataTypes);
  var menu = _menu(sequelize, DataTypes);
  var order_details = _order_details(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);


  return {
    cart_items,
    menu,
    order_details,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
