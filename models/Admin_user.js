const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminUser = sequelize.define('admin_user', {
  admin_user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: DataTypes.STRING,
  middle_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: { type: DataTypes.STRING,field: 'email'},
  phone_no: DataTypes.STRING,
  status: { type: DataTypes.ENUM('Active','Inactive'), defaultValue: 'Active' },
  created_on: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  created_by: DataTypes.STRING
}, {
  timestamps: false
});

module.exports = AdminUser;
