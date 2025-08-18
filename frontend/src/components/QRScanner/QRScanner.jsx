import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { getMedicalRecordById } from '../../services/medicalRecordService';
import { addStudentToReceptionQueue } from '../../services/queueService';
import './QRScanner.css';

const QRScanner = ({ onScanResult, onClose }) => {
  const videoRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      if (videoRef.current) {
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => handleScanSuccess(result),
          {
            onDecodeError: (error) => {
              // Ignore decode errors - they happen constantly while scanning
            },
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await qrScanner.start();
        setScanner(qrScanner);
        setIsScanning(true);
        setError('');
      }
    } catch (err) {
      console.error('Scanner start error:', err);
      setError('Failed to start camera. Please check camera permissions.');
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (result) => {
    setLoading(true);
    stopScanner();

    try {
      // Parse the QR code data
      const qrData = JSON.parse(result.data);
      
      if (qrData.id && qrData.id.startsWith('MED-')) {
        // This is a medical record QR code
        const medicalData = await getMedicalRecordById(qrData.id);
        setScannedData(medicalData);
        
        // Add student to reception queue
        try {
          const queueEntry = addStudentToReceptionQueue(medicalData);
          alert(`Student ${medicalData.student.fullName} added to reception queue! Queue Number: ${queueEntry.queueNo}`);
        } catch (queueError) {
          console.error('Error adding to queue:', queueError);
          alert('Medical data loaded, but failed to add to queue. Please add manually.');
        }
        
        if (onScanResult) {
          onScanResult(medicalData);
        }
      } else {
        throw new Error('Invalid medical QR code format');
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      setError('Invalid QR code or failed to fetch medical data');
      // Restart scanner after error
      setTimeout(() => {
        setError('');
        startScanner();
      }, 2000);
    }
    setLoading(false);
  };

  const handleRetry = () => {
    setError('');
    setScannedData(null);
    startScanner();
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
                  <div className="scan-frame"></div>
                  <p className="scan-instruction">
                    Position the QR code within the frame
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
                <p>{error}</p>
                <button onClick={handleRetry} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}

            <div className="scanner-instructions">
              <h3>Instructions:</h3>
              <ul>
                <li>Position your camera towards the QR code</li>
                <li>Make sure the QR code is well-lit</li>
                <li>Keep the camera steady for best results</li>
              </ul>
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