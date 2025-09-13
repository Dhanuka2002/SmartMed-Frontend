import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { FaUser, FaEnvelope, FaLock, FaUserTag } from "react-icons/fa";
import AlertMessage from "../Common/AlertMessage";
import useAlert from "../../hooks/useAlert";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertState, showSuccess, showError, hideAlert } = useAlert();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match!", "Validation Error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "Student",
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showError(result.message || "Registration failed", "Registration Failed");
        setIsSubmitting(false);
        return;
      }

      // Store user data for success message
      const userInfo = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        role: "Student"
      };
      
      setUserData(userInfo);
      
      // Show success message for 4 seconds then navigate to login
      showSuccess(
        `Welcome to SmartMed, ${userInfo.name}! Your account has been created successfully. Redirecting to login page...`, 
        "Registration Successful!", 
        userInfo.name, 
        4000
      );

      setTimeout(() => {
        navigate("/login");
      }, 4000);

    } catch (error) {
      console.error("Registration error:", error);
      showError("An unexpected error occurred during registration. Please try again.", "Registration Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-wrapper">
      {/* Alert Message */}
      <AlertMessage
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        show={alertState.show}
        onClose={hideAlert}
        autoClose={alertState.autoClose}
        duration={alertState.duration}
        userName={alertState.userName}
      />

      <div className="register-card">
        <div className="register-header">
          <h1>
            Smart<span>Med</span>
          </h1>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <h2>Student Registration</h2>
         

          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="youremail@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
          <p className="signin-link">
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
