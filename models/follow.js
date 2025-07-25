module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define('Follow', {
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE'
    },
    followedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'follows',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['followerId', 'followedId']
      }
    ]
  });

  Follow.associate = function (models) {
    Follow.belongsTo(models.User, { foreignKey: 'followerId', as: 'Follower' });
    Follow.belongsTo(models.User, { foreignKey: 'followedId', as: 'Followed' });
  };

  return Follow;
};
