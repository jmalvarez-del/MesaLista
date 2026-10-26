
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Dish = sequelize.define("Dish", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Dish;
