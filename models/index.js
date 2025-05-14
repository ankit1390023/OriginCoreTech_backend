const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const UserModel = require('./user');
const UserDetailModel = require('./userdetail');
const UserSkillModel = require('./userSkill');
const JobPostModel = require('./jobpost');
const CompanyRecruiterProfileModel = require('./companyRecruiterProfile');
const Application = require('./application');

const User = UserModel(sequelize, DataTypes);
const UserDetail = UserDetailModel(sequelize, DataTypes);
const UserSkill = UserSkillModel(sequelize, DataTypes);
const JobPost = JobPostModel(sequelize, DataTypes);
const CompanyRecruiterProfile = CompanyRecruiterProfileModel(sequelize, DataTypes);

// Setup associations
if (User.associate) User.associate({ UserDetail, UserSkill, JobPost, CompanyRecruiterProfile, Application });
if (UserDetail.associate) UserDetail.associate({ User });
if (UserSkill.associate) UserSkill.associate({ User });
if (JobPost.associate) JobPost.associate({ User, CompanyRecruiterProfile, Application });
if (CompanyRecruiterProfile.associate) CompanyRecruiterProfile.associate({ User });
if (Application.associate) Application.associate({ JobPost });

module.exports = {
  sequelize,
  User,
  UserDetail,
  UserSkill,
  JobPost,
  CompanyRecruiterProfile,
  Application
};
