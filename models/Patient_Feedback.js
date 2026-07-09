const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const PatientFeedback = sequelize.define('patient_feedback', {
    patient_feedback_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    booking: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

    doc_communication: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    doc_professionalism: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    waiting: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    quality: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    staff: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },  

    ai_accuracy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    website: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    recommendation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },

  consultation: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },

    desc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
}, {
  tableName: 'patient_feedbacks',
  timestamps: false
});

module.exports = PatientFeedback;