const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
   
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: { type: DataTypes.STRING, allowNull: false },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userRole: {
      type: DataTypes.ENUM('STUDENT', 'COMPANY', 'UNIVERSITY'),
      defaultValue: 'STUDENT',
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1 means profile incomplete, 0 means complete
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  //  Add instance method for password comparison
  User.prototype.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = function (models) {
    User.hasOne(models.UserDetail, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
    User.hasOne(models.UniversityDetail, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
    User.hasMany(models.UserSkill, {
      foreignKey: 'userId', 
      sourceKey: 'id', 
      onDelete: 'CASCADE',
    });

    User.hasMany(models.JobPost, { foreignKey: 'userId' });

    // Add association to CompanyRecruiterProfile
    User.hasOne(models.CompanyRecruiterProfile, { foreignKey: 'userId' });

    User.hasMany(models.FeedPost, { foreignKey: 'userId', onDelete: 'CASCADE' });

      User.belongsToMany(models.User, {
    through: models.Follow,
    as: 'Followers',
    foreignKey: 'followedId',
    otherKey: 'followerId'
  });
  User.belongsToMany(models.User, {
    through: models.Follow,
    as: 'Following',
    foreignKey: 'followerId',
    otherKey: 'followedId'
  });


  };
    



  return User;
};
