import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";


function Dashboard() {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [studentFormData, setStudentFormData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  // Listen for storage changes to refresh when user submits form
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes('studentFormData_') || e.key.includes('studentData_'))) {
        // Refresh user data when form data is updated
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events within the same window
    const handleCustomRefresh = () => {
      loadUserData();
    };
    
    window.addEventListener('studentDataUpdated', handleCustomRefresh);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studentDataUpdated', handleCustomRefresh);
    };
  }, []);

  const loadUserData = () => {
    // Get current user data from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      // Clear any cached data that might belong to other users
      clearOtherUsersData(user.email);
      
      // Get detailed student data if available for this specific user
      let detailedData = localStorage.getItem(`studentData_${user.email}`);
      if (detailedData) {
        setStudentData(JSON.parse(detailedData));
      } else {
        // Check for old general studentFormData and migrate if it belongs to current user
        const oldStudentData = localStorage.getItem('studentFormData');
        if (oldStudentData) {
          const parsedStudentData = JSON.parse(oldStudentData);
          if (parsedStudentData.email === user.email) {
            localStorage.setItem(`studentData_${user.email}`, oldStudentData);
            setStudentData(parsedStudentData);
          }
        }
      }
      
      // Get student form data for profile image (only for current user)
      const formData = localStorage.getItem(`studentFormData_${user.email}`);
      if (formData) {
        setStudentFormData(JSON.parse(formData));
      } else {
        // Check for old general studentFormData and migrate if it belongs to current user
        const oldFormData = localStorage.getItem('studentFormData');
        if (oldFormData) {
          const parsedFormData = JSON.parse(oldFormData);
          if (parsedFormData.email === user.email) {
            localStorage.setItem(`studentFormData_${user.email}`, oldFormData);
            setStudentFormData(parsedFormData);
          }
          localStorage.removeItem('studentFormData'); // Clean up old general storage
        }
      }
      
      // Fetch profile image from backend
      fetchProfileImageFromBackend(user);
    }
  };

  const clearOtherUsersData = (currentUserEmail) => {
    // Clear any general cached form data that might not belong to current user
    const formData = localStorage.getItem('studentFormData');
    if (formData) {
      const parsedFormData = JSON.parse(formData);
      if (parsedFormData.email !== currentUserEmail) {
        localStorage.removeItem('studentFormData');
        setStudentFormData(null);
      }
    }
    
    // Clear profile image if it was for a different user
    setProfileImage(null);
  };

  const fetchProfileImageFromBackend = async (user) => {
    setLoading(true);
    try {
      // Clear any cached profile image first
      setProfileImage(null);
      
      // Strategy 1: Try to find by login email
      let response = await fetch(`http://localhost:8081/api/student-details/profile-image/email/${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.profileImage) {
          setProfileImage(result.profileImage);
          return;
        }
      }
      
      // Strategy 2: Try to find by name matching
      const nameResponse = await fetch(`http://localhost:8081/api/student-details/search/${encodeURIComponent(user.name)}`);
      if (nameResponse.ok) {
        const nameResult = await nameResponse.json();
        if (nameResult && nameResult.length > 0) {
          // Find student with profile image
          const studentWithImage = nameResult.find(student => student.profileImage);
          if (studentWithImage && studentWithImage.profileImage) {
            setProfileImage(studentWithImage.profileImage);
            return;
          }
        }
      }
      
    } catch (error) {
      console.error('Error fetching profile image:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleViewReports = () => {
    navigate('/student/reports');
  };

  const handleViewQRCode = () => {
    navigate('/student/qrcode');
  };
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back to your health portal</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="greeting">
                Hello, {currentUser?.name || studentData?.fullName || 'Student'}!
              </span>
              <div className="user-status">
                <span className="status-dot"></span>
                <span className="status-text">Active</span>
              </div>
            </div>
            <div className="avatar-container">
              {!currentUser ? (
                <div className="avatar-na">
                  <span className="na-text">NA</span>
                </div>
              ) : loading ? (
                <div className="avatar-loading">
                  <span>...</span>
                </div>
              ) : (profileImage || studentFormData?.profileImage || studentData?.profileImage) ? (
                <img
                  src={profileImage || studentFormData?.profileImage || studentData?.profileImage}
                  alt={currentUser?.name || studentData?.fullName || 'Student'}
                  className="dashboard-avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-initials">
                    {(currentUser?.name || studentData?.fullName || 'Student').split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Quick Actions Section */}
        <section className="quick-actions">
          <div className="quick-actions-grid">
            <div className="action-card">
              <div className="action-icon health">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 14C19 18.4183 12 23 12 23C12 23 5 18.4183 5 14C5 9.58172 8.13401 6 12 6C15.866 6 19 9.58172 19 14Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="action-title">Medical Reports</h3>
              <p className="action-description">View your health history</p>
              <button className="action-btn" onClick={handleViewReports}>View Reports</button>
            </div>


            <div className="action-card">
              <div className="action-icon profile">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="action-title">Update Profile</h3>
              <p className="action-description">Keep your information current and accurate</p>
              <a href="/student/entering-details" className="action-btn">Update</a>
            </div>

            <div className="action-card">
              <div className="action-icon qr">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
                  <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
                  <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="action-title">QR Code</h3>
              <p className="action-description">Quick access ID for medical appointments</p>
              <button className="action-btn" onClick={handleViewQRCode}>View QR</button>
            </div>
          </div>
        </section>

        {/* Student Information Card - Full Width */}
        <section className="info-card">
          <div className="card-header">
            <h2 className="card-title">Personal Information</h2>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          
          {!currentUser ? (
            <div className="no-user-notice">
              <div className="notice-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Authentication Required</h3>
              <p>Please log in to view your student information and access all features.</p>
              <a href="/login" className="notice-btn">
                Login to Continue
              </a>
            </div>
          ) : !studentData ? (
            <div className="incomplete-profile-notice">
              <div className="notice-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Complete Your Profile</h3>
              <p>Enhance your healthcare experience by completing your medical profile.</p>
              <a href="/student/entering-details" className="notice-btn">
                Complete Profile
              </a>
            </div>
          ) : (
            <div className="student-details">
              <div className="details-grid">
                <div className="detail-group">
                  <div className="detail-row">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">
                      {studentData?.fullName || currentUser?.name || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Student ID</span>
                    <span className="detail-value">
                      {studentData?.studentRegistrationNumber || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">
                      {studentData?.email || currentUser?.email || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Academic Division</span>
                    <span className="detail-value">
                      {studentData?.academicDivision ? 
                        studentData.academicDivision.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                        'Not provided'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="detail-group">
                  <div className="detail-row">
                    <span className="detail-label">Age</span>
                    <span className="detail-value">
                      {studentData?.age || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Gender</span>
                    <span className="detail-value">
                      {studentData?.gender ? 
                        studentData.gender.charAt(0).toUpperCase() + studentData.gender.slice(1) : 
                        'Not provided'
                      }
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Contact Number</span>
                    <span className="detail-value">
                      {studentData?.telephoneNumber || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Emergency Contact</span>
                    <span className="detail-value">
                      {studentData?.emergencyName ? 
                        `${studentData.emergencyName} (${studentData.emergencyTelephone || 'No phone'})` : 
                        'Not provided'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;