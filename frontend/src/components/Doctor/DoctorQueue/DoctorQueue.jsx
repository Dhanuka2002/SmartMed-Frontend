import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorQueue, updateQueueEntryStatus } from "../../../services/queueService";
import { getFullMedicalRecordById } from "../../../services/medicalRecordService";
import "./DoctorQueue.css";

function DoctorQueue() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [queueData, setQueueData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);   // NEW
  const [error, setError] = useState(null);       // NEW
=======
  const [loadingPatient, setLoadingPatient] = useState(false);
>>>>>>> 832ca99b090aed1644be80b0b11e9eac22cde254

  // Load doctor queue data
  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const loadQueueData = async () => {
    try {
<<<<<<< HEAD
      setLoading(true);
      setError(null);

      const doctorQueue = await getDoctorQueue();  // ✅ now awaits API
      setQueueData(doctorQueue || []);
    } catch (err) {
      console.error("Error fetching doctor queue:", err);
      setError("Unable to load queue. Please try again.");
      setQueueData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    localStorage.setItem("selectedPatient", JSON.stringify(patient));
    alert(
      `Selected patient: ${patient.studentName} (Queue #${patient.queueNo}). Navigate to Patients page to view details.`
    );
=======
      console.log('🔄 [DoctorQueue] Loading doctor queue data...');
      const doctorQueue = await getDoctorQueue();
      console.log('✅ [DoctorQueue] Doctor queue loaded:', doctorQueue);
      setQueueData(doctorQueue);
    } catch (error) {
      console.error('❌ [DoctorQueue] Error loading doctor queue:', error);
      setQueueData([]);
    }
  };

  const handleSelectPatient = async (patient) => {
    try {
      setLoadingPatient(true);
      console.log('🔄 Selecting patient:', patient);
      
      // Fetch full medical record details
      const result = await getFullMedicalRecordById(patient.medicalRecordId);
      
      if (result.success) {
        // Combine queue data with full medical record
        const fullPatientData = {
          ...patient, // Queue info (queueNo, status, etc.)
          fullMedicalRecord: result.medicalRecord // Complete medical record
        };
        
        // Store for DoctorPatient component
        localStorage.setItem('selectedPatient', JSON.stringify(fullPatientData));
        
        console.log('✅ Full patient data prepared:', fullPatientData);
        
        // Navigate to Patients tab
        navigate('/doctor/patients');
        
        // Show success message
        alert(`✅ Patient ${patient.studentName} (Queue #${patient.queueNo}) loaded successfully! Navigating to Patients tab...`);
        
      } else {
        throw new Error(result.error || 'Failed to fetch medical record');
      }
    } catch (error) {
      console.error('❌ Error selecting patient:', error);
      alert(`❌ Failed to load patient details: ${error.message}`);
    } finally {
      setLoadingPatient(false);
    }
>>>>>>> 832ca99b090aed1644be80b0b11e9eac22cde254
  };

  const handlePatientStatus = async (queueNo, status) => {
    try {
      await updateQueueEntryStatus("doctor", queueNo, { status });
      loadQueueData();
    } catch (error) {
      console.error("Error updating patient status:", error);
      alert("Error updating patient status");
    }
  };

  // Helper function to get status badge info
  const getStatusBadge = (status) => {
    switch (status) {
      case "In Progress":
        return { label: "In Progress", class: "status-current" };
      case "Waiting for Doctor":
        return { label: "Waiting", class: "status-waiting" };
      case "Completed":
        return { label: "Completed", class: "status-completed" };
      default:
        return { label: "Waiting", class: "status-waiting" };
    }
  };

  const getTotalPatients = () => queueData.length;
  const getWaitingPatients = () =>
    queueData.filter((p) => p.status === "Waiting for Doctor").length;

  return (
    <div className="doctor-queue-container">
      {/* Header Section */}
      <div className="queue-header">
        <div className="header-content">
          <h1 className="queue-title">Patient Queue</h1>
          <div className="queue-stats">
            <div className="stat-item">
              <span className="stat-number">{getTotalPatients()}</span>
              <span className="stat-label">Total Patients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{getWaitingPatients()}</span>
              <span className="stat-label">Waiting</span>
            </div>
            <div className="stat-item">
              <span className="stat-number current-time">{currentTime}</span>
              <span className="stat-label">Current Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="queue-content">
        {loading ? (
          <div className="loading-state">⏳ Loading queue...</div>
        ) : error ? (
          <div className="error-state">⚠️ {error}</div>
        ) : queueData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No patients in queue</h3>
            <p>Patients will appear here when sent from reception</p>
          </div>
        ) : (
          <div className="queue-list">
            {queueData.map((patient, index) => {
              const statusInfo = getStatusBadge(patient.status);
              const addedTime = new Date(
                patient.movedToDoctorTime || patient.addedTime
              );
              return (
                <div
                  className={`queue-item ${
                    patient.status === "In Progress" ? "current" : "waiting"
                  }`}
                  key={patient.queueNo}
                >
                  <div className="queue-position">
                    <span className="position-number">{index + 1}</span>
                  </div>

                  <div className="patient-info">
                    <div className="patient-main">
                      <h3 className="patient-name">{patient.studentName}</h3>
                      <span className="patient-id">Queue #: {patient.queueNo}</span>
                      <span className="student-id">
                        Student ID: {patient.studentId}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <div className="detail-item">
                        <span className="detail-label">📧</span>
                        <span>{patient.email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📞</span>
                        <span>{patient.phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">🕐</span>
                        <span>Added: {addedTime.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="queue-status">
                    <div className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </div>
                    <div className="patient-actions">
                      <button
                        className="action-btn select-btn"
                        onClick={() => handleSelectPatient(patient)}
                        disabled={loadingPatient}
                      >
                        {loadingPatient ? '⏳ Loading...' : 'View Patient'}
                      </button>
<<<<<<< HEAD
                      {patient.status === "Waiting for Doctor" && (
                        <button
                          className="action-btn start-btn"
                          onClick={() =>
                            handlePatientStatus(patient.queueNo, "In Progress")
                          }
                        >
                          Start Consultation
                        </button>
                      )}
=======
>>>>>>> 832ca99b090aed1644be80b0b11e9eac22cde254
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="queue-footer">
        <button className="action-btn refresh-btn" onClick={loadQueueData}>
          🔄 Refresh Queue
        </button>
        <div className="queue-info">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Patient Details - Queue #{selectedPatient.queueNo}</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedPatient(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{selectedPatient.studentName}</span>
                </div>
                <div className="detail-item">
                  <label>Student ID:</label>
                  <span>{selectedPatient.studentId}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedPatient.email}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{selectedPatient.phone}</span>
                </div>
                <div className="detail-item">
                  <label>NIC:</label>
                  <span>{selectedPatient.nic}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span>{selectedPatient.status}</span>
                </div>
              </div>

              {selectedPatient.medicalData && (
                <div className="medical-summary">
                  <h4>Medical Summary</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Academic Division:</label>
                      <span>
                        {selectedPatient.medicalData.student.academicDivision}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Emergency Contact:</label>
                      <span>
                        {selectedPatient.medicalData.student.emergencyContact.name}{" "}
                        (
                        {
                          selectedPatient.medicalData.student.emergencyContact
                            .telephone
                        }
                        )
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Blood Group:</label>
                      <span>
                        {selectedPatient.medicalData.examination?.examination
                          ?.clinicalTests?.bloodGroup || "Not Available"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleSelectPatient(selectedPatient);
                  setSelectedPatient(null);
                }}
              >
                Go to Patient Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorQueue;
