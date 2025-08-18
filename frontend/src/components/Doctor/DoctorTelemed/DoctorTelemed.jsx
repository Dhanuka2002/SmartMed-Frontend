import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorTelemed.css'; // optional, match your style
import telemeddoctor from '../../../assets/telemeddoctor.png';

function DoctorTelemed() {
  const [isCallStarting, setIsCallStarting] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const navigate = useNavigate();

  const handleJoinCall = () => {
    setIsCallStarting(true);

    setTimeout(() => {
      setIsCallStarting(false);
      setShowVideoCall(true);
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
              Join Your <span className="gradient-text">Patient’s Call</span>
            </h1>
            <p className="telemed-subtitle">
              Start a secure video session with your patient now.
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
                  Join Video Call
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
    </div>
  );
}

export default DoctorTelemed;
