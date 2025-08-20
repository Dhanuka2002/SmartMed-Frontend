import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

import { FaUser, FaEnvelope, FaLock, FaUserTag } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Only Student registration is allowed through public registration
  const userRoles = [
    "Student"
  ];

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
      alert("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: formData.role,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Registration failed");
        setIsSubmitting(false);
        return;
      }

      alert(result.message + " Please login with your credentials.");

      // Redirect to login page after successful registration
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);
      alert("Error occurred during registration!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <div className="register-header">
          <h1>
            Smart<span>Med</span>
          </h1>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <h2>Student Registration</h2>
          <p style={{color: '#666', fontSize: '14px', marginBottom: '20px', textAlign: 'center'}}>
            Only students can register here. Other roles are managed by admin.
          </p>

          <div className="input-group">
            <FaUserTag className="icon" />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {userRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="name"
              name="name"
              placeholder="Your Name"
              value={formData.name}
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
