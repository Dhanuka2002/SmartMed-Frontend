import React, { useState, useEffect } from 'react';
import './DoctorTelemed.css'; // optional, match your style
import telemeddoctor from '../../../assets/telemeddoctor.png';

function DoctorTelemed() {
  const [isCallStarting, setIsCallStarting] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

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
        roomName: "SmartMed_Room_123", // ⚡️ Make sure it matches Student side!
        width: "100%",
        height: 600,
        parentNode: document.getElementById("doctor-jitsi-container"),
        userInfo: {
          displayName: "Doctor Name", // Or doctor’s real name
        },
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
        <div id="doctor-jitsi-container" style={{ width: "100%", height: "600px" }} />
      )}
    </div>
  );
}

export default DoctorTelemed;
