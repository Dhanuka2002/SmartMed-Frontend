import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./ReceptionistSidebar.css";

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



function ReceptionistSidebar() {
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
            to="/receptionist/dashboard" 
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiHome size={18} className="menu-icon" />
            Dashboard
          </NavLink>
        </li>

       
        <li>
          <NavLink 
            to="/receptionist/queue"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiUser size={18} className="menu-icon" />
            Queue
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/receptionist/notifications"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiClipboard size={18} className="menu-icon" />
            Notification
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

export default ReceptionistSidebar;
