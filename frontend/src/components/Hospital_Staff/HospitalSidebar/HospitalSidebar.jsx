import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./HospitalSidebar.css";

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

// Settings tab added for all roles

function HospitalSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };


  return (
    <div className="sidebar">
    
      

      <ul className="menu">
        <li>
          <NavLink 
            to="/hospital-staff" 
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiHome size={18} className="menu-icon" />
            Dashboard
          </NavLink>
        </li>

       
        <li>
          <NavLink 
            to="/hospital-staff/settings"
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

export default HospitalSidebar;
