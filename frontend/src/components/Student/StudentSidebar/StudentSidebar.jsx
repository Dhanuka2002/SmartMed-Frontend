import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./StudentSidebar.css";

// Icons
import { 
  FiSettings, 
  FiHome, 
  FiClock, 
  FiFileText, 
  FiBarChart2, 
  FiLogOut, 
  FiVideo,
  FiEdit3,
  FiActivity
} from "react-icons/fi";

// ✅ Correct import path (if logo is in src/assets)


function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all session data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentEmail');
    
    // Clear any cached data
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('qrCodeData_') || key.startsWith('medicalRecordId_') || 
          key.startsWith('studentData_') || key.startsWith('hospitalData_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Redirect to login
    navigate('/login');
  };


  return (
    <div className="sidebar">
     
      

      <ul className="menu">
        <li>
          <NavLink 
            to="/student/dashboard"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiHome size={18} className="menu-icon" />
            Dashboard
          </NavLink>
        </li>
      
        <li>
          <NavLink 
            to="/student/qrcode"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiActivity size={18} className="menu-icon" />
            QR Code
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/student/telemed"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiVideo size={18} className="menu-icon" />
            Telemed
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/student/reports"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiBarChart2 size={18} className="menu-icon" />
            Reports
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/student/entering-details"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiEdit3 size={18} className="menu-icon" />
            Entering Details
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-bottom">
        <button 
          onClick={handleLogout}
          className="logout-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.75rem 1rem',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#c82333'}
          onMouseOut={(e) => e.target.style.background = '#dc3545'}
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
