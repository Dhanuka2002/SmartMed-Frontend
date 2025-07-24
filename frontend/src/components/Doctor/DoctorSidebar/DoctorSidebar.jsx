import React from "react";
import { NavLink } from "react-router-dom";
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
  FiActivity 
} from "react-icons/fi";

import logo from "../../../assets/logo.png";

function DoctorSidebar() {
  return (
    <div className="sidebar">
      <img src={logo} alt="Doctor Logo" className="logo-img" />

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
            to="/doctor/reports"
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
      </ul>

      <div className="settings">
        <FiSettings size={20} />
        <span>Settings</span>
      </div>
    </div>
  );
}

export default DoctorSidebar;
