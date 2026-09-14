const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Table = sequelize.define("Table", {
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Table;