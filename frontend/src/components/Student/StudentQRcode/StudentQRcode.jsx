/**
 * StudentQRCode Component
 * 
 * Displays and manages student medical QR codes for the SmartMed system.
 * This component provides functionality to generate, view, download, and share
 * medical QR codes that contain complete student medical records.
 * 
 * Features:
 * - Auto-generation of QR codes when both forms are complete
 * - Profile image display with fallback strategies
 * - Form completion status tracking
 * - QR code download functionality
 * - Real-time QR generation monitoring
 * - Event-driven QR code updates
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code'; // QR code rendering library
import QRScanner from '../../QRScanner/QRScanner'; // QR code scanner component
import AlertMessage from '../../Common/AlertMessage'; // Alert notification component
import useAlert from '../../../hooks/useAlert'; // Custom hook for alert management
import { processCompleteMedicalRecordByEmail, checkFormsCompletion } from '../../../services/medicalRecordService'; // Medical record service functions
import './StudentQRcode.css';

function StudentQRCode() {
  
  // STATE MANAGEMENT
  
  /** Flag indicating if QR code link was copied to clipboard */
  const [copied, setCopied] = useState(false);
  
  /** Student's full name retrieved from localStorage or backend */
  const [studentName, setStudentName] = useState("");
  
  /** Student's email address used as unique identifier */
  const [studentEmail, setStudentEmail] = useState("");
  
  /** Base64 encoded QR code image data */
  const [qrCodeData, setQrCodeData] = useState("");
  
  /** Unique medical record ID associated with the QR code */
  const [medicalRecordId, setMedicalRecordId] = useState("");
  
  /** Controls visibility of the QR scanner modal */
  const [showScanner, setShowScanner] = useState(false);
  
  /** Flag indicating QR code generation is in progress */
  const [isGenerating, setIsGenerating] = useState(false);
  
  /** Error message to display if QR generation fails */
  const [error, setError] = useState("");
  
  /** Controls visibility of manual email input section */
  const [showEmailInput, setShowEmailInput] = useState(false);
  
  /** User-entered email for manual QR generation */
  const [inputEmail, setInputEmail] = useState("");
  
  /** 
   * Form completion status object
   * @property {boolean} hasStudentData - Student details form completed
   * @property {boolean} hasHospitalData - Hospital examination form completed
   * @property {boolean} bothComplete - Both forms completed (enables QR generation)
   */
  const [formsStatus, setFormsStatus] = useState({ hasStudentData: false, hasHospitalData: false, bothComplete: false });
  
  /** Student's allergies information from hospital examination form */
  const [allergiesData, setAllergiesData] = useState(null);
  
  /** Loading state for allergies data fetch */
  const [loadingAllergies, setLoadingAllergies] = useState(false);
  
  /** Base64 encoded profile image from backend */
  const [profileImage, setProfileImage] = useState(null);
  
  /** Loading state for profile image fetch */
  const [loadingProfileImage, setLoadingProfileImage] = useState(false);
  
  /** Alert hook for displaying success/info messages */
  const { alertState, showSuccess, showInfo, hideAlert } = useAlert();


  // INITIALIZATION & DATA LOADING

  /**
   * Main initialization effect
   * Executes on component mount to:
   * 1. Load current user data from localStorage
   * 2. Check for existing QR code
   * 3. Verify form completion status
   * 4. Auto-generate QR if forms complete but QR missing
   * 5. Set up event listener for QR generation events
   * 6. Fetch profile image from backend
   */
  useEffect(() => {
    /**
     * Async function to load user data and QR code information
     * Handles both new user-specific storage and legacy fallback
     */
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

    // Execute initial data load
    loadUserDataAndQR();

    /**
     * Event handler for 'qrCodeGenerated' custom events
     * Listens for QR code generation completion from other components
     * Updates local state when QR is generated for current user
     * 
     * @param {CustomEvent} event - Custom event with detail: {email, recordId}
     */
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

    // Register event listener for QR generation notifications
    window.addEventListener('qrCodeGenerated', handleQRGenerated);
    
    /**
     * Cleanup function to remove event listener
     * Prevents memory leaks when component unmounts
     */
    return () => {
      window.removeEventListener('qrCodeGenerated', handleQRGenerated);
    };
  }, []); // Empty dependency array - runs once on mount

  // ============================================================================
  // DATA FETCHING FUNCTIONS
  // ============================================================================
  
  /**
   * Fetches student profile image from backend using two-strategy approach
   * 
   * Strategy 1: Search by login email (primary method)
   * Strategy 2: Search by name matching (fallback method)
   * 
   * This dual approach ensures profile images can be found even if
   * email addresses differ between registration and form submission.
   * 
   * @param {Object} user - User object containing email and name
   * @param {string} user.email - User's email address
   * @param {string} user.name - User's full name
   */
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

  /**
   * Fetches student allergies information from hospital examination form data
   * Attempts to retrieve from user-specific localStorage first,
   * then falls back to general hospital form data
   * 
   * @param {string} email - Student's email address to match with form data
   */
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

  /**
   * Effect to load allergies data whenever student email changes
   * Only fetches if valid email exists
   */
  useEffect(() => {
    if (studentEmail && studentEmail !== 'No Email') {
      fetchAllergiesData(studentEmail);
    }
  }, [studentEmail]); // Re-run when studentEmail changes


  // QR CODE GENERATION & MANAGEMENT

  
  /**
   * Generates medical QR code from complete student medical records
   * 
   * Process:
   * 1. Validates email address availability
   * 2. Calls backend service to merge student and hospital data
   * 3. Generates QR code containing medical record ID
   * 4. Updates state with generated QR code and record information
   * 5. Displays success message or error
   * 
   * @async
   * @throws {Error} If email is missing or QR generation fails
   */
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
  
  /**
   * Constructs JSON string value for QR code encoding
   * Contains medical record ID, student name, timestamp, and data URL
   * This value is what gets encoded in the visual QR code
   */
  const qrValue = medicalRecordId ? JSON.stringify({
    id: medicalRecordId,
    name: studentName,
    timestamp: new Date().toISOString(),
    dataUrl: `${window.location.origin}/api/medical-records/${medicalRecordId}`
  }) : "";

 
  // USER INTERACTION HANDLERS

  /**
   * Copies QR code data to clipboard
   * Provides visual feedback by temporarily setting copied state to true
   * 
   * @async
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /**
   * Downloads QR code as PNG image file
   * Creates temporary anchor element to trigger download
   * Filename format: {studentName}-medical-qr-code.png
   */
  const handleDownload = () => {
    if (!qrCodeData) return;
    
    const link = document.createElement('a');
    link.download = `${studentName}-medical-qr-code.png`;
    link.href = qrCodeData;
    link.click();
  };

  /**
   * Shares QR code using native Web Share API (if supported)
   * Fallback: Does nothing if Web Share API not available
   * 
   * @async
   */
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
  
  /**
   * Callback handler for QR scanner results
   * Processes scanned medical data and displays info message
   * 
   * @param {Object} medicalData - Decoded medical record data from QR scan
   * @param {Object} medicalData.student - Student information object
   * @param {string} medicalData.student.fullName - Student's full name
   */
  const handleScanResult = (medicalData) => {
    console.log('Scanned medical data:', medicalData);
    // You can handle the scanned data here (e.g., display in a modal)
    showInfo(`Scanned medical record for: ${medicalData.student.fullName}`, 'Medical Record Scanned');
    setShowScanner(false);
  };

  // JSX RENDER
 
  return (
    <div className="qr-main-container">
      {/* Alert notification component for displaying messages */}
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
        
        {/* ===== HEADER SECTION ===== */}
        {/* Displays profile avatar, greeting, and student email */}
        <div className="qr-header">
          {/* Profile avatar with loading state and fallback icon */}
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

        {/* ===== QR CODE CONTENT SECTION ===== */}
        {/* Two-column layout: Details (left) and QR Display (right) */}
        <div className="qr-content">
          <div className="qr-layout-container">
            
            {/* ===== LEFT COLUMN: Details & Actions ===== */}
            {/* Contains section header, description, form status, and actions */}
            <div className="qr-details-section">
              {/* Section header with QR icon and dynamic title */}
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

              {/* ===== Form Completion Status Widget ===== */}
              {/* Shows which forms are complete and provides guidance */}
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

              {/* ===== Email Input Section ===== */}
              {/* Manual email entry for QR generation when not auto-generated */}
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

              {/* Error message display */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Action buttons (visible only when QR code exists) */}
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

            {/* ===== RIGHT COLUMN: QR Code Display ===== */}
            {/* Shows generated QR code or placeholder with generation button */}
            <div className="qr-display-section">
              <div className="qr-display-area">
                <div className="qr-image-container">
                  {/* Conditional rendering: Show QR code if generated, else show placeholder */}
                  {qrCodeData ? (
                    /* QR Code exists - render visual QR with record ID */
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
                    /* QR Code not generated - show placeholder with generation button */
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

        {/* ===== FOOTER SECTION ===== */}
        {/* Security reminder message */}
        <div className="qr-footer">
          <p className="qr-footer-text">
            Keep this QR code safe — it contains your complete medical record!
          </p>
        </div>
      </div>
      
      {/* ===== QR SCANNER MODAL ===== */}
      {/* Conditionally rendered modal for scanning other QR codes */}
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
