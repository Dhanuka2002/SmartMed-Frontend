/**
 * StudentTelemed Component
 * 
 * Telemedicine interface allowing students to request video calls with doctors.
 * Provides a user-friendly interface for initiating and managing video consultation requests.
 * 
 * Features:
 * - Video call request initiation
 * - Real-time status updates (waiting, accepted, declined, timeout)
 * - Jitsi Meet integration for video conferencing
 * - Automatic polling for doctor responses
 * - Offline mode support
 * - Navigation to video call interface upon acceptance
 * 
 * Flow:
 * 1. Student clicks "Request Video Call" button
 * 2. System sends request to available doctor
 * 3. Component polls for doctor response (30s timeout)
 * 4. Upon acceptance, navigates to video call room
 * 5. Handles declined or timeout scenarios with user feedback
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router navigation hook
import AlertMessage from '../../Common/AlertMessage'; // Alert notification component
import useAlert from '../../../hooks/useAlert'; // Custom hook for alert management
import videoCallService from '../../../services/videoCallService.js'; // Video call business logic service
import './StudentTelemed.css';
import telemeddoctor from '../../../assets/telemeddoctor.png'; // Hero image

function StudentTelemed() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /** 
   * Flag indicating if a video call request has been sent
   * Used to update button UI and prevent duplicate requests
   */
  const [isRequestSent, setIsRequestSent] = useState(false);
  
  /** 
   * Flag indicating if component is waiting for doctor response
   * Shows loading spinner and disables button during wait period
   */
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  
  /** 
   * Unique identifier for the current video call request
   * Used for tracking and canceling requests
   */
  const [currentRequestId, setCurrentRequestId] = useState(null);
  
  /** React Router navigation function */
  const navigate = useNavigate();
  
  /** Alert hook for displaying success/error/warning messages */
  const { alertState, showError, showWarning, showSuccess, hideAlert } = useAlert();

  // ============================================================================
  // INITIALIZATION & CLEANUP
  // ============================================================================
  
  /**
   * Effect hook to initialize video call service and cleanup on unmount
   * 
   * Initialization:
   * - Retrieves current user from localStorage
   * - Initializes videoCallService with user information
   * 
   * Cleanup:
   * - Stops polling for doctor responses to prevent memory leaks
   * - Executes when component unmounts
   */
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    videoCallService.init(currentUser);

    // Cleanup polling on component unmount
    return () => {
      videoCallService.stopPolling();
    };
  }, []);

  // ============================================================================
  // VIDEO CALL REQUEST HANDLER
  // ============================================================================
  
  /**
   * Sends video call request to available doctor and waits for response
   * 
   * Process flow:
   * 1. Validates Jitsi Meet API availability
   * 2. Sends request via videoCallService
   * 3. Stores room name in localStorage
   * 4. Polls for doctor response (30-second timeout)
   * 5. Handles response scenarios:
   *    - Accepted: Navigate to video call room
   *    - Declined: Show warning, reset state
   *    - Timeout: Show warning, reset state
   * 6. Manages offline mode gracefully
   * 
   * State updates:
   * - Sets isRequestSent = true immediately
   * - Sets isWaitingResponse = true during polling
   * - Resets states on decline/timeout/error
   * 
   * @async
   * @throws {Error} If request fails or Jitsi API unavailable
   */
  const sendVideoCallRequest = async () => {
    setIsRequestSent(true);
    setIsWaitingResponse(true);

    // Validate Jitsi Meet External API is loaded
    // Required for video conferencing functionality
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi API not available');
      showError('Video calling system is not ready. Please refresh the page and try again.', 'Video System Error');
      setIsRequestSent(false);
      setIsWaitingResponse(false);
      return;
    }

    try {
      console.log('Sending video call request to doctor...');

      // Send video call request using videoCallService
      // Returns: {success, requestId, roomName, isOffline, error}
      const requestResult = await videoCallService.sendVideoCallRequest();

      if (requestResult.success) {
        // Store request ID for tracking and potential cancellation
        setCurrentRequestId(requestResult.requestId);

        // Show appropriate message based on doctor's online status
        if (requestResult.isOffline) {
          showWarning('Request sent in offline mode. Doctor will see it when back online.', 'Offline Mode');
        } else {
          showSuccess('Video call request sent to doctor. Waiting for response...', 'Request Sent');
        }

        // Store room name in localStorage for video call component access
        localStorage.setItem('smartmed_room_name', requestResult.roomName);

        console.log('Waiting for doctor response...');

        // Poll for doctor response with 30-second timeout
        // Polls every 2 seconds until response or timeout
        const responseResult = await videoCallService.waitForDoctorResponse(requestResult.requestId, 30000);

        // ===== SCENARIO 1: Doctor Accepted Call =====
        if (responseResult.success && responseResult.status === 'accepted') {
          setIsWaitingResponse(false);

          // Display doctor name if available (online mode)
          if (responseResult.isOffline) {
            showSuccess('Doctor accepted the call! Starting video conference...', 'Call Accepted');
          } else {
            showSuccess(`Dr. ${responseResult.doctorInfo?.name || 'Doctor'} accepted the call! Starting video conference...`, 'Call Accepted');
          }

          // Store room name for video call component
          localStorage.setItem('smartmed_room_name', responseResult.roomName);

          // Navigate to video call interface after brief delay (1.5s)
          // Delay allows user to see success message
          setTimeout(() => {
            navigate('/student/telemed-call');
          }, 1500);

        // ===== SCENARIO 2: Doctor Declined Call =====
        } else if (responseResult.status === 'declined') {
          // Reset all states to allow new request
          setIsWaitingResponse(false);
          setIsRequestSent(false);
          setCurrentRequestId(null);
          showWarning('Doctor declined the video call request. Please try again later.', 'Call Declined');

        // ===== SCENARIO 3: Response Timeout (30s elapsed) =====
        } else if (responseResult.status === 'timeout') {
          // Reset all states to allow new request
          setIsWaitingResponse(false);
          setIsRequestSent(false);
          setCurrentRequestId(null);
          showWarning('No response from doctor within 30 seconds. Please try again later.', 'No Response');
        }

      } else {
        // Request failed at service level
        throw new Error(requestResult.error || 'Failed to send video call request');
      }

    } catch (error) {
      // Handle any errors during request/response process
      console.error('Error sending video call request:', error);
      
      // Reset all states to allow retry
      setIsRequestSent(false);
      setIsWaitingResponse(false);
      setCurrentRequestId(null);
      
      showError('Error sending video call request. Please check your connection and try again.', 'Request Error');
    }
  };

  // ============================================================================
  // JSX RENDER
  // ============================================================================
  
  return (
    <div className="telemed-container">
      {/* Alert notification component for displaying status messages */}
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
      
      {/* ===== MAIN CONTENT LAYOUT ===== */}
      {/* Two-column layout: Text/Action (left) and Hero Image (right) */}
      <div className="telemed-content">
        
        {/* ===== LEFT COLUMN: Text & Call-to-Action ===== */}
        {/* Contains heading, subtitle, and request button with dynamic states */}
        <div className="telemed-left">
          <h1 className="telemed-heading">
            Talk to a Doctor Online <br />
            <span className="gradient-text">Anywhere, Anytime</span>
          </h1>
          <p className="telemed-subtitle">
            Connect instantly with certified doctors through secure video calls.
          </p>
          
          {/* Dynamic request button with three states: waiting, sent, default */}
          <button
            onClick={sendVideoCallRequest}
            disabled={isWaitingResponse || isRequestSent}
            className={`primary-button ${isWaitingResponse ? 'loading' : ''}`}
          >
            {isWaitingResponse ? (
              /* State 1: Waiting for doctor response - show spinner */
              <>
                <div className="loading-spinner"></div>
                Waiting for Doctor Response...
              </>
            ) : isRequestSent ? (
              /* State 2: Request sent successfully - show confirmation */
              <>
                <span className="video-icon">✅</span>
                Request Sent - Please Wait
              </>
            ) : (
              /* State 3: Default state - ready to send request */
              <>
                <span className="video-icon">📹</span>
                Request Video Call
                <span className="arrow-icon">→</span>
              </>
            )}
          </button>
        </div>

        {/* ===== RIGHT COLUMN: Hero Image ===== */}
        {/* Visual representation of telemedicine concept */}
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
