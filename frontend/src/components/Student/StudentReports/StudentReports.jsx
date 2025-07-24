import React from "react";
import "./StudentReports.css";
import qrCode from "../../../assets/qr.png";
import studentAvatar from "../../../assets/student.jpg";

function StudentReports() {
  const allergies = ["Penicillin", "Rash", "Peanuts", "Shellfish"];
  const vaccinations = [
    { name: "COVID-19 (Pfizer)", date: "2023/02/18", status: "Complete" },
    { name: "Hepatitis B", date: "2022/08/15", status: "Complete" },
    { name: "Tetanus", date: "2022/03/10", status: "Complete" },
  ];

  return (
    <div className="student-reports">
   

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
              <h2 className="student-name">Franklin Jhon</h2>
              <p className="student-id">Student ID: 22IT099</p>
              <p className="student-division">Information Technology</p>
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
          <div className="stat-card blood-group">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <span className="stat-label">Blood Group</span>
              <span className="stat-value">O+</span>
            </div>
          </div>
          <div className="stat-card age">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <span className="stat-label">Age</span>
              <span className="stat-value">25 years</span>
            </div>
          </div>
          <div className="stat-card gender">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <span className="stat-label">Gender</span>
              <span className="stat-value">Male</span>
            </div>
          </div>
          <div className="stat-card dob">
            <div className="stat-icon">🎂</div>
            <div className="stat-content">
              <span className="stat-label">Date of Birth</span>
              <span className="stat-value">Dec 1, 2001</span>
            </div>
          </div>
        </div>

        {/* Physical Stats */}
        <div className="physical-stats">
          <div className="physical-card">
            <h3 className="card-title">Physical Statistics</h3>
            <div className="physical-grid">
              <div className="physical-item">
                <span className="physical-label">Weight</span>
                <span className="physical-value">70 kg</span>
              </div>
              <div className="physical-item">
                <span className="physical-label">Height</span>
                <span className="physical-value">170 cm</span>
              </div>
              <div className="physical-item">
                <span className="physical-label">BMI</span>
                <span className="physical-value bmi-normal">24.2</span>
              </div>
              <div className="physical-item">
                <span className="physical-label">Status</span>
                <span className="physical-value status-healthy">Healthy</span>
              </div>
            </div>
          </div>
        </div>
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
          <div className="emergency-info">
            <span className="emergency-label">Primary Contact:</span>
            <span className="emergency-value">Dr. Sarah Johnson</span>
          </div>
          <div className="emergency-info">
            <span className="emergency-label">Phone:</span>
            <span className="emergency-value">+1 (555) 123-4567</span>
          </div>
          <div className="emergency-info">
            <span className="emergency-label">Relationship:</span>
            <span className="emergency-value">Family Doctor</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentReports;