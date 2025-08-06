import React, { useState, useEffect } from "react";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  GraduationCap,
  Briefcase,
  Trophy,
  FileText,
  Upload,
  Download,
  Plus,
  X,
  Edit3,
  Save,
  DollarSign,
  Clock,
  Globe,
  Github,
  Linkedin,
  CheckCircle2,
  AlertCircle,
  Star,
  Award,
  Target
} from "lucide-react";
import Form from "../Form";
import apiService from "../../services/api";
import "./JobSeekerProfile.css";

const JobSeekerProfile = ({ user, onProfileUpdate }) => {
  const [profileData, setProfileData] = useState({
    skills: [],
    experience: "",
    education: {
      level: "",
      field: "",
      institution: "",
      graduationYear: "",
    },
    preferredJobType: [],
    preferredWorkMode: [],
    expectedSalary: {
      min: "",
      max: "",
      currency: "USD",
    },
    availability: "",
    portfolio: {
      website: "",
      linkedin: "",
      github: "",
      other: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Initialize profile data from user prop
  useEffect(() => {
    if (user?.jobSeekerProfile) {
      setProfileData({
        skills: user.jobSeekerProfile.skills || [],
        experience: user.jobSeekerProfile.experience || "",
        education: user.jobSeekerProfile.education || {
          level: "",
          field: "",
          institution: "",
          graduationYear: "",
        },
        preferredJobType: user.jobSeekerProfile.preferredJobType || [],
        preferredWorkMode: user.jobSeekerProfile.preferredWorkMode || [],
        expectedSalary: user.jobSeekerProfile.expectedSalary || {
          min: "",
          max: "",
          currency: "USD",
        },
        availability: user.jobSeekerProfile.availability || "",
        portfolio: user.jobSeekerProfile.portfolio || {
          website: "",
          linkedin: "",
          github: "",
          other: "",
        },
      });
    }
  }, [user]);

  // const handleSkillsChange = (skillsString) => {
  //   // Convert comma-separated string to array
  //   const skillsArray = skillsString
  //     .split(",")
  //     .map((skill) => skill.trim())
  //     .filter((skill) => skill.length > 0);
  //   setProfileData((prev) => ({ ...prev, skills: skillsArray }));
  // };

  const handleArrayFieldChange = (fieldName, value) => {
    // Handle multi-select fields
    const currentValues = profileData[fieldName] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    setProfileData((prev) => ({ ...prev, [fieldName]: newValues }));
  };

  // const handleNestedFieldChange = (parentField, childField, value) => {
  //   setProfileData((prev) => ({
  //     ...prev,
  //     [parentField]: {
  //       ...prev[parentField],
  //       [childField]: value,
  //     },
  //   }));
  // };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setMessage("");
    setErrors({});

    try {
      // Prepare the profile data
      const updatedProfile = {
        ...profileData,
        skills:
          typeof formData.skills === "string"
            ? formData.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill.length > 0)
            : profileData.skills,
        experience: formData.experience || profileData.experience,
        education: {
          level: formData.educationLevel || profileData.education.level,
          field: formData.educationField || profileData.education.field,
          institution:
            formData.educationInstitution || profileData.education.institution,
          graduationYear: formData.educationGraduationYear
            ? parseInt(formData.educationGraduationYear)
            : profileData.education.graduationYear,
        },
        expectedSalary: {
          min: formData.salaryMin
            ? parseInt(formData.salaryMin)
            : profileData.expectedSalary.min,
          max: formData.salaryMax
            ? parseInt(formData.salaryMax)
            : profileData.expectedSalary.max,
          currency:
            formData.salaryCurrency || profileData.expectedSalary.currency,
        },
        availability: formData.availability || profileData.availability,
        portfolio: {
          website: formData.portfolioWebsite || profileData.portfolio.website,
          linkedin:
            formData.portfolioLinkedin || profileData.portfolio.linkedin,
          github: formData.portfolioGithub || profileData.portfolio.github,
          other: formData.portfolioOther || profileData.portfolio.other,
        },
      };

      const response = await apiService.updateJobSeekerProfile(updatedProfile);

      setMessage("Profile updated successfully!");
      setProfileData(updatedProfile);

      if (onProfileUpdate) {
        onProfileUpdate(response.data);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    {
      type: "input",
      name: "skills",
      label: "Skills",
      placeholder: "JavaScript, React, Node.js, etc. (comma-separated)",
      value: profileData.skills.join(", "),
      required: false,
    },
    {
      type: "select",
      name: "experience",
      label: "Experience Level",
      value: profileData.experience,
      required: false,
      options: [
        { value: "", label: "Select experience level" },
        { value: "entry-level", label: "Entry Level" },
        { value: "1-2 years", label: "1-2 Years" },
        { value: "3-5 years", label: "3-5 Years" },
        { value: "5-10 years", label: "5-10 Years" },
        { value: "10+ years", label: "10+ Years" },
      ],
    },
    // Education fields
    {
      type: "select",
      name: "educationLevel",
      label: "Education Level",
      value: profileData.education.level,
      required: false,
      options: [
        { value: "", label: "Select education level" },
        { value: "high-school", label: "High School" },
        { value: "associate", label: "Associate Degree" },
        { value: "bachelor", label: "Bachelor's Degree" },
        { value: "master", label: "Master's Degree" },
        { value: "doctorate", label: "Doctorate" },
        { value: "other", label: "Other" },
      ],
    },
    {
      type: "input",
      name: "educationField",
      label: "Field of Study",
      placeholder: "Computer Science, Engineering, etc.",
      value: profileData.education.field,
      required: false,
    },
    {
      type: "input",
      name: "educationInstitution",
      label: "Institution",
      placeholder: "University name",
      value: profileData.education.institution,
      required: false,
    },
    {
      type: "input",
      name: "educationGraduationYear",
      label: "Graduation Year",
      placeholder: "2020",
      value: profileData.education.graduationYear || "",
      required: false,
    },
    // Salary expectations
    {
      type: "input",
      name: "salaryMin",
      label: "Minimum Expected Salary",
      placeholder: "50000",
      value: profileData.expectedSalary.min || "",
      required: false,
    },
    {
      type: "input",
      name: "salaryMax",
      label: "Maximum Expected Salary",
      placeholder: "80000",
      value: profileData.expectedSalary.max || "",
      required: false,
    },
    {
      type: "select",
      name: "salaryCurrency",
      label: "Currency",
      value: profileData.expectedSalary.currency,
      required: false,
      options: [
        { value: "USD", label: "USD" },
        { value: "EUR", label: "EUR" },
        { value: "GBP", label: "GBP" },
        { value: "CAD", label: "CAD" },
        { value: "AUD", label: "AUD" },
      ],
    },
    {
      type: "select",
      name: "availability",
      label: "Availability",
      value: profileData.availability,
      required: false,
      options: [
        { value: "", label: "Select availability" },
        { value: "immediate", label: "Immediate" },
        { value: "2-weeks", label: "2 Weeks" },
        { value: "1-month", label: "1 Month" },
        { value: "3-months", label: "3 Months" },
        { value: "not-looking", label: "Not Currently Looking" },
      ],
    },
    // Portfolio links
    {
      type: "input",
      name: "portfolioWebsite",
      label: "Website/Portfolio",
      placeholder: "https://yourportfolio.com",
      value: profileData.portfolio.website,
      required: false,
    },
    {
      type: "input",
      name: "portfolioLinkedin",
      label: "LinkedIn Profile",
      placeholder: "https://linkedin.com/in/yourprofile",
      value: profileData.portfolio.linkedin,
      required: false,
    },
    {
      type: "input",
      name: "portfolioGithub",
      label: "GitHub Profile",
      placeholder: "https://github.com/yourusername",
      value: profileData.portfolio.github,
      required: false,
    },
    {
      type: "input",
      name: "portfolioOther",
      label: "Other Portfolio Link",
      placeholder: "Any other relevant link",
      value: profileData.portfolio.other,
      required: false,
    },
  ];

  return (
    <div className="job-seeker-profile">
      <div className="profile-header">
        <h2>Job Seeker Profile</h2>
        <p>Complete your profile to help employers find you</p>
      </div>

      {message && (
        <div
          className={`message ${
            message.includes("success") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}

      <div className="profile-sections">
        {/* Preferred Job Types Section */}
        <div className="profile-section">
          <h3>Preferred Job Types</h3>
          <div className="checkbox-group">
            {[
              "full-time",
              "part-time",
              "contract",
              "internship",
              "freelance",
            ].map((type) => (
              <label key={type} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={profileData.preferredJobType.includes(type)}
                  onChange={() =>
                    handleArrayFieldChange("preferredJobType", type)
                  }
                />
                <span>
                  {type
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Work Modes Section */}
        <div className="profile-section">
          <h3>Preferred Work Modes</h3>
          <div className="checkbox-group">
            {["remote", "hybrid", "on-site"].map((mode) => (
              <label key={mode} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={profileData.preferredWorkMode.includes(mode)}
                  onChange={() =>
                    handleArrayFieldChange("preferredWorkMode", mode)
                  }
                />
                <span>
                  {mode
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <Form
        data={formFields}
        title="Profile Information"
        onSubmit={handleSubmit}
        fieldErrors={errors}
        submitButtonText={isLoading ? "Updating..." : "Update Profile"}
        isSubmitting={isLoading}
      />
    </div>
  );
};

export default JobSeekerProfile;
