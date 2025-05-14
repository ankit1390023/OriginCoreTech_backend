module.exports = (sequelize, DataTypes) => {
    const JobPost = sequelize.define('JobPost', {
      jobId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
     
      companyRecruiterProfileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'companyrecruiterprofiles',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      opportunityType: DataTypes.STRING, 
      jobProfile: DataTypes.STRING,
      skillsRequired: DataTypes.STRING,
      skillRequiredNote: DataTypes.STRING,
      jobType: DataTypes.STRING, 
      daysInOffice: DataTypes.INTEGER,
      jobTime: DataTypes.STRING, 
      cityChoice: DataTypes.STRING,
      numberOfOpenings: DataTypes.INTEGER,
      jobDescription: DataTypes.TEXT,
      candidatePreferences: DataTypes.STRING,
      womenPreferred: DataTypes.BOOLEAN,
      stipendType: DataTypes.STRING,
      stipendMin: DataTypes.INTEGER,
      stipendMax: DataTypes.INTEGER,
      incentivePerYear: DataTypes.STRING,
      perks: DataTypes.STRING,
      screeningQuestions: DataTypes.TEXT,
      phoneContact: DataTypes.STRING,
      internshipDuration: DataTypes.STRING,
      internshipStartDate: DataTypes.DATEONLY,
      internshipFromDate: DataTypes.DATEONLY,
      internshipToDate: DataTypes.DATEONLY,
      isCustomInternshipDate: DataTypes.BOOLEAN,
      collegeName: DataTypes.STRING,
      course: DataTypes.STRING
    });
  
    JobPost.associate = (models) => {
      JobPost.belongsTo(models.CompanyRecruiterProfile, { foreignKey: 'companyRecruiterProfileId' });
      JobPost.hasMany(models.Application, { foreignKey: 'jobPostId' });
    };
  
    return JobPost;
  };
  