module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define("Assignment", {
     userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jobPostId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    message: DataTypes.TEXT,
    fileUpload: DataTypes.STRING, // store uploaded file name or path (pdf, odf, etc.)
    deadline: DataTypes.DATEONLY,
    name: DataTypes.STRING
  });

  Assignment.associate = (models) => {
    Assignment.belongsTo(models.Application, { foreignKey: 'applicationId' });
    Assignment.belongsTo(models.User, { foreignKey: 'userId' });
    Assignment.belongsTo(models.JobPost, { foreignKey: 'jobPostId' });
  };

  return Assignment;
};
