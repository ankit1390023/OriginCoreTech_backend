module.exports = (sequelize, DataTypes) => {
    const JobPost = sequelize.define('JobPost', {
      jobId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Reference to the 'Users' table
          key: 'id', // Foreign key in the 'Users' table
        },
        onDelete: 'CASCADE', // If the user is deleted, delete their job posts as well
      },
      opportunityType: DataTypes.STRING, // Internship, Job, Project
      jobProfile: DataTypes.STRING,
      skillsRequired: DataTypes.STRING,
      skillRequiredNote: DataTypes.STRING,
      jobType: DataTypes.STRING, // In-office, Hybrid, Remote
      daysInOffice: DataTypes.INTEGER,
      jobTime: DataTypes.STRING, // Part-time, Full-time
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
  
    // Associations
    JobPost.associate = (models) => {
      // A JobPost belongs to a User
      JobPost.belongsTo(models.User, { foreignKey: 'userId' });
    };
  
    return JobPost;
  };
  