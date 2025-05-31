module.exports = (sequelize, DataTypes) => {
  const UniversityDetail = sequelize.define("UniversityDetail", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    emailId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    collegeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    course: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    websiteLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    socialMediaLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailIdVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    adharVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });

  UniversityDetail.associate = function(models) {
    UniversityDetail.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return UniversityDetail;
};
