import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import QRScanner from '../../QRScanner/QRScanner';
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

  useEffect(() => {
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

    // Listen for QR code generation events
    const handleQRGenerated = (event) => {
      const { email, recordId } = event.detail;
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
        alert('Medical QR code generated successfully!');
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
    alert(`Scanned medical record for: ${medicalData.student.fullName}`);
    setShowScanner(false);
  };

  return (
    <div className="qr-main-container">
      <div className="qr-card-wrapper">
        {/* Header */}
        <div className="qr-header">
          <div className="qr-avatar">
            <svg className="user-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.66 13.66 9 12 9S9 7.66 9 6V4L3 7V9H21ZM12 11C14.21 11 16 12.79 16 15V16L15 17V22H9V17L8 16V15C8 12.79 9.79 11 12 11Z"/>
            </svg>
          </div>
          <h1 className="qr-greeting">Hello, {studentName}!</h1>
          <p className="qr-student-id">Email: {studentEmail}</p>
        </div>

        {/* QR Code Section */}
        <div className="qr-content">
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
            <div className="form-status" style={{
              background: formsStatus.bothComplete ? '#d4edda' : '#fff3cd',
              border: `1px solid ${formsStatus.bothComplete ? '#c3e6cb' : '#ffeaa7'}`,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{margin: '0 0 0.5rem 0', color: '#495057'}}>
                Form Completion Status: 
                {formsStatus.bothComplete ? (
                  <span style={{color: '#155724', marginLeft: '0.5rem'}}>✅ Complete</span>
                ) : (
                  <span style={{color: '#856404', marginLeft: '0.5rem'}}>⏳ Incomplete</span>
                )}
              </h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: formsStatus.hasStudentData ? '#28a745' : '#dc3545'
                  }}></span>
                  <span style={{fontSize: '0.9rem'}}>
                    Student Details Form {formsStatus.hasStudentData ? '✓' : '✗'}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: formsStatus.hasHospitalData ? '#28a745' : '#dc3545'
                  }}></span>
                  <span style={{fontSize: '0.9rem'}}>
                    Hospital Examination Form {formsStatus.hasHospitalData ? '✓' : '✗'}
                  </span>
                </div>
                {formsStatus.bothComplete && !qrCodeData && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#b3d4fc',
                    borderRadius: '4px',
                    color: '#0c5460',
                    fontSize: '0.85rem'
                  }}>
                    🔄 Both forms are complete! QR code should generate automatically. If not visible, try clicking "Generate Medical QR Code" below.
                  </div>
                )}
                {!formsStatus.bothComplete && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#f8d7da',
                    borderRadius: '4px',
                    color: '#721c24',
                    fontSize: '0.85rem'
                  }}>
                    📝 Complete both forms to generate your QR code automatically.
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Email Input Section */}
          {!qrCodeData && (
            <div className="email-input-section" style={{margin: '1rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333'}}>
                Student Email Address:
              </label>
              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Enter your email address"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={() => setInputEmail(studentEmail !== 'No Email' ? studentEmail : '')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Use Saved
                </button>
              </div>
              <small style={{color: '#666', marginTop: '0.25rem', display: 'block'}}>
                This email should match the email used in both Student Details and Hospital Examination forms.
              </small>
            </div>
          )}
          
          {error && (
            <div className="error-message" style={{background: '#ffe6e6', border: '1px solid #ffb3b3', color: '#d63031', padding: '1rem', borderRadius: '8px', margin: '1rem 0'}}>
              {error}
            </div>
          )}

          <div className="qr-display-area">
            <div className="qr-image-container">
              {qrCodeData ? (
                <div className="qr-code-wrapper" style={{background: 'white', padding: '1.5rem', borderRadius: '12px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
                  <QRCode
                    value={qrValue}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                  <div style={{textAlign: 'center', marginTop: '1rem', color: '#666'}}>
                    <p style={{margin: 0, fontSize: '0.9rem'}}>Medical Record ID:</p>
                    <p style={{margin: 0, fontSize: '0.8rem', fontFamily: 'monospace'}}>{medicalRecordId}</p>
                  </div>
                </div>
              ) : (
                <div className="qr-missing-container" style={{textAlign: 'center', padding: '2rem'}}>
                  <div style={{marginBottom: '1.5rem'}}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="#ccc" style={{marginBottom: '1rem'}}>
                      <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,5H21V9H19V5M5,5H9V9H5V5M3,19H5V21H3V19M5,19H9V21H5V19M19,19H21V21H19V19M15,19H17V21H15V19M17,15H19V17H17V15M15,13H17V15H15V13M15,5H17V7H15V5M13,19H15V21H13V19M15,7H17V9H15V7M7,19H9V21H7V19M13,7H15V9H13V7M13,3H15V5H13V3M3,9H5V11H3V9M7,3H9V5H7V3M21,11H23V13H21V11M21,9H23V11H21V9M21,13H23V15H21V13M3,7H5V9H3V7M21,3H23V5H21V3M21,5H23V7H21V5M19,3H21V5H19V3M17,3H19V5H17V3M3,3H5V5H3V3M3,5H5V7H3V5M5,3H7V5H5V3M9,3H11V5H9V3M11,3H13V5H11V3"/>
                    </svg>
                  </div>
                  <p className="qr-missing-text" style={{marginBottom: '1rem', color: '#666'}}>Medical QR code not generated yet</p>
                  <p style={{marginBottom: '1.5rem', color: '#888', fontSize: '0.9rem'}}>
                    Make sure both Student Details and Hospital Examination forms are completed with the same email address.
                  </p>
                  <button 
                    onClick={generateMedicalQR} 
                    disabled={isGenerating || !inputEmail}
                    className="generate-qr-btn"
                    style={{
                      background: (!inputEmail || isGenerating) ? '#6c757d' : '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      cursor: (!inputEmail || isGenerating) ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      opacity: (!inputEmail || isGenerating) ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <span style={{marginRight: '0.5rem'}}>⏳</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span style={{marginRight: '0.5rem'}}>🔗</span>
                        Generate Medical QR Code
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

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
