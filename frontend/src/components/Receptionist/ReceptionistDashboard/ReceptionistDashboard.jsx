import React, { useState } from 'react';
import { Users, Clock, AlertTriangle, RefreshCw, Eye, Bell, Truck } from 'lucide-react';
import './ReceptionistDashboard.css';

function ReceptionistDashboard() {
  const [totalPatients, setTotalPatients] = useState(48);
  const [currentQueue, setCurrentQueue] = useState(7);
  const [emergencyCases, setEmergencyCases] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      console.log('Refreshing patient data...');
    }, 1000);
  };

  const handleViewQueue = () => {
    window.location.href = '/receptionist/queue';
  };

  const handleNotifyNextPatients = () => {
    console.log('Notify next patients clicked');
  };

  const handleEmergencyAmbulance = () => {
    console.log('Emergency ambulance request initiated');
  };

  const currentTime = new Date().toLocaleString();

  return (
    <div className="receptionist-dashboard">
      {/* Header */}
     

      <div className="dashboard-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon patients">
                <Users className="icon" />
              </div>
              <div className="stat-info">
                <h3>Total Patients Today</h3>
                <p className="stat-number">{totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon queue">
                <Clock className="icon" />
              </div>
              <div className="stat-info">
                <h3>Current Queue</h3>
                <p className="stat-number">{currentQueue}</p>
                <p className="stat-subtitle">Waiting patients</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon emergency">
                <AlertTriangle className="icon" />
              </div>
              <div className="stat-info">
                <h3>Emergency Cases</h3>
                <p className="stat-number">{emergencyCases}</p>
                <p className="stat-subtitle">Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions-grid">
          {/* Quick Actions */}
          <div className="action-section">
            <h3>Quick Actions</h3>
            <div className="button-group">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`btn btn-primary ${isRefreshing ? 'loading' : ''}`}
              >
                <RefreshCw className={`btn-icon ${isRefreshing ? 'spinning' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>

              <button
                onClick={handleViewQueue}
                className="btn btn-success"
              >
                <Eye className="btn-icon" />
                View Queue
              </button>

              <button
                onClick={handleNotifyNextPatients}
                className="btn btn-indigo"
              >
                <Bell className="btn-icon" />
                Notify Next Patients
              </button>
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="action-section">
            <h3>Emergency Actions</h3>
            <div className="button-group">
              <button
                onClick={handleEmergencyAmbulance}
                className="btn-btn-danger"
              >
                <Truck className="btn-icon" />
                Emergency Ambulance Request
              </button>
              
              <div className="emergency-warning">
                <div className="warning-content">
                  <AlertTriangle className="warning-icon" />
                  <div className="warning-text">
                    <h4>Emergency Protocol</h4>
                    <p>
                      Use this button only for critical emergency situations requiring immediate ambulance dispatch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="alerts-section">
          <h3>Today's Alerts & Notifications</h3>
          <div className="alerts-container">
            <div className="alert-item alert-warning">
              <AlertTriangle className="alert-icon" />
              <div className="alert-content">
                <h4>Doctor Unavailable</h4>
                <p>
                  Dr. Mrs. Fernando will not be available from 12:00 PM - 1:00 PM today.
                </p>
                <p className="alert-time">
                  Please reschedule appointments accordingly.
                </p>
              </div>
            </div>

            <div className="alert-item alert-info">
              <Bell className="alert-icon" />
              <div className="alert-content">
                <h4>System Update</h4>
                <p>
                  Patient management system will be updated tonight at 11:00 PM.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;