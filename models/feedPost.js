module.exports = (sequelize, DataTypes) => {
  const FeedPost = sequelize.define('FeedPost', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userRole: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    commentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    comments: {
      type: DataTypes.TEXT, // Will store JSON stringified array of comments
      allowNull: true,
      defaultValue: '[]',
    },
    
  }, {
    timestamps: true,
  });

  FeedPost.associate = function(models) {
    FeedPost.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return FeedPost;
};
