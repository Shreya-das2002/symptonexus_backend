const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('symptonexus', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
