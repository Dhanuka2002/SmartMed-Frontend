import React, { useState, useEffect } from "react";
import "./StudentReports.css";
import qrCode from "../../../assets/qr.png";
import studentAvatar from "../../../assets/student.jpg";

function StudentReports() {
  const [studentData, setStudentData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
    return vaccinations.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get medical conditions count
  const getMedicalConditionsData = () => {
    if (!studentData?.medicalHistory) return { total: 0, conditions: [] };
    
    const conditions = [];
    let totalConditions = 0;
    
    Object.entries(studentData.medicalHistory).forEach(([key, value]) => {
      if (value.status === "yes") {
        totalConditions++;
        conditions.push({
          name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          details: value.details || 'No details provided'
        });
      }
    });
    
    return { total: totalConditions, conditions };
  };

  const allergies = getAllergies();
  const vaccinations = getVaccinations();
  const medicalConditions = getMedicalConditionsData();

  return (
    <div className="student-reports">
      {!currentUser ? (
        <div className="no-user-notice">
          <h2>Please log in to view your medical reports</h2>
          <a href="/login" className="login-btn">Login</a>
        </div>
      ) : (
        <>
          {/* Main Profile Card */}
          <div className="profile-card">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-info">
                <div className="avatar-container">
                  <img src={studentAvatar} alt="Student" className="student-avatar" />
                  <div className="avatar-status"></div>
                </div>
                <div className="student-details">
                  <h2 className="student-name">
                    {studentData?.fullName || currentUser?.name || 'Student Name'}
                  </h2>
                  <p className="student-id">
                    Student ID: {studentData?.studentRegistrationNumber || 'Not provided'}
                  </p>
                  <p className="student-division">
                    {studentData?.academicDivision ? 
                      studentData.academicDivision.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                      'Academic Division'
                    }
                  </p>
                </div>
              </div>
              <div className="qr-section">
                <div className="qr-container">
                  <img src={qrCode} alt="QR Code" className="qr-code" />
                </div>
                <p className="qr-label">Scan for details</p>
              </div>
            </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card allergies-count">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <span className="stat-label">Known Allergies</span>
              <span className="stat-value">{allergies.length}</span>
            </div>
          </div>
          <div className="stat-card age">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <span className="stat-label">Age</span>
              <span className="stat-value">
                {studentData?.age || (studentData?.dateOfBirth ? calculateAge(studentData.dateOfBirth) : 'Not provided')} 
                {(studentData?.age || calculateAge(studentData?.dateOfBirth)) && ' years'}
              </span>
            </div>
          </div>
          <div className="stat-card gender">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <span className="stat-label">Gender</span>
              <span className="stat-value">
                {studentData?.gender ? 
                  studentData.gender.charAt(0).toUpperCase() + studentData.gender.slice(1) : 
                  'Not provided'
                }
              </span>
            </div>
          </div>
          <div className="stat-card vaccinations-count">
            <div className="stat-icon">💉</div>
            <div className="stat-content">
              <span className="stat-label">Vaccinations</span>
              <span className="stat-value">{vaccinations.length}</span>
            </div>
          </div>
        </div>

        {/* Health Overview Charts */}
        <div className="health-charts">
          <div className="chart-card">
            <h3 className="chart-title">Health Overview</h3>
            <div className="chart-content">
              <div className="health-summary">
                <div className="health-metric">
                  <div className="metric-circle">
                    <div className="circle-progress" style={{
                      background: `conic-gradient(#4CAF50 ${((vaccinations.length / 6) * 360)}deg, #e0e0e0 0deg)`
                    }}>
                      <span className="metric-value">{Math.round((vaccinations.length / 6) * 100)}%</span>
                    </div>
                    <span className="metric-label">Vaccination Coverage</span>
                  </div>
                </div>
                <div className="health-metric">
                  <div className="metric-circle">
                    <div className="circle-progress" style={{
                      background: `conic-gradient(${allergies.length > 0 ? '#FF9800' : '#4CAF50'} ${allergies.length > 3 ? 270 : allergies.length * 90}deg, #e0e0e0 0deg)`
                    }}>
                      <span className="metric-value">{allergies.length}</span>
                    </div>
                    <span className="metric-label">Allergies</span>
                  </div>
                </div>
                <div className="health-metric">
                  <div className="metric-circle">
                    <div className="circle-progress" style={{
                      background: `conic-gradient(${medicalConditions.total > 0 ? '#F44336' : '#4CAF50'} ${medicalConditions.total * 60}deg, #e0e0e0 0deg)`
                    }}>
                      <span className="metric-value">{medicalConditions.total}</span>
                    </div>
                    <span className="metric-label">Medical Conditions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vaccination Timeline */}
        {vaccinations.length > 0 && (
          <div className="timeline-chart">
            <h3 className="chart-title">Vaccination Timeline</h3>
            <div className="timeline-content">
              {vaccinations.map((vaccination, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content-item">
                    <div className="timeline-header">
                      <span className="vaccine-name">{vaccination.name}</span>
                      <span className="vaccine-date">{vaccination.date}</span>
                    </div>
                    <div className="timeline-bar">
                      <div className="bar-fill" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Medical Information */}
      <div className="medical-grid">
        {/* Allergies Card */}
        <div className="medical-card allergies-card">
          <div className="card-header">
            <div className="card-icon allergies-icon">⚠️</div>
            <h3 className="card-title">Known Allergies</h3>
          </div>
          <div className="card-content">
            {allergies.length > 0 ? (
              <div className="allergies-list">
                {allergies.map((allergy, index) => (
                  <div key={index} className="allergy-item">
                    <span className="allergy-dot"></span>
                    <span className="allergy-name">{allergy}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No known allergies</p>
            )}
          </div>
        </div>

        {/* Vaccination Card */}
        <div className="medical-card vaccination-card">
          <div className="card-header">
            <div className="card-icon vaccination-icon">💉</div>
            <h3 className="card-title">Vaccination History</h3>
          </div>
          <div className="card-content">
            <div className="vaccination-table">
              <div className="table-header">
                <span>Vaccination</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              {vaccinations.map((vaccination, index) => (
                <div key={index} className="table-row">
                  <span className="vaccination-name">{vaccination.name}</span>
                  <span className="vaccination-date">{vaccination.date}</span>
                  <span className={`vaccination-status status-${vaccination.status.toLowerCase()}`}>
                    {vaccination.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="emergency-card">
        <div className="card-header">
          <div className="card-icon emergency-icon">🚨</div>
          <h3 className="card-title">Emergency Contact</h3>
        </div>
        <div className="emergency-content">
          {studentData ? (
            <>
              <div className="emergency-info">
                <span className="emergency-label">Primary Contact:</span>
                <span className="emergency-value">
                  {studentData.emergencyName || 'Not provided'}
                </span>
              </div>
              <div className="emergency-info">
                <span className="emergency-label">Phone:</span>
                <span className="emergency-value">
                  {studentData.emergencyTelephone || 'Not provided'}
                </span>
              </div>
              <div className="emergency-info">
                <span className="emergency-label">Relationship:</span>
                <span className="emergency-value">
                  {studentData.emergencyRelationship ? 
                    studentData.emergencyRelationship.charAt(0).toUpperCase() + studentData.emergencyRelationship.slice(1) : 
                    'Not provided'
                  }
                </span>
              </div>
              <div className="emergency-info">
                <span className="emergency-label">Address:</span>
                <span className="emergency-value">
                  {studentData.emergencyAddress || 'Not provided'}
                </span>
              </div>
            </>
          ) : (
            <div className="no-emergency-data">
              <p>Complete your medical profile to view emergency contact information.</p>
              <a href="/student/entering-details" className="complete-profile-btn">
                Complete Profile
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Medical Conditions Summary */}
      {medicalConditions.total > 0 && (
        <div className="conditions-summary">
          <div className="card-header">
            <div className="card-icon conditions-icon">📋</div>
            <h3 className="card-title">Medical Conditions Summary</h3>
          </div>
          <div className="conditions-content">
            {medicalConditions.conditions.map((condition, index) => (
              <div key={index} className="condition-item">
                <div className="condition-header">
                  <span className="condition-name">{condition.name}</span>
                  <span className="condition-status">Active</span>
                </div>
                <p className="condition-details">{condition.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!studentData && (
        <div className="incomplete-profile-notice">
          <h3>Complete Your Medical Profile</h3>
          <p>To see detailed medical reports and charts, please complete your medical profile.</p>
          <a href="/student/entering-details" className="complete-profile-btn">
            Complete Medical Profile
          </a>
        </div>
      )}
    </>
  )}
    </div>
  );
}

export default StudentReports;