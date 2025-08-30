import React, { useState, useEffect } from 'react';
import './TopBar.css';
import { FiUser } from "react-icons/fi"; 

const TopBar = ({ userRole = 'User', userName = 'User', onLogout, onNotifications, onProfile }) => {
  const [displayName, setDisplayName] = useState(userName);

  // Update display name when userName prop changes
  useEffect(() => {
    setDisplayName(userName);
  }, [userName]);

  // Also listen for direct localStorage changes as backup
  useEffect(() => {
    const updateUserName = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          if (user?.name) {
            setDisplayName(user.name);
          }
        }
      } catch (error) {
        console.error('Error loading user name in TopBar:', error);
      }
    };

    // Update immediately if no userName was provided
    if (!userName || userName === 'User') {
      updateUserName();
    }

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        updateUserName();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userName]);
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
      <span className="user-name">{displayName}</span>
    </div>
      </div>
    </div>
  );
};

export default TopBar;