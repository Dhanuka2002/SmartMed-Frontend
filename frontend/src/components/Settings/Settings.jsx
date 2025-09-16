import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import { 
  FiSettings, 
  FiLock, 
  FiUser, 
  FiMail, 
  FiEye, 
  FiEyeOff, 
  FiCheck, 
  FiX, 
  FiShield,
  FiChevronRight
} from "react-icons/fi";

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage({ type: '', text: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long!' });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password!' });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("http://localhost:8081/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser?.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: result.message || 'Password change failed' });
        setIsChangingPassword(false);
        return;
      }

      setMessage({ type: 'success', text: 'Password changed successfully! Confirmation email sent.' });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error("Password change error:", error);
      setMessage({ type: 'error', text: 'Error occurred during password change!' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const passwordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const getStrengthLabel = (strength) => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[strength] || 'Very Weak';
  };

  const getStrengthColor = (strength) => {
    const colors = ['#ff4757', '#ff6b7d', '#ffa726', '#66bb6a', '#43a047'];
    return colors[strength] || '#ff4757';
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-title">
          <FiSettings className="settings-icon" />
          <h1>Settings</h1>
        </div>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <div className="settings-nav">
            <div 
              className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <FiUser className="nav-icon" />
              <span>Profile Information</span>
              <FiChevronRight className="nav-arrow" />
            </div>
            <div 
              className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <FiShield className="nav-icon" />
              <span>Security & Privacy</span>
              <FiChevronRight className="nav-arrow" />
            </div>
          </div>
        </div>

        <div className="settings-main">
          {activeSection === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Profile Information</h2>
                <p>View your account details and information</p>
              </div>

              <div className="profile-card">
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="profile-info">
                    <h3>{currentUser?.name || 'User'}</h3>
                    <span className="profile-role">{currentUser?.role || 'User'}</span>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="detail-item">
                    <FiUser className="detail-icon" />
                    <div className="detail-content">
                      <label>Full Name</label>
                      <span>{currentUser?.name || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <div className="detail-content">
                      <label>Email Address</label>
                      <span>{currentUser?.email || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FiShield className="detail-icon" />
                    <div className="detail-content">
                      <label>Role</label>
                      <span className="role-badge">{currentUser?.role || 'User'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Security & Privacy</h2>
                <p>Manage your password and security preferences</p>
              </div>

              <div className="security-card">
                <div className="password-section">
                  <div className="password-header">
                    <FiLock className="password-icon" />
                    <div>
                      <h3>Change Password</h3>
                      <p>Update your password to keep your account secure</p>
                    </div>
                  </div>

                  {message.text && (
                    <div className={`message ${message.type}`}>
                      {message.type === 'success' ? <FiCheck /> : <FiX />}
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('current')}
                        >
                          {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter your new password"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {passwordData.newPassword && (
                        <div className="password-strength">
                          <div className="strength-bar">
                            <div 
                              className="strength-fill"
                              style={{ 
                                width: `${(passwordStrength(passwordData.newPassword) / 4) * 100}%`,
                                backgroundColor: getStrengthColor(passwordStrength(passwordData.newPassword))
                              }}
                            />
                          </div>
                          <span 
                            className="strength-label"
                            style={{ color: getStrengthColor(passwordStrength(passwordData.newPassword)) }}
                          >
                            {getStrengthLabel(passwordStrength(passwordData.newPassword))}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm your new password"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {passwordData.confirmPassword && (
                        <div className={`password-match ${passwordData.newPassword === passwordData.confirmPassword ? 'match' : 'no-match'}`}>
                          {passwordData.newPassword === passwordData.confirmPassword ? (
                            <>
                              <FiCheck className="match-icon" />
                              <span>Passwords match</span>
                            </>
                          ) : (
                            <>
                              <FiX className="match-icon" />
                              <span>Passwords do not match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="password-requirements">
                      <h4>Password Requirements:</h4>
                      <ul>
                        <li className={passwordData.newPassword.length >= 6 ? 'met' : ''}>
                          At least 6 characters
                        </li>
                        <li className={passwordData.newPassword !== passwordData.currentPassword && passwordData.newPassword ? 'met' : ''}>
                          Different from current password
                        </li>
                        <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'met' : ''}>
                          Passwords match
                        </li>
                      </ul>
                    </div>

                    <button 
                      type="submit" 
                      className="change-password-btn"
                      disabled={isChangingPassword}
                    >
                      <FiLock />
                      {isChangingPassword ? "Changing Password..." : "Change Password"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;