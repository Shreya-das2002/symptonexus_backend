const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const DoctorFeedback = sequelize.define('doctor_feedback', {
    doctor_feedback_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    website: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    management: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    p_info: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    system_performance: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    support_service: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    p_cooperation: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    staff: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },  

    recommendation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },

    desc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
}, {
  tableName: 'doctor_feedbacks',
  timestamps: false
});

module.exports = DoctorFeedback;