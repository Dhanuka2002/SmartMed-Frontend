import React from "react";
import { FiUser } from "react-icons/fi";
import "./TopBar.css";

function TopBar() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Only show user info if the current user is a Pharmacy
  const isCurrentUserPharmacy = currentUser.role === 'Pharmacy';

  return (
    <div className="topbar">
      <h2 className="topbar-title">Pharmacy</h2>
      {currentUser.name && isCurrentUserPharmacy && (
        <div className="topbar-user-info">
          <FiUser size={20} className="user-icon" />
          <div className="user-details">
            <div className="user-name">{currentUser.name}</div>
            <div className="user-email">{currentUser.email}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopBar;
