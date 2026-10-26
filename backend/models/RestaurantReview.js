
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RestaurantReview = sequelize.define("RestaurantReview", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
});

module.exports = RestaurantReview;
