const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorExperience = sequelize.define("doctor_experiences", {
  doctor_experience_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  organization_name: DataTypes.STRING,
  key_experience: DataTypes.STRING,
  experience_desc: DataTypes.TEXT,
}, {
  timestamps: false,
});

module.exports = DoctorExperience;
