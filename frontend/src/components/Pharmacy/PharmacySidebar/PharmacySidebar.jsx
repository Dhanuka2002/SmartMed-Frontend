import React from "react";
import { NavLink } from "react-router-dom";
import "./PharmacySidebar.css";

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
            to="/" 
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
            to="/medicine-requests"
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <FiFileText size={18} className="menu-icon" />
            Medicine Requests
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

      <div className="settings">
        <FiSettings size={20} />
        <span>Settings</span>
      </div>
    </div>
  );
}

export default Sidebar;
