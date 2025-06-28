const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const UserModel = require('./user');
const UserDetailModel = require('./userdetail');
const UniversityDetailModel = require('./universitydetail');
const UserSkillModel = require('./userSkill');
const JobPostModel = require('./jobpost');
const CompanyRecruiterProfileModel = require('./companyRecruiterProfile');
const ExperienceModel = require('./experience');
const Application = require('./application');
const AssignmentModel = require('./Assignment');
const InterviewInvitationModel = require('./interviewInvitation');
const FeedPostModel = require('./feedPost');
const FollowModel = require('./follow');
const DomainModel = require('./domain');
const SkillModel = require('./skill');

const User = UserModel(sequelize, DataTypes);
const UserDetail = UserDetailModel(sequelize, DataTypes);
const UniversityDetail = UniversityDetailModel(sequelize, DataTypes);
const UserSkill = UserSkillModel(sequelize, DataTypes);
const JobPost = JobPostModel(sequelize, DataTypes);
const CompanyRecruiterProfile = CompanyRecruiterProfileModel(sequelize, DataTypes);
const Experience = ExperienceModel(sequelize, DataTypes);
const FeedPost = FeedPostModel(sequelize, DataTypes);
const Follow = FollowModel(sequelize, DataTypes);
const Domain = DomainModel(sequelize, DataTypes);
const Skill = SkillModel(sequelize, DataTypes);
const ApplicationModel = Application;
const Assignment = AssignmentModel(sequelize, DataTypes);
const InterviewInvitation = InterviewInvitationModel;


  
// Setup associations
if (User.associate) User.associate({ User, UserDetail, UniversityDetail, UserSkill, JobPost, CompanyRecruiterProfile, Application: ApplicationModel, Assignment, InterviewInvitation, FeedPost, Follow });
if (UserDetail.associate) UserDetail.associate({ User, Experience });
if (UniversityDetail.associate) UniversityDetail.associate({ User });
if (UserSkill.associate) UserSkill.associate({ User });
if (JobPost.associate) JobPost.associate({ User, CompanyRecruiterProfile, Application: ApplicationModel, Assignment, InterviewInvitation });
if (CompanyRecruiterProfile.associate) CompanyRecruiterProfile.associate({ User, JobPost, Experience });
if (ApplicationModel.associate) ApplicationModel.associate({ JobPost, Assignment, InterviewInvitation });
if (Assignment.associate) Assignment.associate({ Application: ApplicationModel, User, JobPost });
if (InterviewInvitation.associate) InterviewInvitation.associate({ Application: ApplicationModel });
if (FeedPost.associate) FeedPost.associate({ User });
if (Follow.associate) Follow.associate({ User });
if (Skill.associate) Skill.associate({ Domain });


module.exports = {
  sequelize,
  User,
  UserDetail,
  UniversityDetail,
  UserSkill,
  JobPost,
  CompanyRecruiterProfile,
  Experience,
  FeedPost,
  Follow,
  Domain,
  Skill,
  Application: ApplicationModel,
  Assignment,
  InterviewInvitation
};
