import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Form from "../../components/Form";
import apiService from "../../services/api";
import "../Login/Login.css"; // Import Login CSS for container styles
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRole, setSelectedRole] = useState("job-seeker");
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle role change without losing form data
  const handleRoleChange = (value) => {
    setSelectedRole(value);
    // Clear any previous company name errors when switching roles
    if (value !== "job-poster" && fieldErrors.companyName) {
      const newErrors = { ...fieldErrors };
      delete newErrors.companyName;
      setFieldErrors(newErrors);
    }
  };

  const signupFormData = [
    {
      type: "input",
      inputType: "text",
      name: "firstName",
      label: "First Name",
      placeholder: "Enter your first name",
      required: true,
      minLength: 1,
      maxLength: 50,
    },
    {
      type: "input",
      inputType: "text",
      name: "lastName",
      label: "Last Name",
      placeholder: "Enter your last name",
      required: true,
      minLength: 1,
      maxLength: 50,
    },
    {
      type: "input",
      inputType: "email",
      name: "email",
      label: "Email Address",
      placeholder: "Enter your email",
      required: true,
      maxLength: 100,
    },
    {
      type: "input",
      inputType: "password",
      name: "password",
      label: "Password",
      placeholder:
        "Create a password (min 6 chars, 1 upper, 1 lower, 1 number)",
      required: true,
      minLength: 6,
    },
    {
      type: "input",
      inputType: "password",
      name: "confirmPassword",
      label: "Confirm Password",
      placeholder: "Confirm your password",
      required: true,
    },
    {
      type: "input",
      inputType: "tel",
      name: "phoneNumber",
      label: "Phone Number",
      placeholder: "+1234567890 (optional)",
      maxLength: 20,
    },
    {
      type: "input",
      inputType: "date",
      name: "dateOfBirth",
      label: "Date of Birth",
    },
    {
      type: "select",
      name: "gender",
      label: "Gender",
      options: [
        { value: "", label: "Select gender" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
        { value: "prefer-not-to-say", label: "Prefer not to say" },
      ],
    },
    {
      type: "input",
      inputType: "text",
      name: "country",
      label: "Country",
      placeholder: "Enter your country (optional)",
      maxLength: 100,
    },
    // Conditionally add company name field for admin users
    ...(selectedRole === "job-poster"
      ? [
          {
            type: "input",
            inputType: "text",
            name: "companyName",
            label: "Company Name",
            placeholder: "Enter your company name",
            required: true,
            minLength: 1,
            maxLength: 100,
            defaultValue: "", // Ensure it starts empty but doesn't overwrite existing data
          },
        ]
      : []),
    {
      type: "checkbox",
      name: "agreeToTerms",
      label: "I agree to the Terms and Conditions",
      required: true,
    },
    {
      type: "checkbox",
      name: "subscribeNewsletter",
      label: "Subscribe to our newsletter",
      defaultValue: false,
    },
    {
      type: "button",
      buttonType: "submit",
      label: isLoading ? "Creating Account..." : "Create Account",
      className: "signup-btn",
      disabled: isLoading,
    },
  ];

  const handleSignupSubmit = async (formData) => {
    console.log("Signup form submitted:", formData);
    setError("");
    setSuccess("");
    setFieldErrors({});
    setIsLoading(true);

    // Reset field errors
    let validationErrors = {};

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Validate company name for job poster users
    if (selectedRole === "job-poster" && !formData.companyName) {
      validationErrors.companyName =
        "Company name is required for Job Poster accounts";
      setFieldErrors(validationErrors);
      setError("Company name is required for Job Poster accounts");
      setIsLoading(false);
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.password = "Passwords do not match";
      validationErrors.confirmPassword = "Passwords do not match";
      setFieldErrors(validationErrors);
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms and Conditions");
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        country: formData.country,
        agreeToTerms: formData.agreeToTerms,
        subscribeToNewsletter: formData.subscribeNewsletter || false,
        requestedRole: selectedRole, // Send the requested role instead of adminSecret
        ...(selectedRole === "job-poster" && {
          companyName: formData.companyName,
        }), // Include company name for job poster users
      };

      const { data } = await apiService.register(registrationData);

      // Store the JWT token and user data
      apiService.setAuthToken(data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      // Show success notification and redirect based on role
      const userRole = selectedRole;
      let redirectMessage = "";
      let dashboardType = "";

      if (userRole === "job-seeker") {
        redirectMessage =
          "Signup successful! Please login to access your profile and start searching for jobs.";
        dashboardType = "profile";
      } else if (userRole === "job-poster") {
        redirectMessage =
          "Signup successful! Please login to access your job dashboard and start posting jobs.";
        dashboardType = "job-dashboard";
      }

      // Store the success message and dashboard type for the login page
      sessionStorage.setItem("signupSuccess", "true");
      sessionStorage.setItem("signupMessage", redirectMessage);
      sessionStorage.setItem("userDashboardType", dashboardType);
      sessionStorage.setItem("userRole", userRole);

      // Show immediate success toast
      toast.success("Account created successfully! Redirecting to login...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Handle different types of errors
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("fetch")
      ) {
        setError(
          "Unable to connect to server. Please ensure the backend is running on port 3001."
        );
      } else if (error.message.includes("Validation failed")) {
        setError("Please check your input and try again.");
      } else if (error.message.includes("User already exists")) {
        setError(
          "An account with this email already exists. Please use a different email or try logging in."
        );
      } else if (error.message.includes("Not allowed by CORS")) {
        setError(
          "Connection blocked by security policy. Please contact support."
        );
      } else {
        setError(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Tabs at the top */}
        <div className="container-header">
          <div className="account-type-tabs">
            <button
              type="button"
              className={`tab-button ${
                selectedRole === "job-seeker" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("job-seeker")}
            >
              Job Seeker
            </button>
            <button
              type="button"
              className={`tab-button ${
                selectedRole === "job-poster" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("job-poster")}
            >
              Job Poster
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="container-content">
          {/* Left Side - Details */}
          <div className="login-details">
            <div className="details-content">
              {selectedRole === "job-seeker" ? (
                <div className="role-details">
                  <div className="role-icon">�</div>
                  <h2>Job Seeker</h2>
                  <p>Find your dream job and advance your career</p>
                  <ul className="role-features">
                    <li>✓ Browse thousands of job listings</li>
                    <li>✓ Apply to jobs with one click</li>
                    <li>✓ Track your application status</li>
                    <li>✓ Get job recommendations</li>
                    <li>✓ Build your professional profile</li>
                  </ul>
                </div>
              ) : (
                <div className="role-details">
                  <div className="role-icon">�</div>
                  <h2>Job Poster</h2>
                  <p>Find the perfect candidates for your company</p>
                  <ul className="role-features">
                    <li>✓ Post unlimited job listings</li>
                    <li>✓ Manage applicant screening</li>
                    <li>✓ Access candidate profiles</li>
                    <li>✓ Analytics and insights</li>
                    <li>✓ Team collaboration tools</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="login-form-section">
            <div className="login-form-content">
              <div className="login-header">
                <h1>Create Your Account</h1>
                <p>Please fill in your details to get started</p>

                {error && (
                  <div
                    className="top-error-message"
                    style={{
                      color: "#dc3545",
                      backgroundColor: "#f8d7da",
                      border: "1px solid #f5c6cb",
                      borderRadius: "4px",
                      padding: "12px",
                      marginTop: "15px",
                      marginBottom: "10px",
                      fontSize: "14px",
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    {error}
                  </div>
                )}
                {success && (
                  <div
                    className="success-message animate-in"
                    style={{
                      color: "#155724",
                      backgroundColor: "#d4edda",
                      border: "1px solid #c3e6cb",
                      borderRadius: "4px",
                      padding: "10px",
                      marginTop: "10px",
                      fontSize: "14px",
                    }}
                  >
                    {success}
                  </div>
                )}
              </div>

              <Form
                data={signupFormData}
                title=""
                onSubmit={handleSignupSubmit}
                fieldErrors={fieldErrors}
              />

              <div className="login-footer">
                <div className="login-link">
                  <span>Already have an account? </span>
                  <Link to="/login" className="link">
                    Sign in here
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
