import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DoctorQueue.css";

function DoctorQueue() {
  const [queueData, setQueueData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchQueue();
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/doctor-queue");
      setQueueData(res.data);
    } catch (err) {
      console.error("Error fetching doctor queue:", err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      current: { label: "In Session", class: "status-current" },
      waiting: { label: "Waiting", class: "status-waiting" },
    };
    return statusConfig[status] || { label: "Unknown", class: "status-default" };
  };

  const getTotalPatients = () => queueData.length;
  const getWaitingPatients = () => queueData.filter(p => p.status === "waiting").length;

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
        <div className="queue-list">
          {queueData.map((patient, index) => {
            const statusInfo = getStatusBadge(patient.status);
            return (
              <div className={`queue-item ${patient.status}`} key={patient.id}>
                <div className="patient-info">
                  <div className="patient-main">
                    <h3 className="patient-name">{patient.studentName}</h3>
                    <span className="patient-id">Queue No: {patient.queueNo}</span>
                  </div>
                  <div className="appointment-details">
                    <div className="detail-item">
                      <span>Status: {patient.status}</span>
                    </div>
                    <div className="detail-item">
                      <span>Priority: {patient.priority}</span>
                    </div>
                  </div>
                </div>

                <div className="queue-status">
                  <div className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.label}
                  </div>
                </div>

                <div className="queue-position">
                  <span className="position-number">{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="queue-footer">
        <button className="action-btn refresh-btn" onClick={fetchQueue}>
          🔄 Refresh Queue
        </button>
      </div>
    </div>
  );
}

export default DoctorQueue;
