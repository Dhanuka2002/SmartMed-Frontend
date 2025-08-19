import React, { useState, useEffect } from "react";
import "./StudentDashboard.css";
import qrCode from "../../../assets/qr.png";
import studentAvatar from "../../../assets/student.jpg";
import doctorImage from "../../../assets/doctors.png";
import Avatar from "../../common/Avatar/Avatar";

function Dashboard() {
  const [studentData, setStudentData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [studentFormData, setStudentFormData] = useState(null);

  useEffect(() => {
    // Get current user data from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Get detailed student data if available
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.email) {
      const detailedData = localStorage.getItem(`studentData_${user.email}`);
      if (detailedData) {
        setStudentData(JSON.parse(detailedData));
      }
    }
    
    // Get student form data for profile image
    const formData = localStorage.getItem('studentFormData');
    if (formData) {
      setStudentFormData(JSON.parse(formData));
    }
  }, []);
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
              {(studentFormData?.profileImage || studentData?.profileImage) ? (
                <img 
                  src={studentFormData?.profileImage || studentData?.profileImage}
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
        {/* Student Information Card */}
        <section className="info-card">
          <div className="card-header">
            <h2 className="card-title">Student Information</h2>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          
          {!studentData && currentUser && (
            <div className="incomplete-profile-notice">
              <p>Complete your medical profile to access all features.</p>
              <a href="/student/entering-details" className="complete-profile-btn">
                Complete Profile
              </a>
            </div>
          )}
          
          {!currentUser && (
            <div className="no-user-notice">
              <p>Please log in to view your student information.</p>
              <a href="/login" className="login-btn">
                Login
              </a>
            </div>
          )}
          <div className="student-details">
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
              <span className="detail-label">Email</span>
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
        </section>

        {/* QR Code Card */}
        <section className="qr-card">
          <div className="card-header">
            <h2 className="card-title">Quick Access QR</h2>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="5" y="5" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="15" y="5" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="5" y="15" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="13" y="13" width="2" height="2" fill="currentColor"/>
                <rect x="17" y="13" width="2" height="2" fill="currentColor"/>
                <rect x="19" y="13" width="2" height="2" fill="currentColor"/>
                <rect x="13" y="17" width="2" height="2" fill="currentColor"/>
                <rect x="19" y="17" width="2" height="2" fill="currentColor"/>
                <rect x="17" y="19" width="2" height="2" fill="currentColor"/>
                <rect x="19" y="19" width="2" height="2" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div className="qr-content">
            <div className="qr-code-container">
              <img src={qrCode} alt="Student QR Code" className="qr-image" />
            </div>
            <p className="qr-description">Scan this code for quick check-in at medical appointments</p>
          </div>
        </section>

     
      </main>
    </div>
  );
}

export default Dashboard;