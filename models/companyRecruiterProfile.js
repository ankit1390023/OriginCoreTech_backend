module.exports = (sequelize, DataTypes) => {
  const CompanyRecruiterProfile = sequelize.define('CompanyRecruiterProfile', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    recruiterName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    recruiterEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    recruiterPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hiringPreferences: {
      type: DataTypes.STRING,
      allowNull: true
    },
    languagesKnown: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isGstVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  CompanyRecruiterProfile.associate = (models) => {
    CompanyRecruiterProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    CompanyRecruiterProfile.hasMany(models.JobPost, { foreignKey: 'companyRecruiterProfileId', as: 'jobPosts' });
    CompanyRecruiterProfile.hasMany(models.Experience, { foreignKey: 'companyRecruiterProfileId', as: 'experiences' });
  };

  return CompanyRecruiterProfile;
};
