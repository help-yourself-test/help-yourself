import React from "react";
import "./JobSeekerProfile.css";

const JobSeekerProfile = ({ user, onUpdate, updating }) => {
  return (
    <div className="job-seeker-profile">
      <h2>Job Seeker Profile Test</h2>
      <p>User: {user?.firstName} {user?.lastName}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <div style={{ background: 'red', padding: '20px', color: 'white' }}>
        This should be visible!
      </div>
    </div>
  );
};

export default JobSeekerProfile;

const JobSeekerProfile = ({ user, onUpdate, updating }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    dateOfBirth: '',
    
    // Professional Information
    currentTitle: '',
    experienceLevel: '',
    skills: [],
    newSkill: '',
    
    // Education
    education: [],
    
    // Experience
    experience: [],
    
    // Preferences
    preferredJobType: [],
    preferredWorkMode: [],
    expectedSalary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    availability: '',
    
    // Portfolio
    portfolio: {
      website: '',
      linkedin: '',
      github: '',
      other: ''
    },
    
    // Documents
    resumeUploaded: false,
    portfolioUploaded: false,
    
    // Additional Info
    summary: '',
    languages: [],
    certifications: [],
    achievements: []
  });

  useEffect(() => {
    if (user) {
      const profile = user.jobSeekerProfile || {};
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        dateOfBirth: profile.dateOfBirth || '',
        currentTitle: profile.currentTitle || '',
        experienceLevel: profile.experienceLevel || '',
        skills: profile.skills || [],
        newSkill: '',
        education: profile.education || [],
        experience: profile.experience || [],
        preferredJobType: profile.preferredJobType || [],
        preferredWorkMode: profile.preferredWorkMode || [],
        expectedSalary: profile.expectedSalary || { min: '', max: '', currency: 'USD' },
        availability: profile.availability || '',
        portfolio: profile.portfolio || { website: '', linkedin: '', github: '', other: '' },
        resumeUploaded: profile.resumeUploaded || false,
        portfolioUploaded: profile.portfolioUploaded || false,
        summary: profile.summary || '',
        languages: profile.languages || [],
        certifications: profile.certifications || [],
        achievements: profile.achievements || []
      });
    }
  }, [user]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.phone,
      profileData.currentTitle,
      profileData.experienceLevel,
      profileData.skills.length > 0,
      profileData.education.length > 0,
      profileData.summary,
      profileData.resumeUploaded,
      profileData.expectedSalary.min && profileData.expectedSalary.max,
      profileData.availability,
      profileData.portfolio.linkedin || profileData.portfolio.github || profileData.portfolio.website
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSkill = () => {
    if (profileData.newSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const removeSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        field: '',
        institution: '',
        startYear: '',
        endYear: '',
        gpa: ''
      }]
    }));
  };

  const removeEducation = (index) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const removeExperience = (index) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onUpdate) {
      await onUpdate({ jobSeekerProfile: profileData });
      setIsEditing(false);
    }
  };

  const profileCompletion = calculateProfileCompletion();

  const TabButton = ({ id, icon: Icon, label, count }) => (
    <button 
      className={`tab-btn ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <Icon size={16} />
      {label}
      {count !== undefined && <span className="count">{count}</span>}
    </button>
  );

  return (
    <div className="job-seeker-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="header-left">
          <div className="avatar">
            <User size={32} />
          </div>
          <div className="header-info">
            <h2>{profileData.firstName} {profileData.lastName}</h2>
            <p className="title">{profileData.currentTitle || 'Job Seeker'}</p>
            <p className="email">{user?.email}</p>
          </div>
        </div>
        <div className="header-right">
          <div className="completion-badge">
            <div className="completion-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${profileCompletion}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="percentage">{profileCompletion}%</div>
            </div>
            <span>Profile Complete</span>
          </div>
          <button 
            className={`edit-btn ${isEditing ? 'cancel' : 'edit'}`}
            onClick={isEditing ? () => setIsEditing(false) : () => setIsEditing(true)}
            disabled={updating}
          >
            {isEditing ? (
              <>
                <X size={16} />
                Cancel
              </>
            ) : (
              <>
                <Edit3 size={16} />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <TabButton id="overview" icon={User} label="Overview" />
        <TabButton id="experience" icon={Briefcase} label="Experience" count={profileData.experience.length} />
        <TabButton id="education" icon={GraduationCap} label="Education" count={profileData.education.length} />
        <TabButton id="skills" icon={Trophy} label="Skills" count={profileData.skills.length} />
        <TabButton id="documents" icon={FileText} label="Documents" />
        <TabButton id="preferences" icon={Target} label="Preferences" />
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-section">
                  <h3><User size={20} /> Personal Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Title</label>
                      <input
                        type="text"
                        name="currentTitle"
                        value={profileData.currentTitle}
                        onChange={handleInputChange}
                        placeholder="e.g., Software Developer, Marketing Manager"
                      />
                    </div>
                    <div className="form-group">
                      <label>Experience Level</label>
                      <select
                        name="experienceLevel"
                        value={profileData.experienceLevel}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Experience Level</option>
                        <option value="fresher">Fresher (0-1 years)</option>
                        <option value="entry">Entry Level (1-3 years)</option>
                        <option value="mid">Mid Level (3-7 years)</option>
                        <option value="senior">Senior Level (7-12 years)</option>
                        <option value="executive">Executive (12+ years)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Professional Summary</label>
                    <textarea
                      name="summary"
                      value={profileData.summary}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Write a brief summary about yourself, your experience, and career goals..."
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3><MapPin size={20} /> Location</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>State/Province</label>
                      <input
                        type="text"
                        name="state"
                        value={profileData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={updating}>
                    <Save size={16} />
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="overview-display">
                <div className="info-cards">
                  <div className="info-card">
                    <div className="card-header">
                      <User size={20} />
                      <h3>Personal Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="info-item">
                        <Mail size={16} />
                        <span>{user?.email}</span>
                      </div>
                      {profileData.phone && (
                        <div className="info-item">
                          <Phone size={16} />
                          <span>{profileData.phone}</span>
                        </div>
                      )}
                      {(profileData.city || profileData.state || profileData.country) && (
                        <div className="info-item">
                          <MapPin size={16} />
                          <span>
                            {[profileData.city, profileData.state, profileData.country]
                              .filter(Boolean)
                              .join(', ')
                            }
                          </span>
                        </div>
                      )}
                      <div className="info-item">
                        <Briefcase size={16} />
                        <span>{profileData.experienceLevel || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {profileData.summary && (
                    <div className="info-card summary-card">
                      <div className="card-header">
                        <FileText size={20} />
                        <h3>Professional Summary</h3>
                      </div>
                      <div className="card-content">
                        <p>{profileData.summary}</p>
                      </div>
                    </div>
                  )}

                  <div className="info-card">
                    <div className="card-header">
                      <Globe size={20} />
                      <h3>Portfolio Links</h3>
                    </div>
                    <div className="card-content">
                      {profileData.portfolio.linkedin && (
                        <div className="info-item">
                          <Linkedin size={16} />
                          <a href={profileData.portfolio.linkedin} target="_blank" rel="noopener noreferrer">
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                      {profileData.portfolio.github && (
                        <div className="info-item">
                          <Github size={16} />
                          <a href={profileData.portfolio.github} target="_blank" rel="noopener noreferrer">
                            GitHub Profile
                          </a>
                        </div>
                      )}
                      {profileData.portfolio.website && (
                        <div className="info-item">
                          <Globe size={16} />
                          <a href={profileData.portfolio.website} target="_blank" rel="noopener noreferrer">
                            Personal Website
                          </a>
                        </div>
                      )}
                      {!profileData.portfolio.linkedin && !profileData.portfolio.github && !profileData.portfolio.website && (
                        <div className="no-data">
                          <AlertCircle size={16} />
                          <span>No portfolio links added yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="skills-tab">
            <div className="tab-header">
              <h3><Trophy size={20} /> Skills & Expertise</h3>
              {isEditing && (
                <div className="add-skill">
                  <input
                    type="text"
                    value={profileData.newSkill}
                    onChange={(e) => setProfileData(prev => ({ ...prev, newSkill: e.target.value }))}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button type="button" onClick={addSkill} className="add-btn">
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="skills-grid">
              {profileData.skills.map((skill, index) => (
                <div key={index} className="skill-tag">
                  <span>{skill}</span>
                  {isEditing && (
                    <button onClick={() => removeSkill(index)} className="remove-skill">
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {profileData.skills.length === 0 && (
                <div className="no-data">
                  <Code size={32} />
                  <p>No skills added yet</p>
                  <small>Add your technical and professional skills</small>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-tab">
            <div className="tab-header">
              <h3><FileText size={20} /> Documents & Portfolio</h3>
            </div>
            <div className="documents-grid">
              <div className="document-card">
                <div className="document-icon">
                  <FileText size={32} />
                </div>
                <h4>Resume/CV</h4>
                <p>Upload your latest resume</p>
                <div className="document-actions">
                  {profileData.resumeUploaded ? (
                    <>
                      <button className="download-btn">
                        <Download size={16} />
                        Download
                      </button>
                      <span className="status uploaded">
                        <CheckCircle2 size={16} />
                        Uploaded
                      </span>
                    </>
                  ) : (
                    <>
                      <button className="upload-btn">
                        <Upload size={16} />
                        Upload Resume
                      </button>
                      <span className="status pending">
                        <AlertCircle size={16} />
                        Required
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="document-card">
                <div className="document-icon">
                  <Camera size={32} />
                </div>
                <h4>Portfolio</h4>
                <p>Showcase your work samples</p>
                <div className="document-actions">
                  {profileData.portfolioUploaded ? (
                    <>
                      <button className="download-btn">
                        <Download size={16} />
                        View Portfolio
                      </button>
                      <span className="status uploaded">
                        <CheckCircle2 size={16} />
                        Uploaded
                      </span>
                    </>
                  ) : (
                    <>
                      <button className="upload-btn">
                        <Upload size={16} />
                        Upload Portfolio
                      </button>
                      <span className="status optional">
                        <Clock size={16} />
                        Optional
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-tab">
            <div className="tab-header">
              <h3><Target size={20} /> Job Preferences</h3>
            </div>
            {isEditing ? (
              <div className="preferences-form">
                <div className="form-section">
                  <h4><DollarSign size={18} /> Salary Expectations</h4>
                  <div className="salary-range">
                    <div className="form-group">
                      <label>Minimum Salary</label>
                      <input
                        type="number"
                        name="expectedSalary.min"
                        value={profileData.expectedSalary.min}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Maximum Salary</label>
                      <input
                        type="number"
                        name="expectedSalary.max"
                        value={profileData.expectedSalary.max}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        name="expectedSalary.currency"
                        value={profileData.expectedSalary.currency}
                        onChange={handleInputChange}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4><Clock size={18} /> Availability</h4>
                  <select
                    name="availability"
                    value={profileData.availability}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Availability</option>
                    <option value="immediate">Available Immediately</option>
                    <option value="2weeks">2 Weeks Notice</option>
                    <option value="1month">1 Month Notice</option>
                    <option value="2months">2 Months Notice</option>
                    <option value="3months">3+ Months</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="preferences-display">
                <div className="preference-item">
                  <DollarSign size={20} />
                  <div>
                    <h4>Salary Range</h4>
                    <p>
                      {profileData.expectedSalary.min && profileData.expectedSalary.max 
                        ? `${profileData.expectedSalary.currency} ${profileData.expectedSalary.min} - ${profileData.expectedSalary.max}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
                <div className="preference-item">
                  <Clock size={20} />
                  <div>
                    <h4>Availability</h4>
                    <p>{profileData.availability || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerProfile;
