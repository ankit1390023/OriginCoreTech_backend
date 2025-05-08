// models/UserDetail.js
module.exports = (sequelize, DataTypes) => {


  const UserDetail = sequelize.define("UserDetail", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
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
    
    currentLocation: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING, allowNull: false },

    userType: {
      type: DataTypes.STRING,
      allowNull: false
      
    },

    Standard: DataTypes.STRING,

    // Use string + validation instead of foreign key
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

    
    totalExperience: DataTypes.STRING,
    currentJobRole: DataTypes.STRING,
    currentCompany: DataTypes.STRING,
    salaryDetails: DataTypes.STRING,
    currentlyLookingFor: DataTypes.STRING,
    workMode: DataTypes.STRING,
  });

  UserDetail.associate = function (models) {
    UserDetail.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return UserDetail;
};
