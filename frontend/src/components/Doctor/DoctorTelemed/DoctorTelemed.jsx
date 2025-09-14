import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorTelemed.css'; // optional, match your style
import telemeddoctor from '../../../assets/telemeddoctor.png';
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';
import videoCallService from '../../../services/videoCallService.js';
import notificationSoundService from '../../../services/notificationSoundService.js';

function DoctorTelemed() {
  const { alertState, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [previousRequestCount, setPreviousRequestCount] = useState(0);
  const navigate = useNavigate();

  // Initialize video call service and check for pending requests
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    videoCallService.init(currentUser);

    // Initialize notification sound service
    notificationSoundService.initAudioContext();

    // Start polling for video call requests
    const stopPolling = videoCallService.startPollingForRequests((requests, isOffline) => {
      setPendingRequests(requests);
      setIsOnline(!isOffline);

      // Play notification sound for new requests
      if (requests.length > previousRequestCount && requests.length > 0) {
        console.log(`New video call request received! Total: ${requests.length}`);

        // Play notification sound
        notificationSoundService.playNotificationSound('video_call_request');

        // Show browser notification if possible
        if (requests.length > 0) {
          const latestRequest = requests[requests.length - 1];
          showInfo(`New video call request from ${latestRequest.studentName}`, 'Incoming Call');
        }
      }

      setPreviousRequestCount(requests.length);
    }, 3000); // Poll every 3 seconds

    // Cleanup polling on component unmount
    return () => {
      stopPolling();
      videoCallService.stopPolling();
    };
  }, []);

  const handleAcceptCall = async (requestId) => {
    try {
      // Check if Jitsi API is available
      if (!window.JitsiMeetExternalAPI) {
        console.error('Jitsi API not available for call acceptance');
        showError('Video calling system is not ready. Please refresh the page and try again.', 'System Error');
        return;
      }

      console.log('Accepting video call request:', requestId);

      // Accept the call using the new service
      const result = await videoCallService.acceptVideoCallRequest(requestId);

      if (result.success) {
        // Store room name for the video call
        localStorage.setItem('smartmed_room_name', result.roomName);

        if (result.isOffline) {
          showSuccess('Call accepted! Starting video conference...', 'Call Accepted');
        } else {
          showSuccess(`Accepted call from ${result.studentInfo?.name || 'Student'}! Starting video conference...`, 'Call Accepted');
        }

        console.log('Navigating to video call with room:', result.roomName);

        // Navigate to video call
        setTimeout(() => {
          navigate('/doctor/telemed-call');
        }, 1500);

      } else {
        throw new Error(result.error || 'Failed to accept video call');
      }

    } catch (error) {
      console.error('Error accepting call:', error);
      showError('Error accepting call. Please try again.', 'Call Error');
    }
  };

  const handleDeclineCall = async (requestId) => {
    try {
      console.log('Declining video call request:', requestId);

      // Decline the call using the new service
      const result = await videoCallService.declineVideoCallRequest(requestId);

      if (result.success) {
        // Remove from pending requests
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));

        if (result.isOffline) {
          showInfo('Call declined (offline mode)', 'Call Declined');
        } else {
          showInfo('Video call request declined', 'Call Declined');
        }

      } else {
        throw new Error(result.error || 'Failed to decline video call');
      }

    } catch (error) {
      console.error('Error declining call:', error);
      showError('Error declining call. Please try again.', 'Decline Error');
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

            {/* Connection Status Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: isOnline ? '#d4edda' : '#fff3cd',
              borderRadius: '8px',
              border: `1px solid ${isOnline ? '#c3e6cb' : '#ffeaa7'}`
            }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#28a745' : '#ffc107',
                marginRight: '8px'
              }}></span>
              <span style={{
                fontSize: '14px',
                color: isOnline ? '#155724' : '#856404'
              }}>
                {isOnline ? 'Online - Real-time notifications active' : 'Offline - Using local storage fallback'}
              </span>
            </div>
            
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
