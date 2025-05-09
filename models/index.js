const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const UserModel = require('./user');
const UserDetailModel = require('./userdetail');
const UserSkillModel = require('./userSkill');
const JobPostModel = require('./jobpost');

const User = UserModel(sequelize, DataTypes);
const UserDetail = UserDetailModel(sequelize, DataTypes);
const UserSkill = UserSkillModel(sequelize, DataTypes);
const JobPost = JobPostModel(sequelize, DataTypes);


// Setup associations
if (User.associate) User.associate({ UserDetail, UserSkill, JobPost });
if (UserDetail.associate) UserDetail.associate({ User });
if (UserSkill.associate) UserSkill.associate({ User });
if (JobPost.associate) JobPost.associate({ User });


module.exports = {
  sequelize,
  User,
  UserDetail,
  UserSkill,
  JobPost
};
