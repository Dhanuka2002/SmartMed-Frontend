/*import React from "react";
import "./DoctorPatient.css";
import qr from "../../../assets/qr.png";
import patientAvatar from "../../../assets/student.jpg"; // Replace with your actual avatar image path

function DoctorPatient() {
  return (
    <div className="doctor-patient-container">
      <div className="patient-header">
        <div className="patient-avatar">
          <img src={patientAvatar} alt="Patient Avatar" />
          <h3>Franklin Jhon</h3>
        </div>

        <div className="patient-profile-box">
          <h4>Franklin Jhon</h4>
          <p>ID: 22IT099</p>
          <p>Division: IT</p>
          <p>Allergies: Penicillin</p>
          <img src={qr} alt="QR Code" className="qr-img" />
          <button className="health-history-btn">Health History</button>
        </div>
      </div>

      <div className="prescription-box">
        <h4>Prescription</h4>
        <textarea placeholder="Write prescription here..."></textarea>
        <button className="esign-btn">e - Sign</button>
      </div>
    </div>
  );
}

export default DoctorPatient;
*/


import React, { useState } from "react";
import "./DoctorPatient.css";
import qr from "../../../assets/qr.png";
import patientAvatar from "../../../assets/student.jpg";

function DoctorPatient() {
  const [prescriptionText, setPrescriptionText] = useState("");
  const [activeTab, setActiveTab] = useState("prescription");
  const [vitals, setVitals] = useState({
    bloodPressure: "120/80",
    heartRate: "72 bpm",
    temperature: "98.6°F",
    weight: "70 kg",
    height: "175 cm"
  });

  const patientInfo = {
    name: "Franklin Jhon",
    id: "22IT099",
    age: 24,
    gender: "Male",
    division: "IT Department",
    phone: "+94 77 123 4567",
    email: "franklin.jhon@company.com",
    allergies: ["Penicillin", "Shellfish"],
    bloodType: "O+",
    lastVisit: "2025-06-15",
    emergencyContact: "+94 71 987 6543"
  };

  const medicalHistory = [
    { date: "2025-06-15", condition: "Annual Check-up", doctor: "Dr. Smith" },
    { date: "2025-03-22", condition: "Common Cold", doctor: "Dr. Johnson" },
    { date: "2024-11-10", condition: "Vaccination", doctor: "Dr. Brown" }
  ];

  const commonPrescriptions = [
    "Paracetamol 500mg - Take 1 tablet twice daily for 3 days",
    "Amoxicillin 250mg - Take 1 capsule three times daily for 7 days",
    "Ibuprofen 400mg - Take 1 tablet as needed for pain",
    "Vitamin D3 1000IU - Take 1 tablet daily"
  ];

  const handlePrescriptionAdd = (prescription) => {
    const newText = prescriptionText ? 
      `${prescriptionText}\n• ${prescription}` : 
      `• ${prescription}`;
    setPrescriptionText(newText);
  };

  const handleSign = () => {
    if (!prescriptionText.trim()) {
      alert("Please add prescription details before signing.");
      return;
    }
    alert("Prescription signed successfully!");
  };

  return (
    <div className="doctor-patient-container">
      {/* Patient Header Section */}
      <div className="patient-header-section">
        <div className="patient-card">
          <div className="patient-avatar-section">
            <div className="avatar-container">
              <img src={patientAvatar} alt="Patient Avatar" className="patient-avatar-img" />
              <div className="status-indicator online"></div>
            </div>
            <div className="patient-basic-info">
              <h2 className="patient-name">{patientInfo.name}</h2>
              <p className="patient-id">Patient ID: {patientInfo.id}</p>
              <div className="patient-tags">
                <span className="tag priority">Priority</span>
                <span className="tag division">{patientInfo.division}</span>
              </div>
            </div>
          </div>

          <div className="patient-details-grid">
            <div className="detail-card">
              <div className="detail-icon">👤</div>
              <div className="detail-content">
                <span className="detail-label">Age & Gender</span>
                <span className="detail-value">{patientInfo.age} years, {patientInfo.gender}</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">🩸</div>
              <div className="detail-content">
                <span className="detail-label">Blood Type</span>
                <span className="detail-value">{patientInfo.bloodType}</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">⚠️</div>
              <div className="detail-content">
                <span className="detail-label">Allergies</span>
                <span className="detail-value">{patientInfo.allergies.join(", ")}</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">📞</div>
              <div className="detail-content">
                <span className="detail-label">Contact</span>
                <span className="detail-value">{patientInfo.phone}</span>
              </div>
            </div>
          </div>

          <div className="qr-section">
            <div className="qr-container">
              <img src={qr} alt="Patient QR Code" className="qr-code" />
              <p className="qr-label">Patient QR Code</p>
            </div>
            <button className="action-btn secondary">
              <span className="btn-icon">📋</span>
              View Full Profile
            </button>
          </div>
        </div>
      </div>

      {/* Vitals Section */}
      <div className="vitals-section">
        <h3 className="section-title">Current Vitals</h3>
        <div className="vitals-grid">
          <div className="vital-card">
            <div className="vital-icon">❤️</div>
            <div className="vital-info">
              <span className="vital-label">Heart Rate</span>
              <span className="vital-value">{vitals.heartRate}</span>
            </div>
          </div>
          
          <div className="vital-card">
            <div className="vital-icon">🌡️</div>
            <div className="vital-info">
              <span className="vital-label">Temperature</span>
              <span className="vital-value">{vitals.temperature}</span>
            </div>
          </div>
          
          <div className="vital-card">
            <div className="vital-icon">📈</div>
            <div className="vital-info">
              <span className="vital-label">Blood Pressure</span>
              <span className="vital-value">{vitals.bloodPressure}</span>
            </div>
          </div>
          
          <div className="vital-card">
            <div className="vital-icon">⚖️</div>
            <div className="vital-info">
              <span className="vital-label">Weight</span>
              <span className="vital-value">{vitals.weight}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="content-tabs">
        <div className="tab-header">
          <button 
            className={`tab-btn ${activeTab === "prescription" ? "active" : ""}`}
            onClick={() => setActiveTab("prescription")}
          >
            📝 Prescription
          </button>
          <button 
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📚 Medical History
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "prescription" && (
            <div className="prescription-section">
              <div className="prescription-header">
                <h3 className="section-title">Write Prescription</h3>
                <div className="prescription-date">
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="prescription-content">
                <div className="prescription-form">
                  <div className="form-group">
                    <label className="form-label">Prescription Details</label>
                    <textarea
                      className="prescription-textarea"
                      placeholder="Enter prescription details here..."
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      rows="8"
                    />
                  </div>

                  <div className="quick-prescription">
                    <h4 className="quick-title">Quick Add Common Prescriptions:</h4>
                    <div className="quick-buttons">
                      {commonPrescriptions.map((prescription, index) => (
                        <button
                          key={index}
                          className="quick-btn"
                          onClick={() => handlePrescriptionAdd(prescription)}
                        >
                          + {prescription.split(" - ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="prescription-actions">
                    <button className="action-btn secondary">
                      <span className="btn-icon">💾</span>
                      Save Draft
                    </button>
                    <button className="action-btn primary" onClick={handleSign}>
                      <span className="btn-icon">✍️</span>
                      e-Sign & Complete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="history-section">
              <h3 className="section-title">Medical History</h3>
              <div className="history-list">
                {medicalHistory.map((record, index) => (
                  <div key={index} className="history-item">
                    <div className="history-date">
                      <span className="date">{record.date}</span>
                    </div>
                    <div className="history-details">
                      <h4 className="history-condition">{record.condition}</h4>
                      <p className="history-doctor">Treated by: {record.doctor}</p>
                    </div>
                    <button className="history-view-btn">View Details</button>
                  </div>
                ))}
              </div>
              
              <button className="action-btn secondary full-width">
                <span className="btn-icon">📄</span>
                View Complete Medical Records
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPatient;