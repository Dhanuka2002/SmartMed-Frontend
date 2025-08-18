import React, { useState, useEffect } from "react";
import "./StudentHistory.css";
import qrCode from "../../../assets/qr.png";
import studentAvatar from "../../../assets/student.jpg";
import Avatar from "../../common/Avatar/Avatar";

function StudentHistory() {
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

  // Extract allergies from medical history
  const getAllergies = () => {
    if (!studentData?.medicalHistory?.allergicHistory) return [];
    
    const allergicHistory = studentData.medicalHistory.allergicHistory;
    if (allergicHistory.status === "yes" && allergicHistory.details) {
      return allergicHistory.details.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
    return [];
  };

  // Extract vaccination data
  const getVaccinations = () => {
    if (!studentData?.vaccinations) return [];
    
    const vaccinations = [];
    Object.entries(studentData.vaccinations).forEach(([vaccine, date]) => {
      if (date) {
        vaccinations.push({
          name: vaccine.toUpperCase(),
          date: date,
          status: "Complete"
        });
      }
    });
    return vaccinations;
  };

  const allergies = getAllergies();
  const vaccinations = getVaccinations();

  return (
    <div className="student-history-container">
      {/* Header */}
      <div className="page-header">
        <h1>Medical History</h1>
        <p>Student health information and vaccination records</p>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        {!currentUser ? (
          <div className="no-user-notice">
            <p>Please log in to view your medical history.</p>
            <a href="/login" className="login-btn">Login</a>
          </div>
        ) : (
          <div className="profile-main">
            <div className="avatar-section">
              <Avatar 
                src={studentFormData?.profileImage || studentData?.profileImage}
                alt={studentData?.fullName || currentUser?.name || 'Student'}
                size="large"
                className="student-avatar"
              />
              <div className="student-info">
                <h2>{studentData?.fullName || currentUser?.name || 'Student Name'}</h2>
                <div className="student-meta">
                  <span className="student-id">
                    ID: {studentData?.studentRegistrationNumber || 'Not provided'}
                  </span>
                  <span className="division-badge">
                    {studentData?.academicDivision ? 
                      studentData.academicDivision.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                      'Academic Division'
                    }
                  </span>
                </div>
                <div className="additional-info">
                  <span className="email-info">
                    📧 {studentData?.email || currentUser?.email || 'No email'}
                  </span>
                  <span className="age-info">
                    👤 Age: {studentData?.age || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
            <div className="qr-section">
              <div className="qr-container">
                <img src={qrCode} alt="QR Code" className="qr-code" />
                <p>Scan for quick access</p>
              </div>
            </div>
          </div>
        )}
        
        {!studentData && currentUser && (
          <div className="incomplete-profile-notice">
            <p>Complete your medical profile to view detailed history.</p>
            <a href="/student/entering-details" className="complete-profile-btn">
              Complete Medical Profile
            </a>
          </div>
        )}
      </div>

      {/* Medical Information Grid */}
      <div className="medical-grid">
        {/* Allergies Section */}
        <div className="medical-card allergies-card">
          <div className="card-header">
            <div className="header-icon allergies-icon">⚠️</div>
            <h3>Known Allergies</h3>
          </div>
          <div className="card-content">
            {allergies.length > 0 ? (
              <div className="allergies-list">
                {allergies.map((allergy, index) => (
                  <div key={index} className="allergy-item">
                    <span className="allergy-dot"></span>
                    <span>{allergy}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No known allergies</p>
            )}
          </div>
        </div>

        {/* Vaccination History Section */}
        <div className="medical-card vaccination-card">
          <div className="card-header">
            <div className="header-icon vaccination-icon">💉</div>
            <h3>Vaccination History</h3>
          </div>
          <div className="card-content">
            <div className="vaccination-table-container">
              <table className="vaccination-table">
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((vaccine, index) => (
                    <tr key={index}>
                      <td className="vaccine-name">{vaccine.name}</td>
                      <td className="vaccine-date">{vaccine.date}</td>
                      <td>
                        <span className="status-badge complete">
                          {vaccine.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact Info */}
      <div className="emergency-section">
        <div className="emergency-card">
          <div className="card-header">
            <div className="header-icon emergency-icon">🚨</div>
            <h3>Emergency Information</h3>
          </div>
          <div className="card-content">
            {studentData ? (
              <div className="emergency-grid">
                <div className="emergency-item">
                  <label>Emergency Contact:</label>
                  <span>
                    {studentData.emergencyName || 'Not provided'} 
                    {studentData.emergencyRelationship && ` (${studentData.emergencyRelationship.charAt(0).toUpperCase() + studentData.emergencyRelationship.slice(1)})`} 
                    {studentData.emergencyTelephone && ` - ${studentData.emergencyTelephone}`}
                  </span>
                </div>
                <div className="emergency-item">
                  <label>Contact Address:</label>
                  <span>{studentData.emergencyAddress || 'Not provided'}</span>
                </div>
                <div className="emergency-item">
                  <label>Student Phone:</label>
                  <span>{studentData.telephoneNumber || 'Not provided'}</span>
                </div>
                <div className="emergency-item">
                  <label>Home Address:</label>
                  <span>{studentData.homeAddress || 'Not provided'}</span>
                </div>
                <div className="emergency-item">
                  <label>Nationality:</label>
                  <span>{studentData.nationality ? studentData.nationality.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not provided'}</span>
                </div>
                <div className="emergency-item">
                  <label>Gender:</label>
                  <span>{studentData.gender ? studentData.gender.charAt(0).toUpperCase() + studentData.gender.slice(1) : 'Not provided'}</span>
                </div>
              </div>
            ) : (
              <div className="no-emergency-data">
                <p>Complete your medical profile to view emergency information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHistory;