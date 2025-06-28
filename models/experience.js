module.exports = (sequelize, DataTypes) => {
  const Experience = sequelize.define('Experience', {
    userDetailId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UserDetails',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    companyRecruiterProfileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'CompanyRecruiterProfiles',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    totalExperience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentJobRole: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentCompany: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'pending', // e.g., pending, approved, rejected
    },
  }, {
    timestamps: true,
  });

  Experience.associate = (models) => {
    Experience.belongsTo(models.UserDetail, { foreignKey: 'userDetailId', onDelete: 'CASCADE' });
    Experience.belongsTo(models.CompanyRecruiterProfile, { foreignKey: 'companyRecruiterProfileId', onDelete: 'SET NULL' });
  };

  return Experience;
};
