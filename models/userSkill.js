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
      type: DataTypes.STRING(500), // Changed from BLOB to STRING for file paths
      allowNull: true,
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

  UserSkill.associate = function (models) {
    UserSkill.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      onDelete: 'CASCADE',
    });
  };


  return UserSkill;
};
