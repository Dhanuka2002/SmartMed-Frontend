import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentTelemedCall() {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Jitsi Meet API
    const domain = 'meet.jit.si';
    const options = {
      roomName: 'SmartMed-Telemed-Room', // standardized room name
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: 700,
      userInfo: {
        displayName: 'Student',
        email: 'student@smartmed.com'
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
    apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, []);

  const handleLeaveCall = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
      apiRef.current.dispose();
    }
    navigate('/student/dashboard'); // ✅ redirect anywhere
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Telemedicine Call with Doctor</h2>
      <div ref={jitsiContainerRef} style={{ height: '700px', width: '100%', border: '1px solid #ddd', borderRadius: '8px' }} />
      <button
        onClick={handleLeaveCall}
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
  );
}

export default StudentTelemedCall;
