const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorDetail = sequelize.define("doctor_details", {
  doctor_detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  dob: DataTypes.DATE,
  gender: DataTypes.INTEGER,
  address_id: DataTypes.INTEGER,
  experience: DataTypes.INTEGER,
  licence_number: DataTypes.STRING,
  registration_number: DataTypes.STRING,
  sort_desc: DataTypes.STRING,
}, {
  timestamps: false,
});

module.exports = DoctorDetail;
