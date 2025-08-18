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

  // Only render if there's an image source
  if (!src) {
    return null;
  }

  return (
    <div 
      className={`avatar-container ${sizeClasses[size]} ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <img 
        src={src} 
        alt={alt} 
        className="avatar-image"
      />
      {showUploadIcon && (
        <div className="avatar-upload-overlay">
          <span className="upload-icon">📷</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;