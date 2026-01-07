const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserRoleMapping = sequelize.define("user_role_mapping", {
user_role_mapping_id: 
    { type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true }, 
    
    status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Active"
}

}, { timestamps: false });

module.exports = UserRoleMapping;
