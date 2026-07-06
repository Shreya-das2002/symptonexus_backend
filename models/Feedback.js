const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const Feedback = sequelize.define('feedback', {

}, {
  tableName: 'feedbacks',
  timestamps: false
});

module.exports = Feedback;