import React from "react";
import { FiUser } from "react-icons/fi";
import "./DoctorTopBar.css";

function DoctorTopBar() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Only show user info if the current user is a Doctor
  const isCurrentUserDoctor = currentUser.role === 'Doctor';

  return (
    <div className="topbar">
      <h2 className="topbar-title">Doctor</h2>
      {currentUser.name && isCurrentUserDoctor && (
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

export default DoctorTopBar;
