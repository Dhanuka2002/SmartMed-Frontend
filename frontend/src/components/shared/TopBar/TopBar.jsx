import React from 'react';
import './TopBar.css';
import { FiUser } from "react-icons/fi"; 

const TopBar = ({ userRole = 'User', userName = 'User', onLogout, onNotifications, onProfile }) => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="role-display">
          <span className="role-name">{userRole}</span>
        </div>
      </div>
      
      <div className="topbar-center">
        <h1 className="system-title">SmartMed</h1>
      </div>
      
      <div className="topbar-right">
           <div className="user-display">
      <FiUser className="user-icon" />
      <span className="user-name">{userName}</span>
    </div>
      </div>
    </div>
  );
};

export default TopBar;