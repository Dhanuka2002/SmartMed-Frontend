import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorQueue, updateQueueEntryStatus } from "../../../services/queueService";
import notificationSoundService from "../../../services/notificationSoundService";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(notificationSoundService.isNotificationEnabled());
  const [isRinging, setIsRinging] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load doctor queue data
  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('telemed_notifications');
      if (stored) {
        const allNotifications = JSON.parse(stored);
        const pendingRequests = allNotifications.filter(n => 
          n.type === 'video_call_request' && n.status === 'pending'
        );
        
        // Handle ringing logic
        if (pendingRequests.length > 0 && soundEnabled) {
          // Start ringing if new notifications arrived or if not already ringing
          if (pendingRequests.length > previousNotificationCount || !notificationSoundService.isCurrentlyRinging()) {
            notificationSoundService.startRinging('video_call_request');
            setIsRinging(true);
          }
        } else {
          // Stop ringing if no notifications or sound disabled
          notificationSoundService.stopRinging();
          setIsRinging(false);
        }
        
        setPreviousNotificationCount(pendingRequests.length);
        setNotifications(pendingRequests);
      } else {
        // No notifications stored, stop ringing
        notificationSoundService.stopRinging();
        setIsRinging(false);
        setNotifications([]);
        setPreviousNotificationCount(0);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 1000);
    return () => clearInterval(interval);
  }, [previousNotificationCount, soundEnabled]);

  const loadQueueData = () => {
    const doctorQueue = getDoctorQueue();
    setQueueData(doctorQueue);
    setLastUpdated(new Date());
  };

  const currentPatient = queueData[selectedPatient] || {};
  const completedCount = queueData.filter(p => p.status === 'Completed').length;
  const waitingCount = queueData.filter(p => p.status === 'Waiting for Doctor').length;
  const totalPatients = queueData.length;

  // Function to update patient status
  const updatePatientStatus = async (queueNo, newStatus) => {
    try {
      await updateQueueEntryStatus('doctor', queueNo, { status: newStatus });
      loadQueueData();
    } catch (error) {
      console.error('Error updating patient status:', error);
      alert('Error updating patient status');
    }
  };

  // Function to refresh patient queue
  const refreshQueue = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    loadQueueData();
    setLoading(false);
  };

  // Function to handle patient selection
  const handleSelectPatient = (patient) => {
    // Store selected patient for DoctorPatient component
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    alert(`Selected patient: ${patient.studentName} (Queue #${patient.queueNo}). Navigate to Patients page to view details.`);
  };

  // Handle video call request
  const handleAcceptVideoCall = (notification) => {
    const allNotifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
    const updatedNotifications = allNotifications.map(n => 
      n.id === notification.id ? { ...n, status: 'accepted' } : n
    );
    localStorage.setItem('telemed_notifications', JSON.stringify(updatedNotifications));
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    setShowNotifications(false);
    
    // Stop ringing when accepting
    notificationSoundService.stopRinging();
    setIsRinging(false);
    
    navigate('/doctor/telemed');
  };

  const handleDeclineVideoCall = (notification) => {
    const allNotifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
    const updatedNotifications = allNotifications.map(n => 
      n.id === notification.id ? { ...n, status: 'declined' } : n
    );
    localStorage.setItem('telemed_notifications', JSON.stringify(updatedNotifications));
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    
    // Stop ringing when declining if no more notifications
    const remainingNotifications = notifications.filter(n => n.id !== notification.id);
    if (remainingNotifications.length === 0) {
      notificationSoundService.stopRinging();
      setIsRinging(false);
    }
  };

  // Sound control functions
  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    notificationSoundService.setEnabled(newSoundEnabled);
    
    if (newSoundEnabled) {
      // Play test sound when enabling
      notificationSoundService.testSound('video_call_request');
      // If there are pending notifications, start ringing again
      if (notifications.length > 0) {
        notificationSoundService.startRinging('video_call_request');
        setIsRinging(true);
      }
    } else {
      // Stop ringing when disabling sound
      notificationSoundService.stopRinging();
      setIsRinging(false);
    }
  };

  const testNotificationSound = () => {
    notificationSoundService.testSound('video_call_request');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#3b82f6';
      case 'Waiting for Doctor': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      
      case 'Waiting for Doctor':
        return { label: 'Waiting', class: 'status-waiting' };
      case 'Completed':
        return { label: 'Completed', class: 'status-completed' };
      default:
        return { label: 'Waiting', class: 'status-waiting' };
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
            <div className="doctor-avatar">👨‍⚕️</div>
            <div className="doctor-details">
              <span className="doctor-name">Dr. Medical</span>
              <span className="doctor-title">General Physician</span>
            </div>
          </div>
          
          {/* Sound Control */}
          <div className="sound-controls">
            <button 
              className={`sound-btn ${soundEnabled ? 'enabled' : 'disabled'}`}
              onClick={toggleSound}
              title={soundEnabled ? 'Mute notifications' : 'Enable notification sounds'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button 
              className="test-sound-btn"
              onClick={testNotificationSound}
              title="Test notification sound"
            >
              🎵
            </button>
          </div>

          <div className={`notification-bell ${isRinging ? 'ringing' : ''}`} onClick={() => setShowNotifications(!showNotifications)}>
            <span>🔔</span>
            {notifications.length > 0 && (
              <div className="notification-badge">{notifications.length}</div>
            )}
            {isRinging && (
              <div className="ringing-indicator">🎵</div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Video Call Requests</h3>
            <div className="notification-header-controls">
              {isRinging && (
                <button 
                  className="stop-ringing-btn"
                  onClick={() => {
                    notificationSoundService.stopRinging();
                    setIsRinging(false);
                  }}
                  title="Stop ringing"
                >
                  🔇 Stop Ringing
                </button>
              )}
              <button onClick={() => setShowNotifications(false)}>✕</button>
            </div>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No pending requests</div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-info">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <div className="notification-details">
                      <span>Student: {notification.studentName}</span>
                      <span>ID: {notification.studentId}</span>
                      <span>Time: {new Date(notification.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => handleAcceptVideoCall(notification)}
                    >
                      Accept Call
                    </button>
                    <button 
                      className="decline-btn"
                      onClick={() => handleDeclineVideoCall(notification)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="dashboard-body">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{totalPatients}</div>
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
          
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Patient Queue */}
          <div className="patient-queue-panel">
            <div className="panel-header">
              <h2>Patient Queue</h2>
              <div className="queue-controls">
                <button 
                  className={`control-btn ${loading ? 'loading' : ''}`}
                  onClick={refreshQueue}
                  disabled={loading}
                >
                  🔄 {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button className="control-btn info-btn" onClick={() => alert('Patients are added from Reception queue')}>
                  ℹ️ Info
                </button>
              </div>
            </div>
            
            <div className="queue-container">
              {queueData.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No patients in queue</h3>
                  <p>Patients will appear here when sent from reception</p>
                </div>
              ) : (
                queueData.map((patient, index) => {
                  const statusInfo = getStatusBadge(patient.status);
                  const addedTime = new Date(patient.movedToDoctorTime || patient.addedTime);
                  return (
                    <div 
                      key={patient.queueNo}
                      className={`queue-item ${patient.status === 'In Progress' ? 'current' : 'waiting'} ${selectedPatient === index ? 'active' : ''}`}
                      onClick={() => setSelectedPatient(index)}
                    >
                      <div className="queue-number">{index + 1}</div>
                      <div className="patient-summary">
                        <div className="patient-header">
                          <span className="patient-name">{patient.studentName}</span>
                          <div className="patient-badges">
                            <span className="priority-badge" style={{ backgroundColor: '#22c55e' }}>
                              {patient.priority || 'Normal'}
                            </span>
                          </div>
                        </div>
                        <div className="patient-meta">
                          <span className="patient-id">Queue #{patient.queueNo}</span>
                          <span className="appointment-time">{addedTime.toLocaleTimeString()}</span>
                        </div>
                        <div className="patient-condition">Student ID: {patient.studentId}</div>
                      </div>
                      <div className="queue-status">
                        <div 
                          className="status-dot" 
                          style={{ backgroundColor: getStatusColor(patient.status) }}
                        ></div>
                        <span className="status-text">{statusInfo.label}</span>
                        <div className="patient-actions-mini">
                          {patient.status === 'Waiting for Doctor' && (
                            <button 
                              className="mini-btn start-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePatientStatus(patient.queueNo, 'In Progress');
                              }}
                            >
                              Start
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
              {activeTab === 'overview' && currentPatient.studentName && (
                <div className="overview-content">
                  <div className="patient-profile-card">
                    <div className="profile-header">
                      <div className="patient-avatar-large">
                        {currentPatient.studentName ? currentPatient.studentName.split(' ').map(n => n[0]).join('') : 'N/A'}
                      </div>
                      <div className="profile-info">
                        <h3>{currentPatient.studentName}</h3>
                        <div className="profile-details">
                          <span>Queue: {currentPatient.queueNo}</span>
                          <span>Student ID: {currentPatient.studentId}</span>
                          <span>{currentPatient.medicalData?.student?.academicDivision || 'N/A'}</span>
                          
                        </div>

                      </div>
                      <div className="profile-actions">
                        {currentPatient.status === 'Waiting for Doctor' && (
                          <button 
                            className="action-btn primary"
                            onClick={() => updatePatientStatus(currentPatient.queueNo, 'In Progress')}
                          >
                            Start Consultation
                          </button>
                        )}
                        {currentPatient.status === 'In Progress' && (
                          <button 
                            className="action-btn success"
                            onClick={() => updatePatientStatus(currentPatient.queueNo, 'Completed')}
                          >
                            Complete Consultation
                          </button>
                        )}
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleSelectPatient(currentPatient)}
                        >
                          📝 View Details
                        </button>
                      </div>
                    </div>
                  </div>

                 
                </div>
              )}

              {activeTab === 'vitals' && currentPatient.studentName && (
                <div className="vitals-content">
                  <div className="vitals-grid">
                    <div className="vital-card">
                      <div className="vital-icon">🫀</div>
                      <div className="vital-info">
                        <span className="vital-label">Blood Pressure</span>
                        <span className="vital-value">Not Available</span>
                      </div>
                    </div>
                    <div className="vital-card">
                      <div className="vital-icon">🌡️</div>
                      <div className="vital-info">
                        <span className="vital-label">Temperature</span>
                        <span className="vital-value">Not Available</span>
                      </div>
                    </div>
                    <div className="vital-card">
                      <div className="vital-icon">💓</div>
                      <div className="vital-info">
                        <span className="vital-label">Heart Rate</span>
                        <span className="vital-value">Not Available</span>
                      </div>
                    </div>
                    <div className="vital-card">
                      <div className="vital-icon">⚖️</div>
                      <div className="vital-info">
                        <span className="vital-label">Weight</span>
                        <span className="vital-value">Not Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'medical' && currentPatient.studentName && (
                <div className="medical-content">
                  <div className="medical-history">
                    <h4>Recent Visit History</h4>
                    <div className="history-item">
                      <div className="history-date">{new Date(currentPatient.addedTime).toLocaleDateString()}</div>
                      <div className="history-details">
                        <div className="history-diagnosis">Queue Entry</div>
                        <div className="history-notes">Student entered doctor queue from reception.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      
        
      </div>
    </div>
  );
}

export default DoctorDashboard;