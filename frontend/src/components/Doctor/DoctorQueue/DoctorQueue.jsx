
/*

import React from "react";
import "./DoctorQueue.css";

function DoctorQueue() {
  // Sample queue data
  const queueData = [
    { date: "2025/04/20", time: "09.00 AM", name: "Franklin Jhon", id: "22IT0999" },
    { date: "2025/04/20", time: "09.00 AM", name: "Franklin Jhon", id: "22IT0999" },
    { date: "2025/04/20", time: "09.00 AM", name: "Franklin Jhon", id: "22IT0999" },
    { date: "2025/04/20", time: "09.00 AM", name: "Franklin Jhon", id: "22IT0999" },
    { date: "2025/04/20", time: "09.00 AM", name: "Franklin Jhon", id: "22IT0999" },
    { date: "2025/04/20", time: "09.00 AM", name: "Franklin Jhon", id: "22IT0999" },
  ];

  return (
    <div className="doctor-queue-container">
      <h2>Patient Queue</h2>
      <div className="queue-list">
        {queueData.map((item, index) => (
          <div className="queue-item" key={index}>
            <span className="queue-date">{item.date}</span>
            <span className="queue-time">{item.time}</span>
            <span className="queue-name">{item.name}</span>
            <span className="queue-id">{item.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorQueue;

*/

import React, { useState } from "react";
import "./DoctorQueue.css";

function DoctorQueue() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  // Enhanced queue data with more realistic information
  const queueData = [
    { 
      date: "2025/07/21", 
      time: "09:00 AM", 
      name: "Sarah Johnson", 
      id: "PT001", 
      status: "current",
      waitTime: "Now",
      type: "Consultation"
    },
    { 
      date: "2025/07/21", 
      time: "09:30 AM", 
      name: "Michael Chen", 
      id: "PT002", 
      status: "waiting",
      waitTime: "15 min",
      type: "Follow-up"
    },
    { 
      date: "2025/07/21", 
      time: "10:00 AM", 
      name: "Emily Rodriguez", 
      id: "PT003", 
      status: "waiting",
      waitTime: "45 min",
      type: "Consultation"
    },
    { 
      date: "2025/07/21", 
      time: "10:30 AM", 
      name: "David Thompson", 
      id: "PT004", 
      status: "waiting",
      waitTime: "1h 15min",
      type: "Check-up"
    },
    { 
      date: "2025/07/21", 
      time: "11:00 AM", 
      name: "Lisa Anderson", 
      id: "PT005", 
      status: "waiting",
      waitTime: "1h 45min",
      type: "Consultation"
    },
    { 
      date: "2025/07/21", 
      time: "11:30 AM", 
      name: "James Wilson", 
      id: "PT006", 
      status: "waiting",
      waitTime: "2h 15min",
      type: "Follow-up"
    }
  ];

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      current: { label: "In Session", class: "status-current" },
      waiting: { label: "Waiting", class: "status-waiting" }
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
                    <h3 className="patient-name">{patient.name}</h3>
                    <span className="patient-id">ID: {patient.id}</span>
                  </div>
                  <div className="appointment-details">
                    <div className="detail-item">
                      <i className="icon-calendar"></i>
                      <span>{patient.date}</span>
                    </div>
                    <div className="detail-item">
                      <i className="icon-clock"></i>
                      <span>{patient.time}</span>
                    </div>
                    <div className="detail-item">
                      <i className="icon-medical"></i>
                      <span>{patient.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="queue-status">
                  <div className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.label}
                  </div>
                  <div className="wait-time">
                    <span className="wait-label">Wait:</span>
                    <span className="wait-duration">{patient.waitTime}</span>
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
        <button className="action-btn refresh-btn">
          <i className="icon-refresh"></i>
          Refresh Queue
        </button>
        <button className="action-btn add-btn">
          <i className="icon-plus"></i>
          Add Patient
        </button>
      </div>
    </div>
  );
}

export default DoctorQueue;