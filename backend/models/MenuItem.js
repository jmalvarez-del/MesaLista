
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MenuItem = sequelize.define("MenuItem", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    ingredients: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    image: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = MenuItem;
