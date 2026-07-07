const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const Feedback = sequelize.define('feedback', {
    feedback_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    booking: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

    ai_accuracy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // Doctor 

    management: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    p_info: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

    user_experience: {
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

    desc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
}, {
  tableName: 'feedbacks',
  timestamps: false
});

module.exports = Feedback;