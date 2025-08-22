import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { getMedicalRecordById } from '../../services/medicalRecordService';
import { addStudentToReceptionQueue } from '../../services/queueService';
import './QRScanner.css';

const QRScanner = ({ onScanResult, onClose }) => {
  const videoRef = useRef(null);
  const processingRef = useRef(false); // Ref to track processing state across re-renders
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [scanCooldown, setScanCooldown] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    startScanner();
    return () => {
      // Cleanup on unmount
      processingRef.current = false;
      if (scanner) {
        try {
          scanner.stop();
          scanner.destroy();
        } catch (error) {
          console.warn('⚠️ Error during component cleanup:', error);
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startScanner = async () => {
    try {
      console.log('🔄 Starting QR scanner...');
      setError('');
      setIsScanning(false);
      
      // Clean up any existing scanner first
      if (scanner) {
        console.log('🧹 Cleaning up existing scanner...');
        try {
          scanner.stop();
          scanner.destroy();
        } catch (cleanupError) {
          console.warn('⚠️ Error during scanner cleanup:', cleanupError);
        }
        setScanner(null);
      }
      
      // Check basic requirements
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // Add a small delay to ensure previous resources are released
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('🔍 Creating QR scanner instance...');
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('🎯 QR code detected:', result.data);
          handleScanSuccess(result);
        },
        {
          onDecodeError: (error) => {
            // Only log decode errors occasionally to avoid spam
            if (Math.random() < 0.01) { // 1% chance to log
              console.log('🔍 Scanning for QR code...');
            }
          },
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 3, // Reduced to prevent resource conflicts
          // Fallback camera constraints for better compatibility
          videoElement: videoRef.current,
        }
      );

      console.log('▶️ Starting QR scanner...');
      
      // Try with environment camera first, then fallback to any available camera
      try {
        await qrScanner.start();
      } catch (primaryError) {
        console.warn('⚠️ Environment camera failed, trying any available camera...', primaryError);
        
        // Try to start with any available camera
        const qrScannerFallback = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('🎯 QR code detected (fallback):', result.data);
            handleScanSuccess(result);
          },
          {
            onDecodeError: (error) => {
              if (Math.random() < 0.01) {
                console.log('🔍 Scanning for QR code (fallback)...');
              }
            },
            preferredCamera: 'user', // Try front camera as fallback
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 3,
            videoElement: videoRef.current,
          }
        );
        
        await qrScannerFallback.start();
        // Clean up the primary scanner that failed
        if (qrScanner) {
          try {
            qrScanner.destroy();
          } catch (cleanupError) {
            console.warn('⚠️ Error cleaning up failed primary scanner:', cleanupError);
          }
        }
        setScanner(qrScannerFallback);
        setIsScanning(true);
        console.log('✅ QR Scanner started successfully with fallback camera!');
        return;
      }
      
      setScanner(qrScanner);
      setIsScanning(true);
      console.log('✅ QR Scanner started successfully!');
      
    } catch (err) {
      console.error('❌ Scanner start error:', err);
      let errorMessage = 'Failed to start camera. ';
      
      // Enhanced error handling
      if (err.message && err.message.includes('videosource')) {
        errorMessage += 'Camera is busy or being used by another application. Please close other apps using your camera and try again.';
      } else {
        switch (err.name) {
          case 'NotAllowedError':
            errorMessage += 'Camera permission denied. Please click "Allow" when prompted and refresh the page.';
            break;
          case 'NotFoundError':
            errorMessage += 'No camera found on this device.';
            break;
          case 'NotSupportedError':
            errorMessage += 'Camera not supported on this device.';
            break;
          case 'NotReadableError':
            errorMessage += 'Camera is being used by another application.';
            break;
          case 'OverconstrainedError':
            errorMessage += 'Camera constraints cannot be satisfied. Try a different camera.';
            break;
          case 'AbortError':
            errorMessage += 'Camera access was interrupted. Please try again.';
            break;
          default:
            errorMessage += err.message || 'Unknown camera error occurred.';
        }
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scanner) {
      try {
        console.log('🛑 Stopping QR scanner...');
        scanner.stop();
        scanner.destroy();
        console.log('✅ QR scanner stopped and destroyed');
      } catch (error) {
        console.warn('⚠️ Error stopping scanner:', error);
      }
      setScanner(null);
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (result) => {
    console.log('🎯 QR Scan Success! Raw data:', result.data);
    
    // Prevent rapid duplicate scans with multiple checks including ref
    if (scanCooldown || loading || isProcessing || processingRef.current) {
      console.log('⏳ Scan already in progress, ignoring duplicate scan', {
        scanCooldown,
        loading,
        isProcessing,
        processingRef: processingRef.current
      });
      return;
    }
    
    // Check if this is the same data as the last scan
    if (lastScannedData === result.data) {
      console.log('🔄 Same QR data as last scan, ignoring duplicate');
      return;
    }
    
    // Immediately set all processing flags to prevent race conditions
    processingRef.current = true; // Set ref immediately for instant protection
    setScanCooldown(true);
    setIsProcessing(true);
    setLastScannedData(result.data);
    setLoading(true);
    
    // Stop scanner immediately to prevent additional scans
    stopScanner();
    
    console.log('🔒 Scan processing started - all protections active');

    try {
      let qrData;
      let queueProcessed = false; // Flag to prevent duplicate processing
      
      // Try to parse as JSON first
      try {
        qrData = JSON.parse(result.data);
        console.log('📊 Parsed QR data:', qrData);
      } catch (parseError) {
        console.log('📝 QR data is not JSON, treating as plain text:', result.data);
        // For non-JSON QR codes, create a basic structure
        qrData = { 
          data: result.data,
          scannedAt: new Date().toISOString()
        };
      }
      
      // Check if it's a medical QR code (but not a test QR code)
      if (qrData.id && qrData.id.startsWith('MED-') && !qrData.id.startsWith('MED-TEST-') && !queueProcessed) {
        console.log('🏥 Processing medical QR code:', qrData.id);
        
        try {
          const medicalData = await getMedicalRecordById(qrData.id);
          console.log('📋 Retrieved medical data:', medicalData);
          
          if (medicalData && medicalData.student) {
            setScannedData(medicalData);
            
            // Add student to reception queue
            try {
              console.log('🔄 Adding student to reception queue...');
              const queueEntry = await addStudentToReceptionQueue(medicalData);
              console.log('✅ Queue operation result:', queueEntry);
              queueProcessed = true; // Mark as processed
              
              if (queueEntry.isDuplicate) {
                alert(`⚠️ DUPLICATE DETECTED\n\n${queueEntry.message}\n\nThe student is already in the reception queue and does not need to be added again.`);
                console.log('🔄 Duplicate detected, not adding to queue');
              } else {
                alert(`✅ SUCCESS!\n\nStudent: ${medicalData.student.fullName}\nQueue Number: ${queueEntry.queueNo}\nStatus: Added to reception queue\n\n${queueEntry.message || 'Student is now waiting in reception queue.'}`);
                console.log('✅ Student successfully added to reception queue');
              }
            } catch (queueError) {
              console.error('❌ Error adding to queue:', queueError);
              alert('❌ ERROR\n\nMedical data was loaded successfully, but failed to add student to reception queue.\n\nPlease add the student manually or try scanning again.');
              queueProcessed = true; // Mark as processed even on error
            }
            
            if (onScanResult) {
              onScanResult(medicalData);
            }
          } else {
            throw new Error('Medical record not found or invalid format');
          }
        } catch (recordError) {
          console.error('❌ Error retrieving medical record:', recordError);
          throw new Error(`Medical record not found: ${qrData.id}`);
        }
      } else {
        // Handle non-medical QR codes
        console.log('ℹ️ Non-medical QR code detected');
        
        // For demonstration, let's create a mock medical record for testing
        if (qrData.data && (qrData.data.includes('test') || qrData.data.includes('demo')) && !queueProcessed) {
          console.log('🧪 Test/Demo QR code detected, creating mock data');
          const mockMedicalData = {
            id: 'TEST-DEMO-' + Date.now(), // Changed prefix to avoid conflict
            timestamp: new Date().toISOString(),
            student: {
              fullName: 'Test Student (QR Demo)',
              email: 'test@student.edu',
              studentRegistrationNumber: 'MED/2024/TEST',
              nic: '199501012345V',
              telephoneNumber: '0771234567',
              emergencyContact: {
                name: 'Test Emergency Contact',
                telephone: '0777654321',
                relationship: 'parent'
              }
            },
            examination: {
              physicalMeasurements: {
                weight: '70',
                height: '175'
              },
              vaccinationStatus: 'yes',
              examination: {
                circulation: {
                  bloodPressure: '120/80'
                },
                clinicalTests: {
                  bloodGroup: 'O+'
                }
              },
              assessment: {
                fitForStudies: 'fit',
                specialistReferral: 'no'
              }
            }
          };
          
          setScannedData(mockMedicalData);
          
          // Add test student to reception queue (same logic as medical QR codes)
          try {
            console.log('🔄 Adding test student to reception queue...');
            const queueEntry = await addStudentToReceptionQueue(mockMedicalData);
            console.log('✅ Test queue operation result:', queueEntry);
            queueProcessed = true; // Mark as processed
            
            if (queueEntry.isDuplicate) {
              alert(`⚠️ DUPLICATE DETECTED\n\n${queueEntry.message}\n\nThe test student is already in the reception queue.`);
              console.log('🔄 Test duplicate detected, not adding to queue');
            } else {
              alert(`✅ TEST SUCCESS!\n\nStudent: ${mockMedicalData.student.fullName}\nQueue Number: ${queueEntry.queueNo}\nStatus: Added to reception queue\n\nThis was a test QR code scan.`);
              console.log('✅ Test student successfully added to reception queue');
            }
          } catch (queueError) {
            console.error('❌ Error adding test student to queue:', queueError);
            alert('❌ TEST ERROR\n\nTest medical data was created, but failed to add to reception queue.\n\nPlease try scanning again.');
            queueProcessed = true; // Mark as processed even on error
          }
          
          if (onScanResult) {
            onScanResult(mockMedicalData);
          }
        } else {
          throw new Error('This QR code does not contain medical record data. Please scan a valid medical QR code.');
        }
      }
    } catch (error) {
      console.error('❌ Error processing QR code:', error);
      setError(`QR Code Error: ${error.message}`);
      
      // Show more helpful error message
      setTimeout(() => {
        setError('');
        console.log('🔄 Restarting scanner after error...');
        startScanner();
      }, 3000);
    }
    
    // Reset all processing flags after cooldown period
    setTimeout(() => {
      processingRef.current = false;
      setScanCooldown(false);
      setIsProcessing(false);
      setLastScannedData(null);
      console.log('🔓 All processing flags reset - ready for next scan');
    }, 5000); // 5 seconds cooldown to prevent rapid duplicate scans
    
    setLoading(false);
    console.log('✅ Scan processing completed - loading disabled');
    console.log('📊 Queue processing summary: queueProcessed =', queueProcessed || false);
  };

  const handleRetry = async () => {
    setError('');
    setScannedData(null);
    setLastScannedData(null);
    processingRef.current = false;
    setScanCooldown(false);
    setIsProcessing(false);
    setLoading(false);
    console.log('🔄 Retrying scanner - all flags reset');
    
    // Ensure complete cleanup before retry
    stopScanner();
    
    // Wait a bit longer before retrying to ensure resources are released
    await new Promise(resolve => setTimeout(resolve, 500));
    
    startScanner();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      console.log('📝 Processing manual input:', manualInput);
      handleScanSuccess({ data: manualInput.trim() });
      setManualInput('');
      setShowManualInput(false);
    }
  };

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <h2>Scan Medical QR Code</h2>
          <button className="qr-scanner-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {!scannedData && (
          <div className="qr-scanner-content">
            <div className="video-container">
              <video ref={videoRef} className="qr-video" playsInline />
              {isScanning && (
                <div className="scan-overlay">
                  <div className="scan-frame">
                    <div className="scan-line"></div>
                  </div>
                  <p className="scan-instruction">
                    📱 Position the QR code within the green frame<br/>
                    💡 Ensure good lighting for best results
                  </p>
                </div>
              )}
            </div>

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Processing QR code...</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <h4>⚠️ Camera Access Required</h4>
                <p>{error}</p>
                <div style={{ marginTop: '1rem' }}>
                  <h5>How to fix camera issues:</h5>
                  <ol style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                    <li>Click the camera icon in your browser's address bar</li>
                    <li>Select "Allow" for camera access</li>
                    <li>Refresh the page if needed</li>
                    <li>Make sure no other apps are using your camera</li>
                  </ol>
                </div>
                <div className="error-actions">
                  <button onClick={handleRetry} className="retry-btn">
                    🔄 Try Again
                  </button>
                  <button 
                    onClick={() => setShowManualInput(!showManualInput)} 
                    className="manual-input-btn"
                    style={{ 
                      marginLeft: '0.5rem',
                      background: '#6c757d', 
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ⌨️ Manual Input
                  </button>
                </div>
                
                {showManualInput && (
                  <div className="manual-input-section" style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: '#f8f9fa'
                  }}>
                    <h5>Manual QR Code Input</h5>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                      If camera scanning isn't working, you can manually enter the QR code data:
                    </p>
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Enter QR code data or medical record ID..."
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        marginBottom: '0.5rem'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualSubmit();
                        }
                      }}
                    />
                    <div>
                      <button 
                        onClick={handleManualSubmit}
                        disabled={!manualInput.trim()}
                        style={{
                          background: manualInput.trim() ? '#28a745' : '#ccc',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: manualInput.trim() ? 'pointer' : 'not-allowed',
                          marginRight: '0.5rem'
                        }}
                      >
                        ✅ Process
                      </button>
                      <button 
                        onClick={() => {
                          setShowManualInput(false);
                          setManualInput('');
                        }}
                        style={{
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="scanner-instructions">
              <h3>📋 Scanning Instructions:</h3>
              <ul>
                <li>🎯 Position your camera towards the student's medical QR code</li>
                <li>💡 Make sure the QR code is well-lit and clearly visible</li>
                <li>📱 Hold your device steady for best scanning results</li>
                <li>📏 Keep a distance of 6-12 inches from the QR code</li>
                <li>⏱️ Scanning will happen automatically when code is detected</li>
              </ul>
              {!isScanning && !error && (
                <div style={{ 
                  background: '#fff3cd', 
                  border: '1px solid #ffeaa7', 
                  padding: '1rem', 
                  borderRadius: '6px', 
                  marginTop: '1rem' 
                }}>
                  <strong>⚡ Ready to scan!</strong> Click "Try Again" above if camera doesn't start automatically.
                </div>
              )}
            </div>
          </div>
        )}

        {scannedData && (
          <MedicalDataDisplay data={scannedData} onClose={onClose} onScanAnother={handleRetry} />
        )}
      </div>
    </div>
  );
};

// Component to display scanned medical data
const MedicalDataDisplay = ({ data, onClose, onScanAnother }) => {
  if (!data) return null;

  const { student, examination } = data;

  return (
    <div className="medical-data-display">
      <div className="medical-data-header">
        <h2>Medical Record</h2>
        <div className="data-actions">
          <button onClick={onScanAnother} className="scan-another-btn">
            Scan Another
          </button>
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>
      </div>

      <div className="medical-data-content">
        {/* Student Information */}
        <div className="data-section">
          <h3>Student Information</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Full Name:</label>
              <span>{student.fullName}</span>
            </div>
            <div className="data-item">
              <label>NIC:</label>
              <span>{student.nic}</span>
            </div>
            <div className="data-item">
              <label>Registration Number:</label>
              <span>{student.studentRegistrationNumber}</span>
            </div>
            <div className="data-item">
              <label>Academic Division:</label>
              <span>{student.academicDivision}</span>
            </div>
            <div className="data-item">
              <label>Date of Birth:</label>
              <span>{student.dateOfBirth}</span>
            </div>
            <div className="data-item">
              <label>Age:</label>
              <span>{student.age}</span>
            </div>
            <div className="data-item">
              <label>Gender:</label>
              <span>{student.gender}</span>
            </div>
            <div className="data-item">
              <label>Phone:</label>
              <span>{student.telephoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="data-section">
          <h3>Emergency Contact</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Name:</label>
              <span>{student.emergencyContact.name}</span>
            </div>
            <div className="data-item">
              <label>Phone:</label>
              <span>{student.emergencyContact.telephone}</span>
            </div>
            <div className="data-item">
              <label>Relationship:</label>
              <span>{student.emergencyContact.relationship}</span>
            </div>
          </div>
        </div>

        {/* Physical Measurements */}
        <div className="data-section">
          <h3>Physical Measurements</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Weight:</label>
              <span>{examination.physicalMeasurements.weight} kg</span>
            </div>
            <div className="data-item">
              <label>Height:</label>
              <span>{examination.physicalMeasurements.height} cm</span>
            </div>
            <div className="data-item">
              <label>Blood Pressure:</label>
              <span>{examination.examination.circulation.bloodPressure}</span>
            </div>
            <div className="data-item">
              <label>Blood Group:</label>
              <span>{examination.examination.clinicalTests.bloodGroup}</span>
            </div>
          </div>
        </div>

        {/* Medical Assessment */}
        <div className="data-section">
          <h3>Medical Assessment</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Vaccination Status:</label>
              <span className={`status ${examination.vaccinationStatus}`}>
                {examination.vaccinationStatus === 'yes' ? 'Vaccinated' : 'Not Vaccinated'}
              </span>
            </div>
            <div className="data-item">
              <label>Fit for Studies:</label>
              <span className={`status ${examination.assessment.fitForStudies}`}>
                {examination.assessment.fitForStudies === 'fit' ? 'Fit' : 'Not Fit'}
              </span>
            </div>
            <div className="data-item">
              <label>Specialist Referral:</label>
              <span className={`status ${examination.assessment.specialistReferral}`}>
                {examination.assessment.specialistReferral === 'yes' ? 'Required' : 'Not Required'}
              </span>
            </div>
          </div>
          {examination.assessment.reason && (
            <div className="data-item full-width">
              <label>Assessment Notes:</label>
              <p>{examination.assessment.reason}</p>
            </div>
          )}
        </div>

        {/* Record Information */}
        <div className="data-section">
          <h3>Record Information</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Record ID:</label>
              <span>{data.id}</span>
            </div>
            <div className="data-item">
              <label>Created:</label>
              <span>{new Date(data.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;