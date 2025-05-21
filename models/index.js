const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const UserModel = require('./user');
const UserDetailModel = require('./userdetail');
const UserSkillModel = require('./userSkill');
const JobPostModel = require('./jobpost');
const CompanyRecruiterProfileModel = require('./companyRecruiterProfile');
const Application = require('./application');
const AssignmentModel = require('./Assignment');
const InterviewInvitationModel = require('./interviewInvitation');

const User = UserModel(sequelize, DataTypes);
const UserDetail = UserDetailModel(sequelize, DataTypes);
const UserSkill = UserSkillModel(sequelize, DataTypes);
const JobPost = JobPostModel(sequelize, DataTypes);
const CompanyRecruiterProfile = CompanyRecruiterProfileModel(sequelize, DataTypes);
const ApplicationModel = Application;
const Assignment = AssignmentModel(sequelize, DataTypes);
const InterviewInvitation = InterviewInvitationModel;

// Setup associations
if (User.associate) User.associate({ UserDetail, UserSkill, JobPost, CompanyRecruiterProfile, Application: ApplicationModel, Assignment, InterviewInvitation });
if (UserDetail.associate) UserDetail.associate({ User });
if (UserSkill.associate) UserSkill.associate({ User });
if (JobPost.associate) JobPost.associate({ User, CompanyRecruiterProfile, Application: ApplicationModel, Assignment, InterviewInvitation });
if (CompanyRecruiterProfile.associate) CompanyRecruiterProfile.associate({ User });
if (ApplicationModel.associate) ApplicationModel.associate({ JobPost, Assignment, InterviewInvitation });
if (Assignment.associate) Assignment.associate({ Application: ApplicationModel, User, JobPost });
if (InterviewInvitation.associate) InterviewInvitation.associate({ Application: ApplicationModel });

module.exports = {
  sequelize,
  User,
  UserDetail,
  UserSkill,
  JobPost,
  CompanyRecruiterProfile,
  Application: ApplicationModel,
  Assignment,
  InterviewInvitation
};
