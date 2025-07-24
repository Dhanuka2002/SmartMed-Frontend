import React, { useState } from 'react';
import './StudentTelemed.css';
import telemeddoctor from '../../../assets/telemeddoctor.png';

function StudentTelemed() {
  const [isCallStarting, setIsCallStarting] = useState(false);

  const handleVideoCall = () => {
    setIsCallStarting(true);
    console.log('Starting video call...');

    setTimeout(() => {
      setIsCallStarting(false);
      // Actual video call logic goes here
    }, 3000);
  };

  return (
    <div className="telemed-container">
      <div className="telemed-content">
        {/* Text & Action */}
        <div className="telemed-left">
          <h1 className="telemed-heading">
            Talk to a Doctor Online <br />
            <span className="gradient-text">Anywhere, Anytime</span>
          </h1>
          <p className="telemed-subtitle">
            Connect instantly with certified doctors through secure video calls.
          </p>
          <button
            onClick={handleVideoCall}
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
                Start Video Call Now
                <span className="arrow-icon">→</span>
              </>
            )}
          </button>
        </div>

        {/* Visual */}
        <div className="telemed-right">
          <img
            src={telemeddoctor}
            alt="Telemedicine Doctor"
            className="doctor-hero-image"
          />
        </div>
      </div>
    </div>
  );
}

export default StudentTelemed;
