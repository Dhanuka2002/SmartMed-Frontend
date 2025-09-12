import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentTelemed.css';
import telemeddoctor from '../../../assets/telemeddoctor.png';

function StudentTelemed() {
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const navigate = useNavigate();

  const sendVideoCallRequest = () => {
    setIsRequestSent(true);
    setIsWaitingResponse(true);
    
    const notification = {
      type: 'video_call_request',
      title: 'Video Conference Request',
      message: 'A student is requesting a video conference consultation',
      studentName: 'Student User', // In real app, get from auth context
      studentId: 'STU001', // In real app, get from auth context
      status: 'pending'
    };

    const existingNotifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
    existingNotifications.push(notification);
    localStorage.setItem('telemed_notifications', JSON.stringify(existingNotifications));

    console.log('Video call request sent to doctor');

    const checkForResponse = setInterval(() => {
      const currentNotifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
      const myRequest = currentNotifications.find(n => 
        n.type === 'video_call_request' && 
        n.studentId === 'STU001' && 
        n.status === 'accepted'
      );

      if (myRequest) {
        clearInterval(checkForResponse);
        setIsWaitingResponse(false);
        navigate('/student/telemed-call');
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(checkForResponse);
      if (isWaitingResponse) {
        setIsWaitingResponse(false);
        alert('No response from doctor. Please try again later.');
        setIsRequestSent(false);
      }
    }, 30000);
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
            onClick={sendVideoCallRequest}
            disabled={isWaitingResponse || isRequestSent}
            className={`primary-button ${isWaitingResponse ? 'loading' : ''}`}
          >
            {isWaitingResponse ? (
              <>
                <div className="loading-spinner"></div>
                Waiting for Doctor Response...
              </>
            ) : isRequestSent ? (
              <>
                <span className="video-icon">✅</span>
                Request Sent - Please Wait
              </>
            ) : (
              <>
                <span className="video-icon">📹</span>
                Request Video Call
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
