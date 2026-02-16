const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Appointment = sequelize.define("appointment", {

  appointment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  booking_time: {
    type: DataTypes.TIME,
    allowNull: false
  },

  description: {
    type: DataTypes.STRING(500)
  },

  document_id: {
    type: DataTypes.INTEGER
  },

  booking_status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  created_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  created_by: {
    type: DataTypes.STRING
  }

}, {
  tableName: "appointment",
  timestamps: false
});

module.exports = Appointment;
