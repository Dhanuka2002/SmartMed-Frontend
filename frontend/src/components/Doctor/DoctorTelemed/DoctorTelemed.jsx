import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorTelemed.css'; // optional, match your style
import telemeddoctor from '../../../assets/telemeddoctor.png';
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';

function DoctorTelemed() {
  const { alertState, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const navigate = useNavigate();

  // Check for pending video call requests
  useEffect(() => {
    const checkForRequests = () => {
      try {
        const notifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
        const pending = notifications.filter(n => 
          n.type === 'video_call_request' && 
          n.status === 'pending'
        );
        setPendingRequests(pending);
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    // Check immediately and then every 2 seconds
    checkForRequests();
    const interval = setInterval(checkForRequests, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleAcceptCall = (requestId) => {
    try {
      // Check if Jitsi API is available
      if (!window.JitsiMeetExternalAPI) {
        console.error('Jitsi API not available for call acceptance');
        showError('Video calling system is not ready. Please refresh the page and try again.', 'System Error');
        return;
      }
      
      console.log('Jitsi API is available, accepting call');

      // Find the request to get room name
      const notifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
      const request = notifications.find(n => n.id === requestId);
      
      if (request && request.roomName) {
        // Use the room name from the request
        localStorage.setItem('smartmed_room_name', request.roomName);
      }

      // Update the notification status
      const updatedNotifications = notifications.map(n => 
        n.id === requestId ? { ...n, status: 'accepted' } : n
      );
      localStorage.setItem('telemed_notifications', JSON.stringify(updatedNotifications));

      console.log('Accepting call for room:', request?.roomName);

      // Navigate to video call
      navigate('/doctor/telemed-call');
    } catch (error) {
      console.error('Error accepting call:', error);
      showError('Error accepting call. Please try again.', 'Call Error');
    }
  };

  const handleDeclineCall = (requestId) => {
    try {
      // Update the notification status
      const notifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
      const updatedNotifications = notifications.map(n => 
        n.id === requestId ? { ...n, status: 'declined' } : n
      );
      localStorage.setItem('telemed_notifications', JSON.stringify(updatedNotifications));

      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  const handleJoinCall = () => {
    // Check if Jitsi API is available
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi API not available for new call');
      showError('Video calling system is not ready. Please refresh the page and try again.', 'System Error');
      return;
    }
    
    console.log('Jitsi API is available, starting new call');

    setIsCallStarting(true);

    setTimeout(() => {
      setIsCallStarting(false);
      navigate('/doctor/telemed-call');
    }, 1000);
  };

  useEffect(() => {
    if (showVideoCall) {
      const domain = "meet.jit.si";
      const options = {
        roomName: "SmartMed-Telemed-Room", // standardized room name
        width: "100%",
        height: 600,
        parentNode: document.getElementById("doctor-jitsi-container"),
        userInfo: {
          displayName: "Dr. SmartMed",
          email: "doctor@smartmed.com"
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'hangup', 'chat',
            'raisehand', 'participants-pane', 'tileview'
          ]
        }
      };
      const api = new window.JitsiMeetExternalAPI(domain, options);

      return () => api.dispose();
    }
  }, [showVideoCall]);

  return (
    <div className="telemed-container">
      {!showVideoCall && (
        <div className="telemed-content">
          <div className="telemed-left">
            <h1 className="telemed-heading">
              Telemedicine <span className="gradient-text">Video Calls</span>
            </h1>
            
            {/* Pending Call Requests */}
            {pendingRequests.length > 0 && (
              <div style={{ 
                marginBottom: '30px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px solid #007bff'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>
                  📞 Incoming Video Call Requests ({pendingRequests.length})
                </h3>
                {pendingRequests.map((request) => (
                  <div key={request.id} style={{
                    background: '#fff',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    border: '1px solid #dee2e6'
                  }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                      {request.studentName} is requesting a video consultation
                    </p>
                    <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                      Received: {new Date(request.timestamp).toLocaleTimeString()}
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleAcceptCall(request.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ✅ Accept Call
                      </button>
                      <button
                        onClick={() => handleDeclineCall(request.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ❌ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="telemed-subtitle">
              Start a secure video session with your patient or join an existing room.
            </p>
            <button
              onClick={handleJoinCall}
              disabled={isCallStarting}
              className={`primary-button ${isCallStarting ? 'loading' : ''}`}
            >
              {isCallStarting ? (
                <>
                  <div className="loading-spinner"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <span className="video-icon">📹</span>
                  Start New Video Call
                  <span className="arrow-icon">→</span>
                </>
              )}
            </button>
          </div>

          <div className="telemed-right">
            <img
              src={telemeddoctor}
              alt="Doctor Video Call"
              className="doctor-hero-image"
            />
          </div>
        </div>
      )}

      {showVideoCall && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Telemedicine Call with Patient</h2>
          <div id="doctor-jitsi-container" style={{ width: "100%", height: "600px", border: '1px solid #ddd', borderRadius: '8px' }} />
          <button
            onClick={() => {
              setShowVideoCall(false);
              navigate('/doctor/dashboard');
            }}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#ff4d4d',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            End Call
          </button>
        </div>
      )}

      <AlertMessage
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        show={alertState.show}
        onClose={hideAlert}
        autoClose={alertState.autoClose}
        duration={alertState.duration}
        userName={alertState.userName}
      />
    </div>
  );
}

export default DoctorTelemed;
