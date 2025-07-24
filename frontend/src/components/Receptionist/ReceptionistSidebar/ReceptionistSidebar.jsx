import React from "react";
import { NavLink } from "react-router-dom";
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
  FiActivity 
} from "react-icons/fi";

import logo from "../../../assets/logo.png";

function ReceptionistSidebar() {
  return (
    <div className="sidebar">
      <img src={logo} alt="Doctor Logo" className="logo-img" />

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
            to="/receptionist/qr"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiActivity size={18} className="menu-icon" />
            QR
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

      <div className="settings">
        <FiSettings size={20} />
        <span>Settings</span>
      </div>
    </div>
  );
}

export default ReceptionistSidebar;
