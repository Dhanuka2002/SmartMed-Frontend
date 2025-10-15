import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import AlertMessage from "../Common/AlertMessage";
import useAlert from "../../hooks/useAlert";
import authService from "../../services/authService.js";
import logo from "../../assets/smartmed_logo.png";  


const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { alertState, showSuccess, showError, hideAlert } = useAlert();
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for tracking submission

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // All validation checks removed

    setIsSubmitting(true); // Set submitting to true on form submission

    try {
      const result = await authService.login(formData);

      if (result.success) {
        setUserData(result.user);

        // Show success message for 3 seconds then navigate
        showSuccess(
          `Welcome back, ${result.user.name}! Redirecting to your dashboard....`,
          "Login Successful!",
          result.user.name,
          3000
        );

        setTimeout(() => {
          const route = authService.getDashboardRoute();
          navigate(route);
        }, 3000);
      } else {
        showError(result.error, "Login Failed");
      }
    } catch (error) {
      console.error(error);
      showError("Invalid email or password", "Login Failed");
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="login-wrapper">
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
<div className="login-card">
      <div className="login-header">
    <img src={logo} alt="SmartMed Logo" className="logo-img" />
    <h1>
      SmartMed 
    </h1>
  </div>

        <form className="login-form" onSubmit={handleLogin}>
          <h2>Sign In</h2>

          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
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
            />
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
          <p className="register-link">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
