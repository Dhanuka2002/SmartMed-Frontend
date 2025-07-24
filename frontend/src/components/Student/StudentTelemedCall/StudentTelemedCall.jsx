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
      roomName: 'SmartMedStudentDoctorRoom123', // unique room name
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: 700,
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
    <div>
      <div ref={jitsiContainerRef} style={{ height: '700px', width: '100%' }} />
      <button
        onClick={handleLeaveCall}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#ff4d4d',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Leave Call
      </button>
    </div>
  );
}

export default StudentTelemedCall;
