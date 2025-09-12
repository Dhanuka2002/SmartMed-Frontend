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
    
    // Check if Jitsi API is available before proceeding
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi API not available');
      alert('Video calling system is not ready. Please refresh the page and try again.');
      setIsRequestSent(false);
      setIsWaitingResponse(false);
      return;
    }
    
    console.log('Jitsi API is available, proceeding with video call request');
    
    // Create or get shared room name
    let roomName = localStorage.getItem('smartmed_room_name');
    if (!roomName) {
      roomName = `SmartMed-${Date.now()}`;
      localStorage.setItem('smartmed_room_name', roomName);
    }
    
    const notification = {
      id: Date.now(),
      type: 'video_call_request',
      title: 'Video Conference Request',
      message: 'A student is requesting a video conference consultation',
      studentName: 'Student User', // In real app, get from auth context
      studentId: 'STU001', // In real app, get from auth context
      roomName: roomName,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    const existingNotifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
    existingNotifications.push(notification);
    localStorage.setItem('telemed_notifications', JSON.stringify(existingNotifications));

    console.log('Video call request sent to doctor');

    let checkCount = 0;
    const maxChecks = 30; // 30 seconds total
    
    const checkForResponse = setInterval(() => {
      checkCount++;
      
      try {
        const currentNotifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
        const myRequest = currentNotifications.find(n => 
          n.id === notification.id && 
          n.type === 'video_call_request' && 
          n.studentId === 'STU001' && 
          n.status === 'accepted'
        );

        if (myRequest) {
          clearInterval(checkForResponse);
          setIsWaitingResponse(false);
          // Add a small delay to ensure Jitsi API is ready
          setTimeout(() => {
            navigate('/student/telemed-call');
          }, 500);
        } else if (checkCount >= maxChecks) {
          clearInterval(checkForResponse);
          setIsWaitingResponse(false);
          setIsRequestSent(false);
          alert('No response from doctor. Please try again later.');
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
        clearInterval(checkForResponse);
        setIsWaitingResponse(false);
        setIsRequestSent(false);
        alert('Error processing request. Please try again.');
      }
    }, 1000);

    // Cleanup timeout - this will run if component unmounts
    return () => {
      clearInterval(checkForResponse);
    };
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
