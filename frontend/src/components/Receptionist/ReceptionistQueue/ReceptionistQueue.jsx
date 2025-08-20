import React, { useState, useEffect } from 'react';
import QRScanner from '../../QRScanner/QRScanner';
import { getReceptionQueue, moveStudentToDoctor, updateQueueEntryStatus } from '../../../services/queueService';
import './ReceptionistQueue.css';

const ReceptionistQueue = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [queueList, setQueueList] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load queue data on component mount and set up refresh interval
  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadQueueData = () => {
    const receptionQueue = getReceptionQueue();
    setQueueList(receptionQueue);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleActionChange = async (queueNo, action) => {
    try {
      if (action === 'Send to Doctor') {
        // Move student to doctor queue
        await moveStudentToDoctor(queueNo);
        alert('Student sent to doctor queue successfully!');
        loadQueueData(); // Refresh the queue
      } else {
        // Update status
        await updateQueueEntryStatus('reception', queueNo, { action, status: action });
        loadQueueData(); // Refresh the queue
      }
    } catch (error) {
      console.error('Error updating action:', error);
      alert('Error updating student status');
    }
  };

  const handleRefresh = () => {
    loadQueueData();
    console.log('Queue refreshed');
  };

  const handleScanResult = (medicalData) => {
    console.log('QR scan result:', medicalData);
    setShowScanner(false);
    loadQueueData(); // Refresh queue to show new student
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
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
          <button className="btn btn-primary" onClick={() => setShowScanner(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,5H21V9H19V5M5,5H9V9H5V5"/>
            </svg>
            Scan QR Code
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
              <th>Student ID</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Wait Time</th>
              <th>Action</th>
              <th>Details</th>
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
                    <div className="student-details" style={{fontSize: '0.8rem', color: '#666'}}>
                      {entry.email}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="student-id">{entry.studentId || 'N/A'}</div>
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
                    <option value="Send to Doctor">Send to Doctor</option>
                  </select>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => handleViewDetails(entry)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    View
                  </button>
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

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details - Queue #{selectedStudent.queueNo}</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{selectedStudent.studentName}</span>
                </div>
                <div className="detail-item">
                  <label>Student ID:</label>
                  <span>{selectedStudent.studentId}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{selectedStudent.phone}</span>
                </div>
                <div className="detail-item">
                  <label>NIC:</label>
                  <span>{selectedStudent.nic}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span>{selectedStudent.status}</span>
                </div>
                <div className="detail-item">
                  <label>Added Time:</label>
                  <span>{new Date(selectedStudent.addedTime).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Wait Time:</label>
                  <span>{selectedStudent.waitTime}</span>
                </div>
              </div>
              
              {selectedStudent.medicalData && (
                <div className="medical-summary">
                  <h4>Medical Summary</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Academic Division:</label>
                      <span>{selectedStudent.medicalData.student.academicDivision}</span>
                    </div>
                    <div className="detail-item">
                      <label>Emergency Contact:</label>
                      <span>{selectedStudent.medicalData.student.emergencyContact.name} ({selectedStudent.medicalData.student.emergencyContact.telephone})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  handleActionChange(selectedStudent.queueNo, 'Send to Doctor');
                  setSelectedStudent(null);
                }}
              >
                Send to Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistQueue;