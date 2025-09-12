import React, { useState, useEffect } from 'react';
import { 
  getReceptionQueue, 
  getDoctorQueue, 
  getPharmacyQueue, 
  getQueueStats 
} from '../../../services/queueService';
import './ReceptionistDashboard.css';

function ReceptionistDashboard() {
  // Real-time statistics state
  const [totalPatientsToday, setTotalPatientsToday] = useState(0);
  const [currentQueue, setCurrentQueue] = useState(0);
  const [emergencyCases, setEmergencyCases] = useState(0);
  
  // Additional detailed statistics
  const [queueStats, setQueueStats] = useState({
    reception: 0,
    doctor: 0,
    pharmacy: 0,
    completed: 0,
    total: 0
  });
  const [averageWaitTime, setAverageWaitTime] = useState('0 min');
  const [todayCompletedPatients, setTodayCompletedPatients] = useState(0);
  
  // Other state variables
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [emergencyLocation, setEmergencyLocation] = useState('');
  const [patientDetails, setPatientDetails] = useState('');
  const [emergencyType, setEmergencyType] = useState('critical');
  const [smsStatus, setSmsStatus] = useState('');

  // Load queue data on component mount and set up refresh interval
  useEffect(() => {
    loadAllQueueData();
    const interval = setInterval(loadAllQueueData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAllQueueData = async () => {
    try {
      // Load all queue data in parallel for better performance
      const [receptionQueue, doctorQueue, pharmacyQueue, overallStats] = await Promise.all([
        getReceptionQueue(),
        getDoctorQueue(),
        getPharmacyQueue(),
        getQueueStats()
      ]);
      
      // Calculate comprehensive statistics
      calculateComprehensiveStatistics(receptionQueue, doctorQueue, pharmacyQueue, overallStats);
    } catch (error) {
      console.error('Error loading queue data:', error);
      // Fallback to just reception queue if other calls fail
      try {
        const receptionQueue = await getReceptionQueue();
        calculateBasicStatistics(receptionQueue);
      } catch (fallbackError) {
        console.error('Error loading fallback data:', fallbackError);
      }
    }
  };

  const calculateComprehensiveStatistics = (receptionQueue, doctorQueue, pharmacyQueue, overallStats) => {
    const today = new Date().toDateString();
    
    // Combine all queue data for comprehensive analysis
    const allQueues = [...receptionQueue, ...doctorQueue, ...pharmacyQueue];
    
    // Calculate total patients today (from all queues)
    const todayPatients = allQueues.filter(patient => {
      const patientDate = new Date(
        patient.createdAt || 
        patient.addedTime || 
        patient.timestamp || 
        Date.now()
      ).toDateString();
      return patientDate === today;
    });
    setTotalPatientsToday(todayPatients.length);

    // Set current queue from reception queue (waiting to be seen)
    setCurrentQueue(receptionQueue.length);

    // Calculate emergency cases (from all active queues)
    const emergencyPatients = allQueues.filter(patient => 
      patient.priority === 'high' || 
      patient.priority === 'emergency' || 
      patient.status === 'emergency' ||
      patient.urgency === 'high' ||
      patient.emergencyCase === true
    );
    setEmergencyCases(emergencyPatients.length);
    
    // Set overall queue statistics
    setQueueStats(overallStats || {
      reception: receptionQueue.length,
      doctor: doctorQueue.length,
      pharmacy: pharmacyQueue.length,
      completed: 0,
      total: receptionQueue.length + doctorQueue.length + pharmacyQueue.length
    });
    
    // Calculate average wait time from reception queue
    if (receptionQueue.length > 0) {
      const totalWaitMinutes = receptionQueue.reduce((total, patient) => {
        const addedTime = new Date(patient.addedTime || patient.createdAt || Date.now());
        const waitMinutes = Math.floor((new Date() - addedTime) / (1000 * 60));
        return total + waitMinutes;
      }, 0);
      const avgWait = Math.floor(totalWaitMinutes / receptionQueue.length);
      setAverageWaitTime(avgWait > 0 ? `${avgWait} min` : '0 min');
    } else {
      setAverageWaitTime('0 min');
    }
    
    // Calculate today's completed patients (would need completed queue data)
    const todayCompleted = overallStats?.completed || 0;
    setTodayCompletedPatients(todayCompleted);
  };
  
  const calculateBasicStatistics = (receptionQueue) => {
    const today = new Date().toDateString();
    const todayPatients = receptionQueue.filter(patient => {
      const patientDate = new Date(patient.createdAt || patient.addedTime || Date.now()).toDateString();
      return patientDate === today;
    });
    setTotalPatientsToday(todayPatients.length);
    setCurrentQueue(receptionQueue.length);
    
    const emergencyPatients = receptionQueue.filter(patient => 
      patient.priority === 'high' || patient.priority === 'emergency' || patient.urgency === 'high'
    );
    setEmergencyCases(emergencyPatients.length);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllQueueData(); // Load real data from all sources
    setTimeout(() => {
      setIsRefreshing(false);
      console.log('All queue data refreshed with comprehensive real-time statistics');
    }, 1000);
  };

  const handleViewQueue = () => {
    window.location.href = '/receptionist/queue';
  };

  const handleNotifyNextPatients = () => {
    console.log('Notify next patients clicked');
  };

  const handleEmergencyAmbulance = () => {
    setIsEmergencyDialogOpen(true);
  };

  const sendRealSMS = async () => {
    // Vite environment variables (use import.meta.env instead of process.env)
    const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'ACdd5bfe1ffe7aabcd051f1bc4bb260df6';
    const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || 'e760b3b53e2047937ae16647421d1e3a';
    const fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '+17622631873';
    
    console.log('📱 Twilio Configuration:');
    console.log('Account SID:', accountSid);
    console.log('From Number:', fromNumber);
    console.log('Auth Token:', authToken ? 'Loaded ✅' : 'Missing ❌');
    
    const message = `🚨 EMERGENCY AMBULANCE REQUEST 🚨

Patient: ${patientDetails}
Location: ${emergencyLocation}
Type: ${emergencyType.toUpperCase()}
Time: ${new Date().toLocaleString()}

Please respond immediately if available.

SmartMed Hospital
Emergency Hotline: +94 764992146

Reply ACCEPT to confirm or call back immediately.`;

    try {
      // Using Twilio REST API directly from browser (for testing only)
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'From': fromNumber,
          'To': '+94770279136', // Your number in international format
          'Body': message
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ SMS sent successfully:', result.sid);
        return { success: true, messageId: result.sid };
      } else {
        const error = await response.json();
        console.error('❌ Twilio API error:', error);
        throw new Error(error.message || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      throw error;
    }
  };

  const sendSMSAlert = async () => {
    if (!emergencyLocation.trim() || !patientDetails.trim()) {
      setSmsStatus('Please fill in all required fields');
      return;
    }

    setIsSendingSMS(true);
    setSmsStatus('Sending real SMS via Twilio...');
    
    try {
      console.log('🚨 SENDING REAL SMS 🚨');
      console.log('To: +94770279136 (Your test number)');
      console.log('Location:', emergencyLocation);
      console.log('Patient:', patientDetails);
      console.log('Type:', emergencyType);
      
      // Send actual SMS
      const result = await sendRealSMS();
      
      setSmsStatus(`✅ Real SMS sent successfully! Message ID: ${result.messageId}`);
      console.log('✅ Real SMS sent to your phone!');
      
      setTimeout(() => {
        setIsEmergencyDialogOpen(false);
        setSmsStatus('');
        setEmergencyLocation('');
        setPatientDetails('');
        setEmergencyType('critical');
      }, 5000);
      
    } catch (error) {
      setSmsStatus(`❌ Failed to send real SMS: ${error.message}`);
      console.error('Real SMS error:', error);
    } finally {
      setIsSendingSMS(false);
    }
  };

  const closeEmergencyDialog = () => {
    setIsEmergencyDialogOpen(false);
    setSmsStatus('');
    setEmergencyLocation('');
    setPatientDetails('');
    setEmergencyType('critical');
  };

  return (
    <div className="receptionist-dashboard">
      <div className="dashboard-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon queue">
                👩‍⚕️
              </div>
              <div className="stat-info">
                <h3>Doctor Queue</h3>
                <p className="stat-number">{queueStats.doctor}</p>
                <p className="stat-subtitle">With doctors</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon queue">
                💊
              </div>
              <div className="stat-info">
                <h3>Pharmacy Queue</h3>
                <p className="stat-number">{queueStats.pharmacy}</p>
                <p className="stat-subtitle">Getting medication</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon queue">
                ✅
              </div>
              <div className="stat-info">
                <h3>Completed Today</h3>
                <p className="stat-number">{todayCompletedPatients}</p>
                <p className="stat-subtitle">Finished treatment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions-grid">
          {/* Quick Actions */}
          <div className="action-section">
            <h3>Quick Actions</h3>
            <div className="button-group">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`btn btn-primary ${isRefreshing ? 'loading' : ''}`}
              >
                🔄 {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>

              <button
                onClick={handleViewQueue}
                className="btn btn-success"
              >
                👁 View Queue
              </button>

              <button
                onClick={handleNotifyNextPatients}
                className="btn btn-indigo"
              >
                🔔 Notify Next Patients
              </button>
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="action-section">
            <h3>Emergency Actions</h3>
            <div className="button-group">
              <button
                onClick={handleEmergencyAmbulance}
                className="btn btn-danger"
                style={{ 
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📱 Emergency Ambulance Request (REAL SMS)
              </button>
              
              <div className="emergency-warning" style={{ 
                marginTop: '10px',
                padding: '15px',
                backgroundColor: '#fef3cd',
                border: '1px solid #fecaca',
                borderRadius: '8px'
              }}>
                <div className="warning-content">
                  <div className="warning-text">
                    <h4>⚠ Real SMS Alert System</h4>
                    <p>
                      This will send a REAL SMS to 0770279136. Make sure your Twilio account has credit!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Queue Overview */}
        <div className="queue-overview-section">
          <h3>Live Queue Status</h3>
          <div className="queue-flow">
            <div className="queue-stage">
              <div className="stage-header">
                <h4>📝 Reception</h4>
                <span className="count">{queueStats.reception}</span>
              </div>
              <p>Patients checking in</p>
              <p className="wait-time">Avg wait: {averageWaitTime}</p>
            </div>
            
            <div className="queue-arrow">→</div>
            
            <div className="queue-stage">
              <div className="stage-header">
                <h4>👩‍⚕️ Doctor</h4>
                <span className="count">{queueStats.doctor}</span>
              </div>
              <p>With medical staff</p>
            </div>
            
            <div className="queue-arrow">→</div>
            
            <div className="queue-stage">
              <div className="stage-header">
                <h4>💊 Pharmacy</h4>
                <span className="count">{queueStats.pharmacy}</span>
              </div>
              <p>Getting medication</p>
            </div>
            
            <div className="queue-arrow">→</div>
            
            <div className="queue-stage completed">
              <div className="stage-header">
                <h4>✅ Done</h4>
                <span className="count">{todayCompletedPatients}</span>
              </div>
              <p>Completed today</p>
            </div>
          </div>
        </div>
        
        {/* Alerts Section */}
        <div className="alerts-section">
          <h3>Today's Alerts & Notifications</h3>
          <div className="alerts-container">
            <div className="alert-item alert-warning" style={{
              padding: '15px',
              margin: '10px 0',
              backgroundColor: '#fef3cd',
              border: '1px solid #fecaca',
              borderRadius: '8px'
            }}>
              <div className="alert-content">
                <h4>⚠ Doctor Unavailable</h4>
                <p>
                  Dr. Mrs. Fernando will not be available from 12:00 PM - 1:00 PM today.
                </p>
                <p className="alert-time">
                  Please reschedule appointments accordingly.
                </p>
              </div>
            </div>

            <div className="alert-item alert-info" style={{
              padding: '15px',
              margin: '10px 0',
              backgroundColor: '#dbeafe',
              border: '1px solid #bfdbfe',
              borderRadius: '8px'
            }}>
              <div className="alert-content">
                <h4>ℹ System Update</h4>
                <p>
                  Patient management system will be updated tonight at 11:00 PM.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Ambulance Dialog */}
      {isEmergencyDialogOpen && (
        <div className="emergency-dialog-overlay">
          <div className="emergency-dialog">
            <div className="dialog-header">
              <h2>
                📱 Real SMS Emergency Alert
              </h2>
              <button 
                className="close-btn"
                onClick={closeEmergencyDialog}
                disabled={isSendingSMS}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div className="dialog-content">
              <div className="form-group">
                <label>
                  📍 Emergency Location *
                </label>
                <input
                  type="text"
                  value={emergencyLocation}
                  onChange={(e) => setEmergencyLocation(e.target.value)}
                  placeholder="Enter exact location (address, building, room)"
                  disabled={isSendingSMS}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  👤 Patient Details *
                </label>
                <textarea
                  value={patientDetails}
                  onChange={(e) => setPatientDetails(e.target.value)}
                  placeholder="Patient name, age, condition, special instructions"
                  rows="3"
                  disabled={isSendingSMS}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  ⚠ Emergency Type
                </label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  disabled={isSendingSMS}
                >
                  <option value="critical">Critical - Life Threatening</option>
                  <option value="urgent">Urgent - Needs Immediate Care</option>
                  <option value="emergency">Emergency - Serious Condition</option>
                </select>
              </div>
              
              <div className="driver-status">
                <h4>Target Phone Number:</h4>
                <div className="drivers-list">
                  <div className="driver-item">
                    <span>📱 Your Phone: +94770279136</span>
                    <span className="status available">Ready for Real SMS</span>
                  </div>
                </div>
              </div>
              
              {smsStatus && (
                <div className={`sms-status ${smsStatus.includes('successfully') ? 'success' : smsStatus.includes('Failed') ? 'error' : 'info'}`}>
                  {smsStatus}
                </div>
              )}
            </div>
            
            <div className="dialog-actions">
              <button 
                className="btn btn-secondary"
                onClick={closeEmergencyDialog}
                disabled={isSendingSMS}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={sendSMSAlert}
                disabled={isSendingSMS || !emergencyLocation.trim() || !patientDetails.trim()}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  marginLeft: '10px'
                }}
              >
                {isSendingSMS ? (
                  <>
                    📱 Sending Real SMS...
                  </>
                ) : (
                  <>
                    📱 Send REAL SMS Alert
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionistDashboard;