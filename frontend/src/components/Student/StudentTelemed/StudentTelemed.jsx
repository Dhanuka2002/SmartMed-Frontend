import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';
import videoCallService from '../../../services/videoCallService.js';
import './StudentTelemed.css';
import telemeddoctor from '../../../assets/telemeddoctor.png';

function StudentTelemed() {
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const navigate = useNavigate();
  const { alertState, showError, showWarning, showSuccess, hideAlert } = useAlert();

  // Initialize video call service with current user info
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    videoCallService.init(currentUser);

    // Cleanup polling on component unmount
    return () => {
      videoCallService.stopPolling();
    };
  }, []);

  const sendVideoCallRequest = async () => {
    setIsRequestSent(true);
    setIsWaitingResponse(true);

    // Check if Jitsi API is available before proceeding
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi API not available');
      showError('Video calling system is not ready. Please refresh the page and try again.', 'Video System Error');
      setIsRequestSent(false);
      setIsWaitingResponse(false);
      return;
    }

    try {
      console.log('Sending video call request to doctor...');

      // Send video call request using the new service
      const requestResult = await videoCallService.sendVideoCallRequest();

      if (requestResult.success) {
        setCurrentRequestId(requestResult.requestId);

        if (requestResult.isOffline) {
          showWarning('Request sent in offline mode. Doctor will see it when back online.', 'Offline Mode');
        } else {
          showSuccess('Video call request sent to doctor. Waiting for response...', 'Request Sent');
        }

        // Store room name for later use
        localStorage.setItem('smartmed_room_name', requestResult.roomName);

        console.log('Waiting for doctor response...');

        // Wait for doctor response (30 seconds timeout)
        const responseResult = await videoCallService.waitForDoctorResponse(requestResult.requestId, 30000);

        if (responseResult.success && responseResult.status === 'accepted') {
          setIsWaitingResponse(false);

          if (responseResult.isOffline) {
            showSuccess('Doctor accepted the call! Starting video conference...', 'Call Accepted');
          } else {
            showSuccess(`Dr. ${responseResult.doctorInfo?.name || 'Doctor'} accepted the call! Starting video conference...`, 'Call Accepted');
          }

          // Store room name and navigate to video call
          localStorage.setItem('smartmed_room_name', responseResult.roomName);

          setTimeout(() => {
            navigate('/student/telemed-call');
          }, 1500);

        } else if (responseResult.status === 'declined') {
          setIsWaitingResponse(false);
          setIsRequestSent(false);
          setCurrentRequestId(null);
          showWarning('Doctor declined the video call request. Please try again later.', 'Call Declined');

        } else if (responseResult.status === 'timeout') {
          setIsWaitingResponse(false);
          setIsRequestSent(false);
          setCurrentRequestId(null);
          showWarning('No response from doctor within 30 seconds. Please try again later.', 'No Response');
        }

      } else {
        throw new Error(requestResult.error || 'Failed to send video call request');
      }

    } catch (error) {
      console.error('Error sending video call request:', error);
      setIsRequestSent(false);
      setIsWaitingResponse(false);
      setCurrentRequestId(null);
      showError('Error sending video call request. Please check your connection and try again.', 'Request Error');
    }
  };

  return (
    <div className="telemed-container">
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
