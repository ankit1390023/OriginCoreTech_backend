const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserSkill = sequelize.define('UserSkill', {
    userId: {
      type: DataTypes.INTEGER,

      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    skill_id: {
      type: DataTypes.INTEGER,
      
  
    },
    certificate_image: {
      type: DataTypes.BLOB('long'),
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

  // Association
  // UserSkill.associate = function (models) {
  //   UserSkill.belongsTo(models.User, {
  //     foreignKey: 'userId',
  //     onDelete: 'CASCADE',
  //   });
  // };

  return UserSkill;
};
