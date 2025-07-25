module.exports = (sequelize, DataTypes) => {
  const Domain = sequelize.define('Domain', {
    domain_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    domain_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'domains',
    timestamps: false
  });

  return Domain;
};
