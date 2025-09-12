import React from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./AlertMessage.css";

const AlertMessage = ({ 
  type = "success", 
  title, 
  message, 
  show, 
  onClose, 
  autoClose = true, 
  duration = 3000,
  userName = null 
}) => {
  
  React.useEffect(() => {
    if (show && autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onClose, duration]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="alert-icon success-icon" />;
      case "error":
        return <FaExclamationCircle className="alert-icon error-icon" />;
      case "warning":
        return <FaExclamationCircle className="alert-icon warning-icon" />;
      case "info":
        return <FaInfoCircle className="alert-icon info-icon" />;
      default:
        return <FaCheckCircle className="alert-icon success-icon" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case "success":
        return "Success!";
      case "error":
        return "Error!";
      case "warning":
        return "Warning!";
      case "info":
        return "Information";
      default:
        return "Success!";
    }
  };

  return (
    <div className="alert-overlay">
      <div className={`alert-message ${type}-alert`}>
        {onClose && (
          <button className="alert-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        )}
        
        <div className="alert-icon-container">
          {getIcon()}
        </div>
        
        <h2 className="alert-title">{getTitle()}</h2>
        
        {message && (
          <p className="alert-subtitle">
            {userName && type === "success" && message.includes("Welcome") 
              ? `Welcome back, ${userName}!` 
              : message
            }
          </p>
        )}
        
        {type === "success" && autoClose && (
          <div className="alert-loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;