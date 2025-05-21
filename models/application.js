const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  jobPostId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  whyShouldWeHireYou: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  confirmAvailability: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  project: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  githubLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  portfolioLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
   status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'applications',
  timestamps: true,
});

Application.associate = (models) => {
  Application.belongsTo(models.JobPost, { foreignKey: 'jobPostId' });
  Application.hasMany(models.InterviewInvitation, { foreignKey: 'applicationId' });
};

module.exports = Application;
