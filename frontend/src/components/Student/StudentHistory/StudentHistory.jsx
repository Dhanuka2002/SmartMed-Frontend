import React from "react";
import "./StudentHistory.css";
import qrCode from "../../../assets/qr.png";
import studentAvatar from "../../../assets/student.jpg";

function StudentHistory() {
  const allergies = ["Penicillin", "Shellfish", "Peanuts", "Latex"];
  const vaccinations = [
    { name: "COVID-19 (Pfizer)", date: "2023/02/18", status: "Complete" },
    { name: "Hepatitis B", date: "2022/08/15", status: "Complete" },
    { name: "MMR", date: "2021/05/10", status: "Complete" },
    { name: "Tetanus", date: "2020/11/22", status: "Complete" },
  ];

  return (
    <div className="student-history-container">
      {/* Header */}
      <div className="page-header">
        <h1>Medical History</h1>
        <p>Student health information and vaccination records</p>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-main">
          <div className="avatar-section">
            <img src={studentAvatar} alt="Student Avatar" className="student-avatar" />
            <div className="student-info">
              <h2>Franklin John</h2>
              <div className="student-meta">
                <span className="student-id">ID: 22IT099</span>
                <span className="division-badge">IT Division</span>
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
            <div className="emergency-grid">
              <div className="emergency-item">
                <label>Emergency Contact:</label>
                <span>John Doe (Father) - +94 77 123 4567</span>
              </div>
              <div className="emergency-item">
                <label>Blood Type:</label>
                <span className="blood-type">O+</span>
              </div>
              <div className="emergency-item">
                <label>Medical Insurance:</label>
                <span>Policy #: MED-2024-001</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHistory;