import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReceptionistQueue.css';

const ReceptionistQueue = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [queueList, setQueueList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentName: '',
    priority: 'Normal',
  });

  // Fetch queue list from backend
  const fetchQueue = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/queue');
      setQueueList(res.data);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Search functionality
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Action change: Call Now, Skip, Hold
  const handleActionChange = async (queueNo, action) => {
    const entry = queueList.find(item => item.queueNo === queueNo);
    if (!entry) return;

    const updatedEntry = { ...entry, status: action };

    try {
      await axios.put(`http://localhost:8081/api/queue/${entry.id}`, updatedEntry);
      fetchQueue();
    } catch (error) {
      console.error('Error updating action:', error);
    }
  };

  // Refresh queue list
  const handleRefresh = () => {
    fetchQueue();
  };

  // Show modal
  const handleAddStudentClick = () => {
    setShowAddModal(true);
  };

  // Input changes inside modal
  const handleAddStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  // Submit new student to backend
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:8081/api/queue', {
        ...newStudent,
        status: 'Waiting',
      });

      fetchQueue();
      setShowAddModal(false);
      setNewStudent({ studentName: '', priority: 'Normal' });
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  // Close modal
  const handleModalClose = () => {
    setShowAddModal(false);
    setNewStudent({ studentName: '', priority: 'Normal' });
  };

  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'waiting': return 'status-waiting';
      case 'called': return 'status-called';
      case 'completed': return 'status-completed';
      default: return 'status-waiting';
    }
  };

  const getPriorityClass = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return 'priority-high';
      case 'normal': return 'priority-normal';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  const filteredList = queueList
    .filter(
      (item) =>
        (item.queueNo || '').includes(searchTerm) ||
        (item.studentName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice().reverse();

  const totalWaiting = queueList.filter(item => item.status === 'Waiting').length;

  return (
    <div className="queue-container">
      {/* Header */}
      <div className="queue-header">
        <div className="header-title">
          <h1>Reception Queue Management</h1>
        </div>
        <div className="queue-stats">
          <div className="stat-card">
            <div className="stat-number">{totalWaiting}</div>
            <div className="stat-label">Waiting</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{queueList.length}</div>
            <div className="stat-label">Total Today</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="queue-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
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
          <button className="btn btn-refresh" onClick={handleRefresh}>🔄 Refresh</button>
          <button className="btn btn-primary" onClick={handleAddStudentClick}>➕ Add Student</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="queue-table">
          <thead>
            <tr>
              <th>Queue No.</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No students found</td>
              </tr>
            ) : (
              filteredList.map((entry) => (
                <tr key={entry.id}>
                  <td><div className="queue-number">#{entry.queueNo}</div></td>
                  <td><div className="student-name">{entry.studentName}</div></td>
                  <td><span className={`status-badge ${getStatusClass(entry.status)}`}>{entry.status}</span></td>
                  <td><span className={`priority-badge ${getPriorityClass(entry.priority)}`}>{entry.priority}</span></td>
                  <td>
                    <select
                      className="action-select"
                      value={entry.status}
                      onChange={(e) => handleActionChange(entry.queueNo, e.target.value)}
                    >
                      <option value="Waiting">Call Now</option>
                      <option value="Completed">Complete</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Student</h2>
            <form onSubmit={handleAddStudentSubmit}>
              <input
                type="text"
                name="studentName"
                placeholder="Student Name"
                value={newStudent.studentName}
                onChange={handleAddStudentChange}
                required
              />
              <select name="priority" value={newStudent.priority} onChange={handleAddStudentChange}>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary">Add</button>
                <button type="button" className="btn btn-cancel" onClick={handleModalClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistQueue;
