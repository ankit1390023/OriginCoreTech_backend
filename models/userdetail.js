module.exports = (sequelize, DataTypes) => {


  const UserDetail = sequelize.define("UserDetail", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: false },

    aadhaarNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    aadhaarCardFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAadhaarVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    currentLocation: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING, allowNull: false },

    userType: {
      type: DataTypes.STRING,
      allowNull: false

    },

    Standard: DataTypes.STRING,

    course: {
      type: DataTypes.STRING


    },
    specialization: {
      type: DataTypes.STRING

    },
    college: {
      type: DataTypes.STRING
    },
    startYear: DataTypes.STRING,
    endYear: DataTypes.STRING,
    jobLocation: { type: DataTypes.STRING },
    salaryDetails: DataTypes.STRING,
    currentlyLookingFor: DataTypes.STRING,
    workMode: DataTypes.STRING,

    aboutus: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    careerObjective: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resume: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isGstVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userprofilepic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    termsAndCondition: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, { tableName: 'userdetails', });

  UserDetail.associate = function (models) {
    UserDetail.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    UserDetail.hasMany(models.Experience, { foreignKey: 'userDetailId', as: 'experiences' });
  };

  return UserDetail;
};
