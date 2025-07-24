import React, { useEffect } from 'react';

const DoctorTelemedCall = () => {
  useEffect(() => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: 'SmartMedTelemedRoom123', // must be same!
      width: '100%',
      height: 600,
      parentNode: document.getElementById('jitsi-container'),
    };
    const api = new window.JitsiMeetExternalAPI(domain, options);
    return () => api.dispose();
  }, []);

  return (
    <div>
      <h2>Telemedicine Call</h2>
      <div id="jitsi-container" style={{ height: '600px', width: '100%' }}></div>
    </div>
  );
};

export default DoctorTelemedCall;
