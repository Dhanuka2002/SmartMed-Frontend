import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    email: localStorage.getItem("userEmail") || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long!");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8081/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Password change failed");
        setIsSubmitting(false);
        return;
      }

      setShowSuccess(true);

      // Clear form
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Show success message for 3 seconds then navigate back
      setTimeout(() => {
        setShowSuccess(false);
        navigate(-1); // Go back to previous page
      }, 3000);

    } catch (error) {
      console.error("Password change error:", error);
      setError("Error occurred during password change!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="change-password-wrapper">
      {/* Success Message Overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message">
            <div className="success-icon-container">
              <FaCheckCircle className="success-icon" />
            </div>
            <h2 className="success-title">Password Changed Successfully!</h2>
            <p className="success-subtitle">Your password has been updated.</p>
            <p className="success-info">A confirmation email has been sent to your email address.</p>
            <div className="success-loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Redirecting...</p>
            </div>
          </div>
        </div>
      )}

      <div className="change-password-card">
        <div className="change-password-header">
          <button 
            type="button" 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <h1>
            Smart<span>Med</span>
          </h1>
        </div>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <h2>Change Password</h2>
          <p className="form-description">
            Update your password to keep your account secure
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly
            />
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="password-requirements">
            <p>Password Requirements:</p>
            <ul>
              <li className={formData.newPassword.length >= 6 ? 'met' : ''}>
                At least 6 characters
              </li>
              <li className={formData.newPassword !== formData.currentPassword && formData.newPassword ? 'met' : ''}>
                Different from current password
              </li>
              <li className={formData.newPassword === formData.confirmPassword && formData.newPassword ? 'met' : ''}>
                Passwords match
              </li>
            </ul>
          </div>

          <button type="submit" className="change-password-btn" disabled={isSubmitting}>
            {isSubmitting ? "Changing Password..." : "Change Password"}
          </button>

          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;