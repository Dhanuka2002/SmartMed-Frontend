import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

      // ✅ Use text() not json()
      const result = await response.text();
      alert(result);

      if (result.includes("Login successful")) {
        // Store user session data
        const userRole = result.includes("Student") ? "Student" :
                        result.includes("Doctor") ? "Doctor" :
                        result.includes("Pharmacy") ? "Pharmacy" :
                        result.includes("Hospital Staff") ? "Hospital Staff" :
                        result.includes("Receptionist") ? "Receptionist" : "";

        if (userRole) {
          // Get user name from result or use email as fallback
          const userName = result.match(/Welcome,?\s+([^!]+)/i)?.[1] || formData.email.split('@')[0];
          
          localStorage.setItem('currentUser', JSON.stringify({
            role: userRole,
            name: userName,
            email: formData.email
          }));

          // Store role-specific data
          if (userRole === "Student") {
            localStorage.setItem('studentName', userName);
            localStorage.setItem('studentEmail', formData.email);
            
            // Check if user has existing data to show QR or redirect to dashboard
            const existingData = localStorage.getItem(`studentData_${formData.email}`);
            if (existingData) {
              navigate("/student/qrcode");
            } else {
              navigate("/student/dashboard");
            }
          } else if (userRole === "Doctor") {
            navigate("/doctor/dashboard");
          } else if (userRole === "Pharmacy") {
            navigate("/inventory");
          } else if (userRole === "Hospital Staff") {
            navigate("/hospital-staff");
          } else if (userRole === "Receptionist") {
            navigate("/receptionist/dashboard");
          }
        } else {
          alert("Unknown role!");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred!");
    }
  };

  return (
    <div className="login-wrapper">
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
            Don’t have an account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
