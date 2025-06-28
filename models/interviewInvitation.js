const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Application = require('./application');

const InterviewInvitation = sequelize.define('InterviewInvitation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  applicationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Application,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  interviewType: {
    type: DataTypes.ENUM('videocall', 'phone', 'in office'),
    allowNull: false,
  },
  interviewDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  interviewTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  videoLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'interview_invitations',
  timestamps: true,
});

InterviewInvitation.associate = (models) => {
  InterviewInvitation.belongsTo(models.Application, { foreignKey: 'applicationId' });
};

module.exports = InterviewInvitation;
