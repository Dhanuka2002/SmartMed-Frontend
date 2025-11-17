// React core imports for component functionality
import React, { useState, useEffect } from "react";
// React Router for navigation between pages
import { useNavigate } from "react-router-dom";
// Component-specific styles
import "./StudentDashboard.css";

/**
 * Student Dashboard Component
 * 
 * Main dashboard interface for students to:
 * - View personal information and profile
 * - Access quick actions (Medical Reports, Update Profile, QR Code)
 * - Display user-specific data from localStorage and backend
 * - Manage profile images from multiple sources
 * 
 * @component
 * @returns {JSX.Element} Complete dashboard interface with header, actions, and personal info
 */
function Dashboard() {
 
  // STATE MANAGEMENT

  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  
  // Stores detailed student information from localStorage
  const [studentData, setStudentData] = useState(null);
  
  // Stores current logged-in user's basic info (name, email)
  const [currentUser, setCurrentUser] = useState(null);
  
  // Stores form submission data including profile image
  const [studentFormData, setStudentFormData] = useState(null);
  
  // Stores profile image fetched from backend
  const [profileImage, setProfileImage] = useState(null);
  
  // Tracks loading state while fetching profile image
  const [loading, setLoading] = useState(false);


  // LIFECYCLE HOOKS

  /**
   * Initial data load on component mount
   * Fetches user data from localStorage and backend
   */
  useEffect(() => {
    loadUserData();
  }, []);

  /**
   * Storage change listener
   * Monitors localStorage changes across tabs/windows and custom events
   * Automatically refreshes data when student information is updated
   */
  useEffect(() => {
    /**
     * Handles storage events from other tabs/windows
     * @param {StorageEvent} e - Storage event object
     */
    const handleStorageChange = (e) => {
      // Check if the changed key is related to student data
      if (e.key && (e.key.includes('studentFormData_') || e.key.includes('studentData_'))) {
        // Refresh user data when form data is updated
        loadUserData();
      }
    };

    // Listen for cross-tab storage changes
    window.addEventListener('storage', handleStorageChange);
    
    /**
     * Handles custom events within the same window
     * Used for same-tab updates that don't trigger storage events
     */
    const handleCustomRefresh = () => {
      loadUserData();
    };
    
    // Listen for custom studentDataUpdated event
    window.addEventListener('studentDataUpdated', handleCustomRefresh);
    
    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studentDataUpdated', handleCustomRefresh);
    };
  }, []);

  // ========================================
  // DATA LOADING FUNCTIONS
  // ========================================
  
  /**
   * Loads user data from localStorage and backend
   * 
   * Process:
   * 1. Retrieves current user from localStorage
   * 2. Clears cached data from other users
   * 3. Loads user-specific student data
   * 4. Migrates old general storage to user-specific storage
   * 5. Fetches profile image from backend
   */
  const loadUserData = () => {
    // Get current user data from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      // Parse JSON string to object
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      // Clear any cached data that might belong to other users
      clearOtherUsersData(user.email);
      
      // === LOAD STUDENT DATA ===
      // Get detailed student data if available for this specific user
      let detailedData = localStorage.getItem(`studentData_${user.email}`);
      if (detailedData) {
        setStudentData(JSON.parse(detailedData));
      } else {
        // Migration: Check for old general studentFormData and migrate if it belongs to current user
        const oldStudentData = localStorage.getItem('studentFormData');
        if (oldStudentData) {
          const parsedStudentData = JSON.parse(oldStudentData);
          // Verify email matches before migration
          if (parsedStudentData.email === user.email) {
            localStorage.setItem(`studentData_${user.email}`, oldStudentData);
            setStudentData(parsedStudentData);
          }
        }
      }
      
      // === LOAD FORM DATA ===
      // Get student form data for profile image (only for current user)
      const formData = localStorage.getItem(`studentFormData_${user.email}`);
      if (formData) {
        setStudentFormData(JSON.parse(formData));
      } else {
        // Migration: Check for old general studentFormData and migrate if it belongs to current user
        const oldFormData = localStorage.getItem('studentFormData');
        if (oldFormData) {
          const parsedFormData = JSON.parse(oldFormData);
          // Verify email matches before migration
          if (parsedFormData.email === user.email) {
            localStorage.setItem(`studentFormData_${user.email}`, oldFormData);
            setStudentFormData(parsedFormData);
          }
          // Clean up old general storage after migration
          localStorage.removeItem('studentFormData');
        }
      }
      
      // Fetch profile image from backend API
      fetchProfileImageFromBackend(user);
    }
  };

  /**
   * Clears cached data that belongs to other users
   * Prevents data mixing between different user sessions
   * 
   * @param {string} currentUserEmail - Email of the currently logged-in user
   */
  const clearOtherUsersData = (currentUserEmail) => {
    // Clear any general cached form data that might not belong to current user
    const formData = localStorage.getItem('studentFormData');
    if (formData) {
      const parsedFormData = JSON.parse(formData);
      // Check if cached data belongs to a different user
      if (parsedFormData.email !== currentUserEmail) {
        // Remove invalid cached data
        localStorage.removeItem('studentFormData');
        setStudentFormData(null);
      }
    }
    
    // Clear profile image to prevent showing wrong user's image
    // Will be reloaded from backend for current user
    setProfileImage(null);
  };

  /**
   * Fetches profile image from backend using multiple strategies
   * 
   * Strategy 1: Search by email (most reliable)
   * Strategy 2: Search by name (fallback method)
   * 
   * @async
   * @param {Object} user - User object containing email and name
   * @param {string} user.email - User's email address
   * @param {string} user.name - User's full name
   */
  const fetchProfileImageFromBackend = async (user) => {
    // Set loading state to show loading indicator
    setLoading(true);
    try {
      // Clear any cached profile image first to prevent showing old data
      setProfileImage(null);
      
      // === STRATEGY 1: Search by Email ===
      // Most reliable method as email is unique
      let response = await fetch(`http://localhost:8081/api/student-details/profile-image/email/${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const result = await response.json();
        // Check if response contains valid profile image
        if (result.status === 'success' && result.profileImage) {
          setProfileImage(result.profileImage);
          return; // Exit early on success
        }
      }
      
      // === STRATEGY 2: Search by Name ===
      // Fallback method if email search fails
      const nameResponse = await fetch(`http://localhost:8081/api/student-details/search/${encodeURIComponent(user.name)}`);
      if (nameResponse.ok) {
        const nameResult = await nameResponse.json();
        if (nameResult && nameResult.length > 0) {
          // Find first student record that has a profile image
          const studentWithImage = nameResult.find(student => student.profileImage);
          if (studentWithImage && studentWithImage.profileImage) {
            setProfileImage(studentWithImage.profileImage);
            return; // Exit after finding image
          }
        }
      }
      
    } catch (error) {
      // Log error but don't crash the application
      console.error('Error fetching profile image:', error);
    } finally {
      // Always set loading to false, regardless of success or failure
      setLoading(false);
    }
  };

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================
  
  /**
   * Navigates to the Medical Reports page
   * Allows students to view their complete medical history
   */
  const handleViewReports = () => {
    navigate('/student/reports');
  };

  /**
   * Navigates to the QR Code page
   * Displays student's medical QR code for appointments
   */
  const handleViewQRCode = () => {
    navigate('/student/qrcode');
  };
  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className="dashboard-container">
      {/* ===================================
          HEADER SECTION
          - Displays dashboard title and subtitle
          - Shows user greeting and status
          - Displays profile avatar with multiple fallbacks
          =================================== */}
      <header className="dashboard-header">
        <div className="header-content">
          {/* Left side: Dashboard title and subtitle */}
          <div className="header-left">
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back to your health portal</p>
          </div>
          
          {/* Right side: User info and avatar */}
          <div className="header-right">
            <div className="user-info">
              {/* Greeting with cascading fallback values */}
              <span className="greeting">
                Hello, {currentUser?.name || studentData?.fullName || 'Student'}!
              </span>
              {/* Active status indicator */}
              <div className="user-status">
                <span className="status-dot"></span>
                <span className="status-text">Active</span>
              </div>
            </div>
            
            {/* Avatar display with conditional rendering */}
            <div className="avatar-container">
              {/* Avatar display logic with 4 states:
                  1. No user logged in - show N/A
                  2. Loading profile image from backend - show loading indicator
                  3. Profile image exists - show image
                  4. No image available - show initials placeholder
              */}
              {!currentUser ? (
                <div className="avatar-na">
                  <span className="na-text">NA</span>
                </div>
              ) : loading ? (
                <div className="avatar-loading">
                  <span>...</span>
                </div>
              ) : (profileImage || studentFormData?.profileImage || studentData?.profileImage) ? (
                <img
                  src={profileImage || studentFormData?.profileImage || studentData?.profileImage}
                  alt={currentUser?.name || studentData?.fullName || 'Student'}
                  className="dashboard-avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-initials">
                    {/* Extract first letter of each word, uppercase, max 2 letters */}
                    {(currentUser?.name || studentData?.fullName || 'Student').split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===================================
          MAIN CONTENT SECTION
          - Quick action cards (Reports, Profile, QR Code)
          - Personal information card
          =================================== */}
      <main className="dashboard-main">
        
        {/* ===================================
            QUICK ACTIONS GRID
            Three action cards for main features
            =================================== */}
        <section className="quick-actions">
          <div className="quick-actions-grid">
            
            {/* Action Card 1: Medical Reports */}
            <div className="action-card">
              <div className="action-icon health">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 14C19 18.4183 12 23 12 23C12 23 5 18.4183 5 14C5 9.58172 8.13401 6 12 6C15.866 6 19 9.58172 19 14Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="action-title">Medical Reports</h3>
              <p className="action-description">View your health history</p>
              <button className="action-btn" onClick={handleViewReports}>View Reports</button>
            </div>


            {/* Action Card 2: Update Profile */}
            <div className="action-card">
              <div className="action-icon profile">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="action-title">Update Profile</h3>
              <p className="action-description">Keep your information current and accurate</p>
              <a href="/student/entering-details" className="action-btn">Update</a>
            </div>

            {/* Action Card 3: QR Code */}
            <div className="action-card">
              <div className="action-icon qr">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
                  <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
                  <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="action-title">QR Code</h3>
              <p className="action-description">Quick access ID for medical appointments</p>
              <button className="action-btn" onClick={handleViewQRCode}>View QR</button>
            </div>
          </div>
        </section>

        {/* ===================================
            PERSONAL INFORMATION CARD
            Displays detailed student information
            Three states: No user, Incomplete profile, Complete profile
            =================================== */}
        <section className="info-card">
          <div className="card-header">
            <h2 className="card-title">Personal Information</h2>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          
          {/* Conditional rendering based on user authentication and data availability
              State 1: No user logged in - Show authentication required notice
              State 2: User logged in but no student data - Show complete profile notice
              State 3: User logged in with complete data - Show personal information
          */}
          {!currentUser ? (
            <div className="no-user-notice">
              <div className="notice-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Authentication Required</h3>
              <p>Please log in to view your student information and access all features.</p>
              <a href="/login" className="notice-btn">
                Login to Continue
              </a>
            </div>
          ) : !studentData ? (
            <div className="incomplete-profile-notice">
              <div className="notice-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Complete Your Profile</h3>
              <p>Enhance your healthcare experience by completing your medical profile.</p>
              <a href="/student/entering-details" className="notice-btn">
                Complete Profile
              </a>
            </div>
          ) : (
            <div className="student-details">
              <div className="details-grid">
                {/* Left column: Name, ID, Email, Academic Division */}
                <div className="detail-group">
                  <div className="detail-row">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">
                      {studentData?.fullName || currentUser?.name || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Student ID</span>
                    <span className="detail-value">
                      {studentData?.studentRegistrationNumber || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">
                      {studentData?.email || currentUser?.email || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Academic Division</span>
                    <span className="detail-value">
                      {studentData?.academicDivision ? 
                        studentData.academicDivision.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                        'Not provided'
                      }
                    </span>
                  </div>
                </div>
                
                {/* Right column: Age, Gender, Contact, Emergency Contact */}
                <div className="detail-group">
                  <div className="detail-row">
                    <span className="detail-label">Age</span>
                    <span className="detail-value">
                      {studentData?.age || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Gender</span>
                    <span className="detail-value">
                      {studentData?.gender ? 
                        studentData.gender.charAt(0).toUpperCase() + studentData.gender.slice(1) : 
                        'Not provided'
                      }
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Contact Number</span>
                    <span className="detail-value">
                      {studentData?.telephoneNumber || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Emergency Contact</span>
                    <span className="detail-value">
                      {studentData?.emergencyName ? 
                        `${studentData.emergencyName} (${studentData.emergencyTelephone || 'No phone'})` : 
                        'Not provided'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Export Dashboard component as default export for use in routing
export default Dashboard;