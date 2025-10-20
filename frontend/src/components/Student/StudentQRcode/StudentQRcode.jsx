import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import QRScanner from '../../QRScanner/QRScanner';
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';
import { processCompleteMedicalRecordByEmail, checkFormsCompletion } from '../../../services/medicalRecordService';
import './StudentQRcode.css';

function StudentQRCode() {
  const [copied, setCopied] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [medicalRecordId, setMedicalRecordId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [formsStatus, setFormsStatus] = useState({ hasStudentData: false, hasHospitalData: false, bothComplete: false });
  const [allergiesData, setAllergiesData] = useState(null);
  const [loadingAllergies, setLoadingAllergies] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loadingProfileImage, setLoadingProfileImage] = useState(false);
  const { alertState, showSuccess, showInfo, hideAlert } = useAlert();

  useEffect(() => {
    const loadUserDataAndQR = async () => {
      // Load current user data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (currentUser.email) {
        setStudentName(currentUser.name || "Student");
        setStudentEmail(currentUser.email);
        setInputEmail(currentUser.email);
        
        // Check for existing QR code for this specific user
        const userQRData = localStorage.getItem(`qrCodeData_${currentUser.email}`);
        const userRecordId = localStorage.getItem(`medicalRecordId_${currentUser.email}`);
        
        if (userQRData && userRecordId) {
          setQrCodeData(userQRData);
          setMedicalRecordId(userRecordId);
        }
        
        // Check forms completion status
        const status = checkFormsCompletion(currentUser.email);
        setFormsStatus(status);
        
        // If forms are complete but no QR code exists, auto-generate it
        if (status.bothComplete && !userQRData) {
          console.log('Forms are complete but QR code missing, auto-generating...');
          try {
            const result = await processCompleteMedicalRecordByEmail(currentUser.email);
            if (result.success) {
              setQrCodeData(result.qrCode);
              setMedicalRecordId(result.recordId);
              console.log('QR code auto-generated successfully');
            }
          } catch (error) {
            console.error('Error auto-generating QR code:', error);
          }
        }
      } else {
        // Fallback to old system
        setStudentName(localStorage.getItem("studentName") || "Student");
        const email = localStorage.getItem("studentEmail") || "No Email";
        setStudentEmail(email);
        setInputEmail(email !== "No Email" ? email : "");
        setQrCodeData(localStorage.getItem("qrCodeData") || "");
        setMedicalRecordId(localStorage.getItem("medicalRecordId") || "");
        
        // Check forms completion status for fallback email
        if (email !== "No Email") {
          const status = checkFormsCompletion(email);
          setFormsStatus(status);
        }
      }

      // Fetch profile image
      if (currentUser) {
        fetchProfileImageFromBackend(currentUser);
      }
    };

    loadUserDataAndQR();

    // Listen for QR code generation events
    const handleQRGenerated = (event) => {
      const { email, recordId } = event.detail;
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (email === currentUser.email || email === studentEmail) {
        // Reload QR code data
        const qrData = localStorage.getItem(`qrCodeData_${email}`);
        const recordIdData = localStorage.getItem(`medicalRecordId_${email}`);
        if (qrData && recordIdData) {
          setQrCodeData(qrData);
          setMedicalRecordId(recordIdData);
          
          // Update forms status
          const status = checkFormsCompletion(email);
          setFormsStatus(status);
        }
      }
    };

    window.addEventListener('qrCodeGenerated', handleQRGenerated);
    
    return () => {
      window.removeEventListener('qrCodeGenerated', handleQRGenerated);
    };
  }, []);

  // Fetch profile image from backend
  const fetchProfileImageFromBackend = async (user) => {
    setLoadingProfileImage(true);
    try {
      // Clear any cached profile image first
      setProfileImage(null);

      // Strategy 1: Try to find by login email
      let response = await fetch(`http://localhost:8081/api/student-details/profile-image/email/${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.profileImage) {
          setProfileImage(result.profileImage);
          return;
        }
      }

      // Strategy 2: Try to find by name matching
      const nameResponse = await fetch(`http://localhost:8081/api/student-details/search/${encodeURIComponent(user.name)}`);
      if (nameResponse.ok) {
        const nameResult = await nameResponse.json();
        if (nameResult && nameResult.length > 0) {
          // Find student with profile image
          const studentWithImage = nameResult.find(student => student.profileImage);
          if (studentWithImage && studentWithImage.profileImage) {
            setProfileImage(studentWithImage.profileImage);
            return;
          }
        }
      }

    } catch (error) {
      console.error('Error fetching profile image:', error);
    } finally {
      setLoadingProfileImage(false);
    }
  };

  // Fetch allergies data from hospital form data
  const fetchAllergiesData = async (email) => {
    setLoadingAllergies(true);
    try {
      // Try to get hospital data from localStorage
      const hospitalData = JSON.parse(localStorage.getItem(`hospitalData_${email}`) || '{}');
      
      if (hospitalData.hasAllergies) {
        const allergiesInfo = {
          hasAllergies: hospitalData.hasAllergies,
          allergies: hospitalData.allergies || {},
          allergyDetails: hospitalData.allergyDetails || ''
        };
        setAllergiesData(allergiesInfo);
      } else {
        // Fallback to general hospital form data
        const generalHospitalData = JSON.parse(localStorage.getItem('hospitalFormData') || '{}');
        if (generalHospitalData.hasAllergies && generalHospitalData.studentEmail === email) {
          const allergiesInfo = {
            hasAllergies: generalHospitalData.hasAllergies,
            allergies: generalHospitalData.allergies || {},
            allergyDetails: generalHospitalData.allergyDetails || ''
          };
          setAllergiesData(allergiesInfo);
        } else {
          setAllergiesData({ hasAllergies: 'no', allergies: {}, allergyDetails: '' });
        }
      }
    } catch (error) {
      console.error('Error fetching allergies data:', error);
      setAllergiesData({ hasAllergies: 'unknown', allergies: {}, allergyDetails: '' });
    } finally {
      setLoadingAllergies(false);
    }
  };

  // Load allergies data when email changes
  useEffect(() => {
    if (studentEmail && studentEmail !== 'No Email') {
      fetchAllergiesData(studentEmail);
    }
  }, [studentEmail]);

  // Generate QR code from medical data using email
  const generateMedicalQR = async () => {
    setIsGenerating(true);
    setError("");
    
    try {
      const emailToUse = inputEmail || studentEmail;
      if (!emailToUse || emailToUse === 'No Email') {
        throw new Error('Please provide a valid email address.');
      }
      
      const result = await processCompleteMedicalRecordByEmail(emailToUse);
      
      if (result.success) {
        setQrCodeData(result.qrCode);
        setMedicalRecordId(result.recordId);
        setStudentName(result.studentName);
        setStudentEmail(result.studentEmail);
        showSuccess('Medical QR code generated successfully!', 'QR Code Generated');
      } else {
        throw new Error(result.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const qrValue = medicalRecordId ? JSON.stringify({
    id: medicalRecordId,
    name: studentName,
    timestamp: new Date().toISOString(),
    dataUrl: `${window.location.origin}/api/medical-records/${medicalRecordId}`
  }) : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!qrCodeData) return;
    
    const link = document.createElement('a');
    link.download = `${studentName}-medical-qr-code.png`;
    link.href = qrCodeData;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share && qrCodeData) {
      try {
        await navigator.share({
          title: `${studentName}'s Medical QR Code`,
          text: 'SmartMed Medical QR Code',
          url: qrCodeData,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };
  
  const handleScanResult = (medicalData) => {
    console.log('Scanned medical data:', medicalData);
    // You can handle the scanned data here (e.g., display in a modal)
    showInfo(`Scanned medical record for: ${medicalData.student.fullName}`, 'Medical Record Scanned');
    setShowScanner(false);
  };

  return (
    <div className="qr-main-container">
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
      <div className="qr-card-wrapper">
        {/* Header */}
        <div className="qr-header">
          <div className="qr-avatar">
            {loadingProfileImage ? (
              <div className="avatar-loading">
                <span>...</span>
              </div>
            ) : profileImage ? (
              <img
                src={profileImage}
                alt={studentName}
                className="profile-image"
              />
            ) : (
              <svg className="user-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.66 13.66 9 12 9S9 7.66 9 6V4L3 7V9H21ZM12 11C14.21 11 16 12.79 16 15V16L15 17V22H9V17L8 16V15C8 12.79 9.79 11 12 11Z"/>
              </svg>
            )}
          </div>
          <h1 className="qr-greeting">Hello, {studentName}!</h1>
          <p className="qr-student-id">Email: {studentEmail}</p>
        </div>

        {/* QR Code Section */}
        <div className="qr-content">
          <div className="qr-layout-container">
            {/* Left Side - Details */}
            <div className="qr-details-section">
              <div className="qr-section-header">
                <svg className="qr-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,5H21V9H19V5M5,5H9V9H5V5M3,19H5V21H3V19M5,19H9V21H5V19M19,19H21V21H19V19M15,19H17V21H15V19M17,15H19V17H17V15M15,13H17V15H15V13M15,5H17V7H15V5M13,19H15V21H13V19M15,7H17V9H15V7M7,19H9V21H7V19M13,7H15V9H13V7M13,3H15V5H13V3M3,9H5V11H3V9M7,3H9V5H7V3M21,11H23V13H21V11M21,9H23V11H21V9M21,13H23V15H21V13M3,7H5V9H3V7M21,3H23V5H21V3M21,5H23V7H21V5M19,3H21V5H19V3M17,3H19V5H17V3M3,3H5V5H3V3M3,5H5V7H3V5M5,3H7V5H5V3M9,3H11V5H9V3M11,3H13V5H11V3"/>
                </svg>
                <span className="qr-section-title">
                  {qrCodeData ? "Your Medical QR Code" : "No Medical QR Code Available"}
                </span>
              </div>

              <p className="qr-description">
                {qrCodeData
                  ? "Scan this code to access your complete medical record."
                  : "Complete your medical forms to generate your QR code."}
              </p>

              {/* Show form completion status */}
              {studentEmail && (
                <div className={`form-status ${formsStatus.bothComplete ? 'complete' : 'incomplete'}`}>
                  <h4>
                    Form Completion Status:
                    {formsStatus.bothComplete ? (
                      <span className="status-complete">✅ Complete</span>
                    ) : (
                      <span className="status-incomplete">⏳ Incomplete</span>
                    )}
                  </h4>
                  <div className="form-status-items">
                    <div className="form-status-item">
                      <span className="form-status-text">
                        Student Details Form
                      </span>
                      <span className={`status-mark ${formsStatus.hasStudentData ? 'complete' : 'incomplete'}`}>
                        {formsStatus.hasStudentData ? (
                          <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        ) : (
                          <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        )}
                      </span>
                    </div>
                    <div className="form-status-item">
                      <span className="form-status-text">
                        Hospital Examination Form
                      </span>
                      <span className={`status-mark ${formsStatus.hasHospitalData ? 'complete' : 'incomplete'}`}>
                        {formsStatus.hasHospitalData ? (
                          <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        ) : (
                          <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        )}
                      </span>
                    </div>
                    {formsStatus.bothComplete && !qrCodeData && (
                      <div className="auto-generate-notice">
                        🔄 Both forms are complete! QR code should generate automatically. If not visible, try clicking "Generate Medical QR Code" below.
                      </div>
                    )}
                    {!formsStatus.bothComplete && (
                      <div className="incomplete-notice">
                        📝 Complete both forms to generate your QR code automatically.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email Input Section */}
              {!qrCodeData && (
                <div className="email-input-section">
                  <label className="email-input-label">
                    Student Email Address:
                  </label>
                  <div className="email-input-container">
                    <input
                      type="email"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="email-input"
                    />
                    <button
                      onClick={() => setInputEmail(studentEmail !== 'No Email' ? studentEmail : '')}
                      className="use-saved-btn"
                    >
                      Use Saved
                    </button>
                  </div>
                  <small className="email-input-help">
                    This email should match the email used in both Student Details and Hospital Examination forms.
                  </small>
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {qrCodeData && (
                <div className="qr-actions">
                  <div className="qr-btn-group">
                    <button onClick={handleDownload} className="qr-btn qr-btn-secondary">
                      Download QR
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - QR Code Display */}
            <div className="qr-display-section">
              <div className="qr-display-area">
                <div className="qr-image-container">
                  {qrCodeData ? (
                    <div className="qr-code-wrapper">
                      <QRCode
                        value={qrValue}
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 200 200`}
                      />
                      <div className="qr-code-info">
                        <p className="qr-code-id-label">Medical Record ID:</p>
                        <p className="qr-code-id-value">{medicalRecordId}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="qr-missing-container">
                      <div className="qr-missing-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="#ccc">
                          <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,5H21V9H19V5M5,5H9V9H5V5M3,19H5V21H3V19M5,19H9V21H5V19M19,19H21V21H19V19M15,19H17V21H15V19M17,15H19V17H17V15M15,13H17V15H15V13M15,5H17V7H15V5M13,19H15V21H13V19M15,7H17V9H15V7M7,19H9V21H7V19M13,7H15V9H13V7M13,3H15V5H13V3M3,9H5V11H3V9M7,3H9V5H7V3M21,11H23V13H21V11M21,9H23V11H21V9M21,13H23V15H21V13M3,7H5V9H3V7M21,3H23V5H21V3M21,5H23V7H21V5M19,3H21V5H19V3M17,3H19V5H17V3M3,3H5V5H3V3M3,5H5V7H3V5M5,3H7V5H5V3M9,3H11V5H9V3M11,3H13V5H11V3"/>
                        </svg>
                      </div>
                      <p className="qr-missing-text">Medical QR code not generated yet</p>
                      <p className="qr-missing-description">
                        Make sure both Student Details and Hospital Examination forms are completed with the same email address.
                      </p>
                      <button
                        onClick={generateMedicalQR}
                        disabled={isGenerating || !inputEmail}
                        className={`generate-qr-btn ${(!inputEmail || isGenerating) ? 'disabled' : 'enabled'}`}
                      >
                        {isGenerating ? (
                          <>
                            <span>⏳</span>
                            Generating...
                          </>
                        ) : (
                          <>
                            <span>🔗</span>
                            Generate Medical QR Code
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="qr-footer">
          <p className="qr-footer-text">
            Keep this QR code safe — it contains your complete medical record!
          </p>
        </div>
      </div>
      
      {showScanner && (
        <QRScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

export default StudentQRCode;
