import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEnvelope, FaLock, FaCheckCircle } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
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
        setShowSuccess(true);

        // Show success message for 3 seconds then navigate
        setTimeout(() => {
          setShowSuccess(false);
          
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
            alert("Unknown role!");
          }
        }, 3000);
      } else {
        alert(result.message || "Login failed!");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred!");
    }
  };

  return (
    <div className="login-wrapper">
      {/* Beautiful Success Message Overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message">
            <div className="success-icon-container">
              <FaCheckCircle className="success-icon" />
            </div>
            <h2 className="success-title">Login Successful!</h2>
            <p className="success-subtitle">Welcome back, {userData?.name}!</p>
            <div className="success-loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      )}

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
