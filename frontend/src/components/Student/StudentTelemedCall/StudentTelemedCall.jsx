import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentTelemedCall() {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let retryTimer;

    const waitForJitsiAPI = () => {
      return new Promise((resolve) => {
        const checkAPI = () => {
          if (window.JitsiMeetExternalAPI) {
            resolve(true);
          } else {
            setTimeout(checkAPI, 100);
          }
        };
        checkAPI();
      });
    };

    const initializeJitsi = async () => {
      try {
        setError(null);
        
        // Wait for Jitsi API to be available
        await waitForJitsiAPI();

        if (!jitsiContainerRef.current) {
          throw new Error('Video container not ready. Please try again.');
        }

        // Clear any existing content
        jitsiContainerRef.current.innerHTML = '';

        const domain = 'meet.jit.si';
        // Use the same shared room name as doctor
        let roomName = localStorage.getItem('smartmed_room_name');
        if (!roomName) {
          roomName = `SmartMed-${Date.now()}`;
          localStorage.setItem('smartmed_room_name', roomName);
        }
        
        const options = {
          roomName,
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
            requireDisplayName: false,
            enableWelcomePage: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'hangup', 'chat',
              'raisehand', 'participants-pane', 'tileview'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false
          }
        };

        console.log('Initializing Jitsi with options:', options);
        console.log('Room name:', roomName);
        console.log('Jitsi API available:', !!window.JitsiMeetExternalAPI);
        
        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        
        // Add event listeners
        apiRef.current.addEventListener('readyToClose', () => {
          console.log('Jitsi ready to close');
          navigate('/student/dashboard');
        });

        apiRef.current.addEventListener('videoConferenceJoined', (event) => {
          console.log('Video conference joined:', event);
          setIsLoading(false);
        });

        apiRef.current.addEventListener('videoConferenceLeft', () => {
          console.log('Video conference left');
          navigate('/student/dashboard');
        });

        apiRef.current.addEventListener('participantJoined', (participant) => {
          console.log('Participant joined:', participant);
        });

        apiRef.current.addEventListener('participantLeft', (participant) => {
          console.log('Participant left:', participant);
        });

        // Timeout for loading
        setTimeout(() => {
          if (isLoading) {
            setIsLoading(false);
          }
        }, 10000);

      } catch (err) {
        console.error('Error initializing Jitsi:', err);
        setError(err.message);
        setIsLoading(false);
        
        // Retry logic
        if (retryCount < 3) {
          retryTimer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setIsLoading(true);
            initializeJitsi();
          }, 2000);
        }
      }
    };

    // Wait a bit for the component to mount
    const timer = setTimeout(() => {
      initializeJitsi();
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
          apiRef.current = null;
        } catch (err) {
          console.error('Error disposing Jitsi API:', err);
        }
      }
    };
  }, [navigate, retryCount]);

  const handleLeaveCall = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
      apiRef.current.dispose();
    }
    navigate('/student/dashboard'); // ✅ redirect anywhere
  };

  if (error && retryCount >= 3) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '20px' }}>Video Call Error</h2>
        <p style={{ color: '#666', marginBottom: '10px' }}>{error}</p>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          Failed after {retryCount} attempts. This might be due to:
        </p>
        <ul style={{ textAlign: 'left', color: '#666', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
          <li>Camera/microphone permissions not granted</li>
          <li>Network connectivity issues</li>
          <li>Browser security restrictions</li>
          <li>Firewall blocking video calls</li>
        </ul>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setRetryCount(0);
              setError(null);
              setIsLoading(true);
            }}
            style={{
              padding: '12px 24px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Reload Page
          </button>
          <button
            onClick={() => navigate('/student/dashboard')}
            style={{
              padding: '12px 24px',
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Telemedicine Call with Doctor</h2>
      
      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <p style={{ color: '#666' }}>
            Connecting to video call...
            {retryCount > 0 && ` (Attempt ${retryCount + 1}/4)`}
          </p>
          {retryCount > 0 && (
            <p style={{ color: '#ffc107', fontSize: '14px', marginTop: '10px' }}>
              Having trouble connecting. Retrying...
            </p>
          )}
        </div>
      )}
      
      <div 
        ref={jitsiContainerRef} 
        style={{ 
          height: '700px', 
          width: '100%', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          display: isLoading ? 'none' : 'block'
        }} 
      />
      
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
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}

export default StudentTelemedCall;
