import React, { useState, useEffect } from 'react';
import './StudentQRCode.css';

function StudentQRCode() {
  const [copied, setCopied] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [qrCodePath, setQrCodePath] = useState("");

  useEffect(() => {
    // Load from localStorage
    setStudentName(localStorage.getItem("studentName") || "Student");
    setStudentEmail(localStorage.getItem("studentEmail") || "No Email");
    setQrCodePath(localStorage.getItem("qrCodePath") || "");
  }, []);

  const qrUrl = `http://localhost:8081/qr-codes/${qrCodePath}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `${studentName}-qr-code.png`;
    link.href = qrUrl;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${studentName}'s QR Code`,
          text: 'SmartMed QR Code',
          url: qrUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
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
              {qrCodePath ? "Your Student QR Code" : "No QR Code Available"}
            </span>
          </div>

          <p className="qr-description">
            {qrCodePath
              ? "Scan this code to access your SmartMed info."
              : "No QR code found. Please register to generate one."}
          </p>

          <div className="qr-display-area">
         <div className="qr-image-container">
  {qrCodePath ? (
    <img
  src={`http://localhost:8081/qr-codes/${qrCodePath}`}  // dynamic filename from backend
  alt="Student QR Code"
  className="qr-image"
/>

  ) : (
    <p className="qr-missing-text">QR code is missing</p>
  )}
</div>

          </div>

          {qrCodePath && (
            <div className="qr-actions">
              <button
                onClick={handleCopyLink}
                className={`qr-btn qr-btn-primary ${copied ? 'qr-btn-success' : ''}`}
              >
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>

              <div className="qr-btn-group">
                <button onClick={handleDownload} className="qr-btn qr-btn-secondary">
                  Download
                </button>
                <button onClick={handleShare} className="qr-btn qr-btn-secondary">
                  Share
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="qr-footer">
          <p className="qr-footer-text">
            Keep this QR code safe — it's your SmartMed digital ID!
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentQRCode;
