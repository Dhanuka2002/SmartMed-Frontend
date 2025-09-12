import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./DoctorSidebar.css";

// Icons
import { 
  FiSettings, 
  FiHome, 
  FiUsers, 
  FiUser, 
  FiClipboard, 
  FiBell, 
  FiFileText, 
  FiActivity,
  FiLogOut
} from "react-icons/fi";



function DoctorSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentEmail');
    navigate('/login');
  };


  return (
    <div className="sidebar">
    
      

      <ul className="menu">
        <li>
          <NavLink 
            to="/doctor/dashboard" 
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiHome size={18} className="menu-icon" />
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/doctor/queue"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiActivity size={18} className="menu-icon" />
            Queue
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/doctor/patient"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiUser size={18} className="menu-icon" />
            Patients
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/doctor/pharmacy"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiClipboard size={18} className="menu-icon" />
            Pharmacy
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/doctor/report"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiFileText size={18} className="menu-icon" />
            Reports
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/doctor/telemed"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiBell size={18} className="menu-icon" />
            Telemed
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/doctor/settings"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiSettings size={18} className="menu-icon" />
            Settings
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

export default DoctorSidebar;
