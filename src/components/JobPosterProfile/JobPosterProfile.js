import React, { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  Edit3,
  Save,
  X,
} from "lucide-react";
import "./JobPosterProfile.css";

const JobPosterProfile = ({ user, onUpdate, updating }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    position: "",
    department: "",
    organizationType: "",
    organizationSize: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
    alternateEmail: "",
    foundedYear: "",
    description: "",
  });

  useEffect(() => {
    if (user?.jobPosterProfile) {
      setFormData({
        organizationName: user.jobPosterProfile.organizationName || "",
        position: user.jobPosterProfile.position || "",
        department: user.jobPosterProfile.department || "",
        organizationType: user.jobPosterProfile.organizationType || "",
        organizationSize: user.jobPosterProfile.organizationSize || "",
        website: user.jobPosterProfile.website || "",
        address: user.jobPosterProfile.address || "",
        city: user.jobPosterProfile.city || "",
        state: user.jobPosterProfile.state || "",
        country: user.jobPosterProfile.country || "",
        zipCode: user.jobPosterProfile.zipCode || "",
        phone: user.jobPosterProfile.phone || "",
        alternateEmail: user.jobPosterProfile.alternateEmail || "",
        foundedYear: user.jobPosterProfile.foundedYear || "",
        description: user.jobPosterProfile.description || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onUpdate) {
      await onUpdate({ jobPosterProfile: formData });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (user?.jobPosterProfile) {
      setFormData({
        organizationName: user.jobPosterProfile.organizationName || "",
        position: user.jobPosterProfile.position || "",
        department: user.jobPosterProfile.department || "",
        organizationType: user.jobPosterProfile.organizationType || "",
        organizationSize: user.jobPosterProfile.organizationSize || "",
        website: user.jobPosterProfile.website || "",
        address: user.jobPosterProfile.address || "",
        city: user.jobPosterProfile.city || "",
        state: user.jobPosterProfile.state || "",
        country: user.jobPosterProfile.country || "",
        zipCode: user.jobPosterProfile.zipCode || "",
        phone: user.jobPosterProfile.phone || "",
        alternateEmail: user.jobPosterProfile.alternateEmail || "",
        foundedYear: user.jobPosterProfile.foundedYear || "",
        description: user.jobPosterProfile.description || "",
      });
    }
  };

  return (
    <div className="job-poster-profile">
      <div className="profile-header">
        <div className="profile-title">
          <Building2 className="title-icon" />
          <h2>Job Poster Profile</h2>
        </div>
        <button
          className={`edit-btn ${isEditing ? "cancel" : "edit"}`}
          onClick={isEditing ? handleCancel : () => setIsEditing(true)}
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

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3>
              <Building2 size={20} />
              Organization Information
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Organization Name *</label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Your Position *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Organization Type</label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Type</option>
                  <option value="startup">Startup</option>
                  <option value="corporation">Corporation</option>
                  <option value="nonprofit">Non-profit</option>
                  <option value="government">Government</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Organization Size</label>
                <select
                  name="organizationSize"
                  value={formData.organizationSize}
                  onChange={handleInputChange}
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
              <div className="form-group">
                <label>Founded Year</label>
                <input
                  type="number"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Organization Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your organization..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>
              <MapPin size={20} />
              Contact Information
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://company.com"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Alternate Email</label>
                <input
                  type="email"
                  name="alternateEmail"
                  value={formData.alternateEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>ZIP/Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={updating}>
              <Save size={16} />
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-display">
          <div className="info-section">
            <h3>
              <Building2 size={20} />
              Organization Information
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <Building2 size={16} />
                <div>
                  <span className="label">Organization</span>
                  <span className="value">
                    {formData.organizationName || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Users size={16} />
                <div>
                  <span className="label">Your Position</span>
                  <span className="value">
                    {formData.position || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Building2 size={16} />
                <div>
                  <span className="label">Department</span>
                  <span className="value">
                    {formData.department || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Building2 size={16} />
                <div>
                  <span className="label">Organization Type</span>
                  <span className="value">
                    {formData.organizationType || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Users size={16} />
                <div>
                  <span className="label">Organization Size</span>
                  <span className="value">
                    {formData.organizationSize || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Calendar size={16} />
                <div>
                  <span className="label">Founded</span>
                  <span className="value">
                    {formData.foundedYear || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
            {formData.description && (
              <div className="description">
                <p>{formData.description}</p>
              </div>
            )}
          </div>

          <div className="info-section">
            <h3>
              <MapPin size={20} />
              Contact Information
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <Mail size={16} />
                <div>
                  <span className="label">Primary Email</span>
                  <span className="value">{user?.email}</span>
                </div>
              </div>
              {formData.alternateEmail && (
                <div className="info-item">
                  <Mail size={16} />
                  <div>
                    <span className="label">Alternate Email</span>
                    <span className="value">{formData.alternateEmail}</span>
                  </div>
                </div>
              )}
              {formData.phone && (
                <div className="info-item">
                  <Phone size={16} />
                  <div>
                    <span className="label">Phone</span>
                    <span className="value">{formData.phone}</span>
                  </div>
                </div>
              )}
              {formData.website && (
                <div className="info-item">
                  <Globe size={16} />
                  <div>
                    <span className="label">Website</span>
                    <span className="value">
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {formData.website}
                      </a>
                    </span>
                  </div>
                </div>
              )}
              {(formData.address ||
                formData.city ||
                formData.state ||
                formData.country) && (
                <div className="info-item full-width">
                  <MapPin size={16} />
                  <div>
                    <span className="label">Address</span>
                    <span className="value">
                      {[
                        formData.address,
                        formData.city,
                        formData.state,
                        formData.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      {formData.zipCode && ` ${formData.zipCode}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPosterProfile;
