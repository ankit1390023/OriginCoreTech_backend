const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('job', 'root', '', {
  host: 'localhost',
  dialect: 'mysql', 
});

module.exports = sequelize;
