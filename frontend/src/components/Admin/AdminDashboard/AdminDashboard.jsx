import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { FaUsers, FaUserPlus, FaUserCheck, FaTrash } from 'react-icons/fa';
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';

const AdminDashboard = () => {
  const { alertState, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: ''
  });

  const availableRoles = ['Doctor', 'Pharmacy', 'Hospital Staff', 'Receptionist'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.role === 'Admin') {
      setCurrentUser(user);
      fetchAllUsers();
    }
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user || !user.email) {
        console.error('Admin user email not found');
        setLoading(false);
        return;
      }
      const response = await fetch(`http://localhost:8081/api/auth/admin/all-users?adminEmail=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user || !user.email) {
        showError('Admin user session invalid. Please login again.', 'Session Error');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8081/api/auth/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUserForm,
          adminEmail: user.email
        })
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess(result.message, 'User Created');
        setNewUserForm({ firstName: '', lastName: '', email: '', password: '', role: '' });
        fetchAllUsers();
      } else {
        showError(result.message || 'Error creating user', 'Creation Error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showError('Error occurred while creating user', 'System Error');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setNewUserForm({
      ...newUserForm,
      [e.target.name]: e.target.value
    });
  };

  const getUserStats = () => {
    const totalUsers = users.length;
    const studentCount = users.filter(u => u.role === 'Student').length;
    const doctorCount = users.filter(u => u.role === 'Doctor').length;
    const pharmacyCount = users.filter(u => u.role === 'Pharmacy').length;
    const staffCount = users.filter(u => u.role === 'Hospital Staff').length;
    const receptionistCount = users.filter(u => u.role === 'Receptionist').length;
    return {
      totalUsers,
      studentCount,
      doctorCount,
      pharmacyCount,
      staffCount,
      receptionistCount
    };
  };

  const stats = getUserStats();

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  // Show warning if admin data is incomplete
  if (!currentUser.email || !currentUser.name) {
    const createTestAdmin = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/auth/create-test-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        showInfo(result.message, 'Admin Creation');
        if (result.status === 'success') {
          showSuccess('Admin created! Now try logging in with admin@smartmed.com / admin123', 'Admin Ready');
        }
      } catch (error) {
        console.error('Error creating admin:', error);
        showError('Error creating admin', 'Admin Creation Error');
      }
    };

    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Admin Data Incomplete</h2>
          <p>Admin role detected but missing required data.</p>
          <p>Please logout and login again with admin credentials:</p>
          <ul>
            <li><strong>Email:</strong> admin@smartmed.com</li>
            <li><strong>Password:</strong> admin123</li>
          </ul>
          <p>Current stored data: {JSON.stringify(currentUser)}</p>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={createTestAdmin}
              style={{
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Create Test Admin
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              style={{
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Clear Session & Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {currentUser.name}</p>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          <FaUsers /> Overview
        </button>
        <button
          className={activeTab === 'create' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('create')}
        >
          <FaUserPlus /> Create User
        </button>
        <button
          className={activeTab === 'manage' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('manage')}
        >
          <FaUserCheck /> Manage Users
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <FaUsers className="stat-icon" />
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUserCheck className="stat-icon student" />
                <div className="stat-info">
                  <h3>{stats.studentCount}</h3>
                  <p>Students</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUserCheck className="stat-icon doctor" />
                <div className="stat-info">
                  <h3>{stats.doctorCount}</h3>
                  <p>Doctors</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUserCheck className="stat-icon pharmacy" />
                <div className="stat-info">
                  <h3>{stats.pharmacyCount}</h3>
                  <p>Pharmacy Staff</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUserCheck className="stat-icon staff" />
                <div className="stat-info">
                  <h3>{stats.staffCount}</h3>
                  <p>Hospital Staff</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUserCheck className="stat-icon receptionist" />
                <div className="stat-info">
                  <h3>{stats.receptionistCount}</h3>
                  <p>Receptionists</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="create-section">
            <h2>Create New User</h2>

            {/* Form Container */}
            <div className="form-container">
              <form onSubmit={handleCreateUser} className="create-user-form">
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={newUserForm.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={newUserForm.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={newUserForm.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUserForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUserForm.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="create-btn">
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="manage-section">
            <h2>All Users</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role ? user.role.toLowerCase().replace(/ /g, '-') : ''}`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <AlertMessage
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        show={alertState.show}
        onClose={hideAlert}
        autoClose={alertState.autoClose}
        duration={alertState.duration}
        userName={alertState.userName}
      />
    </div>
  );
};

export default AdminDashboard;