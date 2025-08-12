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

      if (!response.ok) {
        // If server returns error status, get error message
        const errorData = await response.json();
        alert(errorData.message || "Login failed");
        return;
      }

      const result = await response.json(); // Parse JSON here

      alert(result.message);

      if (result.status === "success") {
        // Save name and role to localStorage
        localStorage.setItem("studentName", result.name);
        localStorage.setItem("userRole", result.role);

        if (result.role === "Student") {
          navigate("/student/dashboard");
        } else if (result.role === "Doctor") {
          navigate("/doctor/dashboard");
        } else if (result.role === "Pharmacy") {
          navigate("/");
        } else {
          alert("Unknown role!");
        }
      } else {
        alert(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Error occurred during login");
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