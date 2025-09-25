import { useState } from 'react';

const useAlert = () => {
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'success',
    title: '',
    message: '',
    userName: null,
    duration: 3000,
    autoClose: true
  });

  const showAlert = ({ 
    type = 'success', 
    title, 
    message, 
    userName = null, 
    duration = 3000, 
    autoClose = true 
  }) => {
    setAlertState({
      show: true,
      type,
      title,
      message,
      userName,
      duration,
      autoClose
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({
      ...prev,
      show: false
    }));
  };

  // Convenience methods
  const showSuccess = (message, title = "Success!", userName = null, duration = 3000) => {
    showAlert({ type: 'success', title, message, userName, duration });
  };

  const showError = (message, title = "Error!", duration = 5000) => {
    showAlert({ type: 'error', title, message, duration, autoClose: true });
  };

  const showWarning = (message, title = "Warning!", duration = 4000) => {
    showAlert({ type: 'warning', title, message, duration, autoClose: true });
  };

  const showInfo = (message, title = "Information", duration = 3000) => {
    showAlert({ type: 'info', title, message, duration, autoClose: true });
  };

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useAlert;