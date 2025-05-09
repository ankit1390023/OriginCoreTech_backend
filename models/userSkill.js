const { DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const UserSkill = sequelize.define('UserSkill', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    certificate_image: {
      type: DataTypes.BLOB('long'),
    },
    skill: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authority: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    tableName: 'user_skills',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // Define associations
  UserSkill.associate = function (models) {
    UserSkill.belongsTo(models.User, {
      foreignKey: 'userId',  // This refers to the userId in the UserSkill table
      targetKey: 'id', // This is the primary key in the User table
      onDelete: 'CASCADE',
    });
  };
  

  return UserSkill;
};
