import React, { useState } from 'react';
import './ReceptionistQueue.css';

const ReceptionistQueue = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [queueList, setQueueList] = useState([
    { queueNo: '012', studentName: 'Amali Perera', status: 'Waiting', action: 'Call Now', priority: 'Normal', waitTime: '5 min' },
    { queueNo: '013', studentName: 'Franklin John', status: 'Waiting', action: 'Skip', priority: 'High', waitTime: '12 min' },
    { queueNo: '014', studentName: 'Lahiru Silva', status: 'Waiting', action: 'Call Now', priority: 'Normal', waitTime: '3 min' },
    { queueNo: '015', studentName: 'Sarah Williams', status: 'Called', action: 'Hold', priority: 'Low', waitTime: '8 min' },
    { queueNo: '016', studentName: 'Michael Chen', status: 'Waiting', action: 'Call Now', priority: 'High', waitTime: '15 min' },
  ]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleActionChange = (queueNo, action) => {
    const updatedList = queueList.map(item => 
      item.queueNo === queueNo ? { ...item, action } : item
    );
    setQueueList(updatedList);
  };

  const handleRefresh = () => {
    console.log('Queue refreshed');
    // Simulate refresh animation or fetch new data
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'waiting': return 'status-waiting';
      case 'called': return 'status-called';
      case 'completed': return 'status-completed';
      default: return 'status-waiting';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'normal': return 'priority-normal';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  const getActionButtonClass = (action) => {
    switch (action.toLowerCase()) {
      case 'call now': return 'action-call';
      case 'skip': return 'action-skip';
      case 'hold': return 'action-hold';
      default: return 'action-call';
    }
  };

  const filteredList = queueList.filter(
    (item) =>
      item.queueNo.includes(searchTerm) ||
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalWaiting = queueList.filter(item => item.status === 'Waiting').length;
  const averageWaitTime = Math.round(
    queueList.reduce((acc, item) => acc + parseInt(item.waitTime), 0) / queueList.length
  );

  return (
    <div className="queue-container">
      {/* Header Section */}
      <div className="queue-header">
        <div className="header-title">
          <h1>Reception Queue Management</h1>
          <p>Manage student appointments and queue efficiently</p>
        </div>
        
        <div className="queue-stats">
          <div className="stat-card">
            <div className="stat-number">{totalWaiting}</div>
            <div className="stat-label">Waiting</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{averageWaitTime}</div>
            <div className="stat-label">Avg Wait (min)</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{queueList.length}</div>
            <div className="stat-label">Total Today</div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="queue-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="21 21l-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by queue number or student name..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        <div className="control-buttons">
          <button className="btn btn-refresh" onClick={handleRefresh}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Refresh
          </button>
          <button className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <div className="table-container">
        <table className="queue-table">
          <thead>
            <tr>
              <th>Queue No.</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Wait Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((entry) => (
              <tr key={entry.queueNo} className="table-row">
                <td>
                  <div className="queue-number">#{entry.queueNo}</div>
                </td>
                <td>
                  <div className="student-info">
                    <div className="student-name">{entry.studentName}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(entry.status)}`}>
                    {entry.status}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${getPriorityClass(entry.priority)}`}>
                    {entry.priority}
                  </span>
                </td>
                <td>
                  <div className="wait-time">{entry.waitTime}</div>
                </td>
                <td>
                  <select
                    className={`action-select ${getActionButtonClass(entry.action)}`}
                    value={entry.action}
                    onChange={(e) => handleActionChange(entry.queueNo, e.target.value)}
                  >
                    <option value="Call Now">Call Now</option>
                    <option value="Skip">Skip</option>
                    <option value="Hold">Hold</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredList.length === 0 && (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="21 21l-4.35-4.35"></path>
            </svg>
            <h3>No students found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistQueue;