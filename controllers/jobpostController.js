const { User, JobPost } = require('../models');

exports.createJobPost = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    const {
      opportunityType,
      jobProfile,
      skillsRequired,
      skillRequiredNote,
      jobType,
      daysInOffice,
      jobTime,
      cityChoice,
      numberOfOpenings,
      jobDescription,
      candidatePreferences,
      womenPreferred,
      stipendType,
      stipendMin,
      stipendMax,
      incentivePerYear,
      perks,
      screeningQuestions,
      phoneContact,
      internshipDuration,
      internshipStartDate,
      internshipFromDate,
      internshipToDate,
      isCustomInternshipDate,
      collegeName,
      course
    } = req.body;

    const jobPost = await JobPost.create({
      userId,
      opportunityType,
      jobProfile,
      skillsRequired,
      skillRequiredNote,
      jobType,
      daysInOffice: jobType === 'Remote' ? null : daysInOffice,
      jobTime,
      cityChoice: jobType === 'Remote' ? null : cityChoice,
      numberOfOpenings,
      jobDescription,
      candidatePreferences,
      womenPreferred,
      stipendType,
      stipendMin: stipendType === 'Unpaid' ? null : stipendMin,
      stipendMax: stipendType === 'Unpaid' ? null : stipendMax,
      incentivePerYear,
      perks,
      screeningQuestions,
      phoneContact,
      internshipDuration,
      internshipStartDate,
      internshipFromDate: isCustomInternshipDate ? internshipFromDate : null,
      internshipToDate: isCustomInternshipDate ? internshipToDate : null,
      isCustomInternshipDate,
      collegeName,
      course
    });

    return res.status(201).json({ message: 'Job post created successfully.', data: jobPost });

  } catch (error) {
    console.error("Error creating job post:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
