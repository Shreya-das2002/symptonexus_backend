const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('doctor', {

    doctor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    first_name: DataTypes.STRING,

    middle_name: DataTypes.STRING,

    last_name: DataTypes.STRING,

    email: DataTypes.STRING,

    phone_no: DataTypes.STRING,

    status: {
        type: DataTypes.ENUM('Active', 'Pending', 'Inactive'),
        allowNull: false,
        defaultValue: 'Pending'
    },

    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    created_by: DataTypes.STRING

}, {
    tableName: 'doctors',
    timestamps: false
});

module.exports = Doctor;
