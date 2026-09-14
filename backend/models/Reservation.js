const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Reservation = sequelize.define("Reservation", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    tableNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    time: {
        type: DataTypes.TIME,
        allowNull: false
    },

    numberOfPeople: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pendiente"
    }
});

module.exports = Reservation;
