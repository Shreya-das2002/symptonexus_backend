const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("symptonexus", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false,

  dialectOptions: {
    connectTimeout: 60000
  },

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 5000,
    evict: 1000
  }
});

module.exports = sequelize;
