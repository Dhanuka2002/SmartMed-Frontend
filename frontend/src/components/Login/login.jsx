import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import AlertMessage from "../Common/AlertMessage";
import useAlert from "../../hooks/useAlert";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { alertState, showSuccess, showError, hideAlert } = useAlert();
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // ✅ Use json() to parse the response
      const result = await response.json();
      
      if (result.status === "success") {
        // Store user session data
        const userInfo = {
          role: result.role,
          name: result.name,
          email: result.email,
          userId: result.userId
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        setUserData(userInfo);
        
        // Show success message for 3 seconds then navigate
        showSuccess(
          `Welcome back, ${userInfo.name}! Redirecting to your dashboard....`, 
          "Login Successful!", 
          userInfo.name, 
          3000
        );

        setTimeout(() => {
          
          // Store role-specific data and navigate based on role
          if (result.role === "Student") {
            localStorage.setItem('studentName', result.name);
            localStorage.setItem('studentEmail', result.email);
            
            // Always redirect students to dashboard
            navigate("/student/dashboard");
          } else if (result.role === "Doctor") {
            navigate("/doctor/dashboard");
          } else if (result.role === "Pharmacy") {
            navigate("/inventory");
          } else if (result.role === "Hospital Staff") {
            navigate("/hospital-staff");
          } else if (result.role === "Receptionist") {
            navigate("/receptionist/dashboard");
          } else if (result.role === "Admin") {
            navigate("/admin/dashboard");
          } else {
            showError("Unknown role!", "Authentication Error");
          }
        }, 3000);
      } else {
        showError(result.message || "Login failed!", "Login Failed");
      }
    } catch (error) {
      console.error(error);
      showError("An unexpected error occurred. Please try again.", "Connection Error");
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
          <h1>
            Smart<span>Med</span>
          </h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>

          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="E-mail"
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

          <button type="submit" className="login-btn">
            Sign In
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
