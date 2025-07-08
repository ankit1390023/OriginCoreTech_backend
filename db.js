const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('jobportal', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  define: {
    freezeTableName: true, // use model name as table name without pluralizing
  }
});

module.exports = sequelize;
