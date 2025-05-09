const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const UserModel = require('./user');
const UserDetailModel = require('./userdetail');
const UserSkillModel = require('./userSkill');

const User = UserModel(sequelize, DataTypes);
const UserDetail = UserDetailModel(sequelize, DataTypes);
const UserSkill = UserSkillModel(sequelize, DataTypes);


// Setup associations
if (User.associate) User.associate({ UserDetail, UserSkill });
if (UserDetail.associate) UserDetail.associate({ User});
 if (UserSkill.associate) UserSkill.associate({ User });

module.exports = {
  sequelize,
  User,
  UserDetail,
  UserSkill
};
