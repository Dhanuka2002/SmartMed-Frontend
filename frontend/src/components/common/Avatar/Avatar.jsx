import React from 'react';
import './Avatar.css';

const Avatar = ({ 
  src, 
  alt = "User Avatar", 
  size = "medium", 
  onClick, 
  showUploadIcon = false,
  className = ""
}) => {
  const sizeClasses = {
    small: "avatar-small",
    medium: "avatar-medium", 
    large: "avatar-large"
  };

  return (
    <div 
      className={`avatar-container ${sizeClasses[size]} ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="avatar-image"
        />
      ) : (
        <div className="avatar-placeholder">
          <span className="avatar-initials">
            {alt.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>
      )}
      {showUploadIcon && (
        <div className="avatar-upload-overlay">
          <span className="upload-icon">📷</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;