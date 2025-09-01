import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./PharmacySidebar.css";

// Icons
import { FiSettings, FiClipboard, FiBox, FiFileText, FiBarChart2, FiLogOut } from "react-icons/fi";

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
            to="/pharmacy/queue" 
            end
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiClipboard size={18} className="menu-icon" />
            Prescription Queue
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/inventory"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiBox size={18} className="menu-icon" />
            Inventory
          </NavLink>
        </li>
        
        <li>
          <NavLink 
            to="/reports"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiBarChart2 size={18} className="menu-icon" />
            Reports
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
