const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
    type: DataTypes.STRING,
    allowNull: false
},
role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "usuario"
}
});

module.exports = User;
