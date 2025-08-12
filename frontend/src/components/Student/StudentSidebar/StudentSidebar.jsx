import React from "react";
import { NavLink } from "react-router-dom";
import "./StudentSidebar.css";

// Icons
import { FiSettings, FiClipboard, FiBox, FiFileText, FiBarChart2 } from "react-icons/fi";

// ✅ Correct import path (if logo is in src/assets)
import logo from "../../../assets/logo.png";

function Sidebar() {
  return (
    <div className="sidebar">
      <img src={logo} alt="Pharmacy Logo" className="logo-img" />

      <ul className="menu">
        <li>
          <NavLink 
            to="/student/dashboard"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiClipboard size={18} className="menu-icon" />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/student/history"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiBox size={18} className="menu-icon" />
            History
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/student/qrcode"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiFileText size={18} className="menu-icon" />
            QR Code
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/student/telemed"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiBarChart2 size={18} className="menu-icon" />
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

           <NavLink 
            to="/student/entering-details"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiBarChart2 size={18} className="menu-icon" />
            Entering Details
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

export default Sidebar;
