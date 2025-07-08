module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('Skill', {
    skill_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    domain_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Domains',
        key: 'domain_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    skill_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'skills',
    timestamps: false
  });

  Skill.associate = (models) => {
    Skill.belongsTo(models.Domain, {
      foreignKey: 'domain_id',
      as: 'domain'
    });
  };

  return Skill;
};
