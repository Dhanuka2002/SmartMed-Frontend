import React, { useState, useEffect } from "react";
import "./DoctorDashboard.css";
import qr from "../../../assets/qr.png";
import doctor from "../../../assets/doctor.jpg";

function DoctorDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const patients = [
    {
      id: "22IT099",
      name: "Franklin John",
      time: "09:00",
      status: "completed",
      age: 22,
      gender: "Male",
      division: "Information Technology",
      allergies: ["Penicillin", "Shellfish"],
      vitals: { bp: "120/80", temp: "98.6°F", pulse: "72 bpm", weight: "70 kg" },
      lastVisit: "2024-06-15",
      diagnosis: "Regular Checkup",
      priority: "routine"
    },
    {
      id: "22CS045",
      name: "Sarah Wilson",
      time: "09:30",
      status: "in-progress",
      age: 21,
      gender: "Female",
      division: "Computer Science",
      allergies: [],
      vitals: { bp: "118/75", temp: "99.1°F", pulse: "78 bpm", weight: "62 kg" },
      lastVisit: "2024-07-01",
      diagnosis: "Fever, Headache",
      priority: "urgent"
    },
    {
      id: "22ME067",
      name: "Michael Brown",
      time: "10:00",
      status: "waiting",
      age: 23,
      gender: "Male",
      division: "Mechanical Engineering",
      allergies: ["Aspirin"],
      vitals: { bp: "125/82", temp: "98.4°F", pulse: "75 bpm", weight: "78 kg" },
      lastVisit: "2024-05-20",
      diagnosis: "Back Pain",
      priority: "routine"
    },
    {
      id: "22EE034",
      name: "Emily Davis",
      time: "10:30",
      status: "waiting",
      age: 20,
      gender: "Female",
      division: "Electrical Engineering",
      allergies: ["Latex", "Ibuprofen"],
      vitals: { bp: "115/70", temp: "98.2°F", pulse: "68 bpm", weight: "55 kg" },
      lastVisit: "2024-06-30",
      diagnosis: "Skin Allergy",
      priority: "high"
    },
    {
      id: "22CE089",
      name: "James Miller",
      time: "11:00",
      status: "scheduled",
      age: 22,
      gender: "Male",
      division: "Civil Engineering",
      allergies: [],
      vitals: { bp: "122/78", temp: "98.5°F", pulse: "74 bpm", weight: "82 kg" },
      lastVisit: "2024-04-15",
      diagnosis: "Annual Physical",
      priority: "routine"
    }
  ];

  const currentPatient = patients[selectedPatient];
  const completedCount = patients.filter(p => p.status === 'completed').length;
  const waitingCount = patients.filter(p => p.status === 'waiting' || p.status === 'scheduled').length;

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'waiting': return '#f59e0b';
      case 'scheduled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'routine': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div className="medical-dashboard">
      {/* Top Navigation Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="clinic-logo">
            <div className="logo-icon">🏥</div>
            <div className="clinic-info">
              <h1>SmartMed</h1>
              <span>Healthcare Management System</span>
            </div>
          </div>
        </div>
        
        <div className="header-center">
          <div className="date-time">
            <div className="current-date">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            <div className="current-time">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: true,
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="doctor-profile">
            <img src={doctor} alt="Dr. Sarah Mitchell" className="doctor-avatar" />
            <div className="doctor-details">
              <span className="doctor-name">Dr. Sarah Mitchell</span>
              <span className="doctor-title">General Physician</span>
            </div>
          </div>
          <div className="notification-bell">
            <span>🔔</span>
            <div className="notification-badge">3</div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="dashboard-body">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{patients.length}</div>
              <div className="stat-label">Total Patients</div>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card waiting">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{waitingCount}</div>
              <div className="stat-label">Waiting</div>
            </div>
          </div>
          <div className="stat-card progress">
            <div className="stat-icon">🩺</div>
            <div className="stat-content">
              <div className="stat-number">1</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Patient Queue */}
          <div className="patient-queue-panel">
            <div className="panel-header">
              <h2>Patient Queue</h2>
              <div className="queue-controls">
                <button className="control-btn">↻ Refresh</button>
                <button className="control-btn">+ Add Patient</button>
              </div>
            </div>
            
            <div className="queue-container">
              {patients.map((patient, index) => (
                <div 
                  key={patient.id}
                  className={`queue-item ${patient.status} ${selectedPatient === index ? 'active' : ''}`}
                  onClick={() => setSelectedPatient(index)}
                >
                  <div className="queue-number">{index + 1}</div>
                  <div className="patient-summary">
                    <div className="patient-header">
                      <span className="patient-name">{patient.name}</span>
                      <div className="patient-badges">
                        <span 
                          className="priority-badge" 
                          style={{ backgroundColor: getPriorityColor(patient.priority) }}
                        >
                          {patient.priority}
                        </span>
                      </div>
                    </div>
                    <div className="patient-meta">
                      <span className="patient-id">ID: {patient.id}</span>
                      <span className="appointment-time">{patient.time} AM</span>
                    </div>
                    <div className="patient-condition">{patient.diagnosis}</div>
                  </div>
                  <div className="queue-status">
                    <div 
                      className="status-dot" 
                      style={{ backgroundColor: getStatusColor(patient.status) }}
                    ></div>
                    <span className="status-text">{patient.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Details */}
          <div className="patient-details-panel">
            <div className="panel-header">
              <h2>Patient Information</h2>
              <div className="tab-navigation">
                <button 
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'medical' ? 'active' : ''}`}
                  onClick={() => setActiveTab('medical')}
                >
                  Medical History
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'vitals' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vitals')}
                >
                  Vital Signs
                </button>
              </div>
            </div>

            <div className="patient-details-content">
              {activeTab === 'overview' && (
                <div className="overview-content">
                  <div className="patient-profile-card">
                    <div className="profile-header">
                      <div className="patient-avatar-large">
                        {currentPatient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="profile-info">
                        <h3>{currentPatient.name}</h3>
                        <div className="profile-details">
                          <span>ID: {currentPatient.id}</span>
                          <span>Age: {currentPatient.age}</span>
                          <span>Gender: {currentPatient.gender}</span>
                        </div>
                        <div className="department">{currentPatient.division}</div>
                      </div>
                      <div className="profile-actions">
                        <button className="action-btn primary">Start Consultation</button>
                        <button className="action-btn secondary">View Records</button>
                      </div>
                    </div>
                  </div>

                  <div className="info-cards-grid">
                    <div className="info-card">
                      <h4>Allergies</h4>
                      <div className="allergies-list">
                        {currentPatient.allergies.length > 0 ? (
                          currentPatient.allergies.map((allergy, idx) => (
                            <span key={idx} className="allergy-tag danger">{allergy}</span>
                          ))
                        ) : (
                          <span className="allergy-tag safe">No Known Allergies</span>
                        )}
                      </div>
                    </div>

                    <div className="info-card">
                      <h4>Appointment Details</h4>
                      <div className="appointment-info">
                        <div className="info-row">
                          <span className="label">Time:</span>
                          <span className="value">{currentPatient.time} AM</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Status:</span>
                          <span className={`value status ${currentPatient.status}`}>
                            {currentPatient.status}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="label">Priority:</span>
                          <span 
                            className="value priority"
                            style={{ color: getPriorityColor(currentPatient.priority) }}
                          >
                            {currentPatient.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="info-card qr-card">
                      <h4>Patient QR Code</h4>
                      <div className="qr-code-container">
                        <img src={qr} alt="Patient QR Code" className="qr-image" />
                        <p>Scan for quick patient access</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vitals' && (
                <div className="vitals-content">
                  <div className="vitals-grid">
                    <div className="vital-card">
                      <div className="vital-icon">🫀</div>
                      <div className="vital-info">
                        <span className="vital-label">Blood Pressure</span>
                        <span className="vital-value">{currentPatient.vitals.bp}</span>
                      </div>
                    </div>
                    <div className="vital-card">
                      <div className="vital-icon">🌡️</div>
                      <div className="vital-info">
                        <span className="vital-label">Temperature</span>
                        <span className="vital-value">{currentPatient.vitals.temp}</span>
                      </div>
                    </div>
                    <div className="vital-card">
                      <div className="vital-icon">💓</div>
                      <div className="vital-info">
                        <span className="vital-label">Heart Rate</span>
                        <span className="vital-value">{currentPatient.vitals.pulse}</span>
                      </div>
                    </div>
                    <div className="vital-card">
                      <div className="vital-icon">⚖️</div>
                      <div className="vital-info">
                        <span className="vital-label">Weight</span>
                        <span className="vital-value">{currentPatient.vitals.weight}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'medical' && (
                <div className="medical-content">
                  <div className="medical-history">
                    <h4>Recent Visit History</h4>
                    <div className="history-item">
                      <div className="history-date">{currentPatient.lastVisit}</div>
                      <div className="history-details">
                        <div className="history-diagnosis">{currentPatient.diagnosis}</div>
                        <div className="history-notes">Regular checkup completed. Patient in good health.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="quick-actions-panel">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="quick-action-btn">
              <span className="action-icon">📋</span>
              <span>New Prescription</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">🧪</span>
              <span>Order Lab Test</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📊</span>
              <span>View Reports</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📅</span>
              <span>Schedule Follow-up</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📞</span>
              <span>Contact Patient</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">💊</span>
              <span>Medication Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;