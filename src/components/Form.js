import React, { useState, useEffect } from "react";
import "./Form.css";

const Form = ({
  data = [],
  onSubmit,
  fieldErrors = {},
  shouldReset = false,
}) => {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const validateField = (name, value, field) => {
    const errors = [];

    // Required field validation
    if (field.required && (!value || value.toString().trim() === "")) {
      errors.push(`${field.label} is required`);
      return errors;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === "") {
      return errors;
    }

    // Email validation
    if (field.inputType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push("Please enter a valid email address");
      }
    }

    // Password validation
    if (field.inputType === "password" && name === "password") {
      if (value.length < 6) {
        errors.push("Password must be at least 6 characters long");
      }
      if (!/(?=.*[a-z])/.test(value)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        errors.push("Password must contain at least one uppercase letter");
      }
      if (!/(?=.*\d)/.test(value)) {
        errors.push("Password must contain at least one number");
      }
    }

    // Confirm password validation
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        errors.push("Passwords do not match");
      }
    }

    // Phone number validation
    if (field.inputType === "tel") {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ""))) {
        errors.push("Please enter a valid phone number");
      }
    }

    // Date validation
    if (field.inputType === "date") {
      const date = new Date(value);
      const today = new Date();
      const minAge = new Date(
        today.getFullYear() - 13,
        today.getMonth(),
        today.getDate()
      );

      if (date > minAge) {
        errors.push("You must be at least 13 years old");
      }
    }

    // Text length validation
    if (field.maxLength && value.length > field.maxLength) {
      errors.push(`${field.label} cannot exceed ${field.maxLength} characters`);
    }

    if (field.minLength && value.length < field.minLength) {
      errors.push(
        `${field.label} must be at least ${field.minLength} characters`
      );
    }

    return errors;
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    data.forEach((field) => {
      if (
        field.type === "input" ||
        field.type === "textarea" ||
        field.type === "select"
      ) {
        const fieldErrors = validateField(
          field.name,
          formData[field.name],
          field
        );
        if (fieldErrors.length > 0) {
          errors[field.name] = fieldErrors[0]; // Show first error
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Initialize form data based on the data prop
  useEffect(() => {
    setFormData((prevFormData) => {
      const newFormData = { ...prevFormData }; // Preserve existing data

      data.forEach((field) => {
        if (
          field.type === "input" ||
          field.type === "textarea" ||
          field.type === "select" ||
          field.type === "checkbox"
        ) {
          // Only set initial value if field doesn't already have data
          // This ensures existing user input is preserved
          if (
            newFormData[field.name] === undefined ||
            (newFormData[field.name] === "" && field.type !== "checkbox")
          ) {
            if (field.type === "checkbox") {
              newFormData[field.name] =
                field.value !== undefined
                  ? field.value
                  : field.defaultValue || false;
            } else {
              newFormData[field.name] = field.value || field.defaultValue || "";
            }
          }
        }
      });

      return newFormData;
    });
  }, [data]);

  // Handle form reset
  useEffect(() => {
    if (shouldReset) {
      const resetData = {};
      data.forEach((field) => {
        if (field.type === "checkbox") {
          resetData[field.name] = field.defaultValue || false;
        } else if (
          field.type === "input" ||
          field.type === "textarea" ||
          field.type === "select"
        ) {
          resetData[field.name] = field.defaultValue || "";
        }
      });
      setFormData(resetData);
      setValidationErrors({});
      setTouched({});
    }
  }, [shouldReset, data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));

    // Mark field as touched
    setTouched((prevState) => ({
      ...prevState,
      [name]: true,
    }));

    // Validate field on change
    const fieldConfig = data.find((field) => field.name === name);
    if (fieldConfig) {
      const fieldErrors = validateField(name, newValue, fieldConfig);
      setValidationErrors((prevState) => ({
        ...prevState,
        [name]: fieldErrors.length > 0 ? fieldErrors[0] : "",
      }));

      // Call custom onChange if provided
      if (fieldConfig.onChange) {
        fieldConfig.onChange(newValue);
      }
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prevState) => ({
      ...prevState,
      [name]: true,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    // Validate entire form before submission
    const isValid = validateForm();

    // Mark all fields as touched
    const allTouched = {};
    data.forEach((field) => {
      if (
        field.type === "input" ||
        field.type === "textarea" ||
        field.type === "select"
      ) {
        allTouched[field.name] = true;
      }
    });
    setTouched(allTouched);

    if (isValid && onSubmit) {
      onSubmit(formData);
    } else if (!isValid) {
      console.log("Form validation failed:", validationErrors);
    }
  };

  // Get error to display (prioritize server errors over client validation)
  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName] || validationErrors[fieldName] || "";
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="contact-form">
        {data.map((item, index) => {
          if (item.type === "button") {
            return (
              <button
                key={index}
                type={item.buttonType || "button"}
                className={item.className || "submit-btn"}
                onClick={item.onClick}
                disabled={item.disabled}
              >
                {item.label}
              </button>
            );
          }

          if (item.type === "input") {
            const hasError = getFieldError(item.name);
            const inputClasses = [
              item.className,
              hasError ? "error" : "",
              formData[item.name] && !hasError ? "valid" : "",
            ]
              .filter(Boolean)
              .join(" ");

            // Determine if this should be full width
            const isFullWidth =
              item.inputType === "email" ||
              item.name.includes("description") ||
              item.name.includes("address") ||
              item.gridSpan === "full";

            return (
              <div key={index} className="form-group-wrapper">
                <div
                  className={`form-group ${isFullWidth ? "full-width" : ""}`}
                >
                  <label htmlFor={item.name}>
                    {item.label}
                    {item.required && (
                      <span className="required-asterisk">*</span>
                    )}
                  </label>
                  <input
                    type={item.inputType || "text"}
                    id={item.name}
                    name={item.name}
                    value={formData[item.name] || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={item.required}
                    placeholder={item.placeholder}
                    className={inputClasses}
                    disabled={item.disabled}
                    maxLength={item.maxLength}
                  />
                </div>
                {hasError && touched[item.name] && (
                  <div className="error-container">
                    <span className="error-message show">{hasError}</span>
                  </div>
                )}
              </div>
            );
          }

          if (item.type === "textarea") {
            const hasError = getFieldError(item.name);
            const textareaClasses = [
              item.className,
              hasError ? "error" : "",
              formData[item.name] && !hasError ? "valid" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={index} className="form-group-wrapper">
                <div className="form-group full-width">
                  <label htmlFor={item.name}>
                    {item.label}
                    {item.required && (
                      <span className="required-asterisk">*</span>
                    )}
                  </label>
                  <textarea
                    id={item.name}
                    name={item.name}
                    value={formData[item.name] || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={item.required}
                    placeholder={item.placeholder}
                    rows={item.rows || 4}
                    className={textareaClasses}
                    disabled={item.disabled}
                    maxLength={item.maxLength}
                  />
                </div>
                {hasError && touched[item.name] && (
                  <div className="error-container">
                    <span className="error-message show">{hasError}</span>
                  </div>
                )}
              </div>
            );
          }

          if (item.type === "select") {
            const hasError = getFieldError(item.name);
            const selectClasses = [
              item.className,
              hasError ? "error" : "",
              formData[item.name] && !hasError ? "valid" : "",
            ]
              .filter(Boolean)
              .join(" ");

            // Long select lists should be full width
            const isFullWidth =
              item.multiple ||
              (item.options && item.options.length > 5) ||
              item.gridSpan === "full";

            return (
              <div key={index} className="form-group-wrapper">
                <div
                  className={`form-group ${isFullWidth ? "full-width" : ""}`}
                >
                  <label htmlFor={item.name}>
                    {item.label}
                    {item.required && (
                      <span className="required-asterisk">*</span>
                    )}
                  </label>
                  <select
                    id={item.name}
                    name={item.name}
                    value={formData[item.name] || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={item.required}
                    multiple={item.multiple}
                    disabled={item.disabled}
                    className={selectClasses}
                  >
                    {item.options?.map((option, optionIndex) => (
                      <option key={optionIndex} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {hasError && touched[item.name] && (
                  <div className="error-container">
                    <span className="error-message show">{hasError}</span>
                  </div>
                )}
              </div>
            );
          }

          if (item.type === "checkbox") {
            const hasError = getFieldError(item.name);

            return (
              <div key={index} className="form-group-wrapper">
                <div className="form-group checkbox-group">
                  <label htmlFor={item.name} className="checkbox-label">
                    <input
                      type="checkbox"
                      id={item.name}
                      name={item.name}
                      checked={formData[item.name] || false}
                      onChange={handleChange}
                      required={item.required}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    {item.label}
                    {item.required && (
                      <span className="required-asterisk">*</span>
                    )}
                  </label>
                </div>
                {hasError && touched[item.name] && (
                  <div className="error-container">
                    <span className="error-message show">{hasError}</span>
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}

        {/* Default submit button if no button is provided in data */}
        {!data.some(
          (item) => item.type === "button" && item.buttonType === "submit"
        ) && (
          <button type="submit" className="submit-btn">
            Submit
          </button>
        )}
      </form>
    </div>
  );
};

export default Form;
