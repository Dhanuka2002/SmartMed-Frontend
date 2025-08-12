import React, { useState } from 'react';
import './StudentQRCode.css';

// Import your QR code image or use QR generator
import sampleQR from "../../../assets/qr.png";

function StudentQRCode() {
  const [copied, setCopied] = useState(false);
  const studentName = "Franklin";
  const studentId = "STU-2024-001";
  const qrData = "https://example.com/student/franklin-id-001";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    // Create download link
    const link = document.createElement('a');
    link.download = `${studentName}-qr-code.png`;
    link.href = sampleQR; // Use your QR image
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${studentName}'s QR Code`,
          text: 'Student QR Code for quick identification',
          url: qrData
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <div className="qr-main-container">
      <div className="qr-card-wrapper">
        
        {/* Header Section */}
        <div className="qr-header">
          <div className="qr-avatar">
            <svg className="user-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.66 13.66 9 12 9S9 7.66 9 6V4L3 7V9H21ZM12 11C14.21 11 16 12.79 16 15V16L15 17V22H9V17L8 16V15C8 12.79 9.79 11 12 11Z"/>
            </svg>
          </div>
          <h1 className="qr-greeting">Hello, {studentName}!</h1>
          <p className="qr-student-id">Student ID: {studentId}</p>
        </div>

        {/* QR Code Section */}
        <div className="qr-content">
          <div className="qr-section-header">
            <svg className="qr-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,5H21V9H19V5M5,5H9V9H5V5M3,19H5V21H3V19M5,19H9V21H5V19M19,19H21V21H19V19M15,19H17V21H15V19M17,15H19V17H17V15M15,13H17V15H15V13M15,5H17V7H15V5M13,19H15V21H13V19M15,7H17V9H15V7M7,19H9V21H7V19M13,7H15V9H13V7M13,3H15V5H13V3M3,9H5V11H3V9M7,3H9V5H7V3M21,11H23V13H21V11M21,9H23V11H21V9M21,13H23V15H21V13M3,7H5V9H3V7M21,3H23V5H21V3M21,5H23V7H21V5M19,3H21V5H19V3M17,3H19V5H17V3M3,3H5V5H3V3M3,5H5V7H3V5M5,3H7V5H5V3M9,3H11V5H9V3M11,3H13V5H11V3"/>
            </svg>
            <span className="qr-section-title">Your QR Code</span>
          </div>
          <p className="qr-description">
            Scan this code for quick access to your student profile and information
          </p>

          {/* QR Display */}
          <div className="qr-display-area">
            <div className="qr-image-container">
              <img src={sampleQR} alt="Student QR Code" className="qr-image" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="qr-actions">
            <button
              onClick={handleCopyLink}
              className={`qr-btn qr-btn-primary ${copied ? 'qr-btn-success' : ''}`}
            >
              <svg className="qr-btn-icon" viewBox="0 0 24 24" fill="currentColor">
                {copied ? (
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                ) : (
                  <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                )}
              </svg>
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>

            <div className="qr-btn-group">
              <button onClick={handleDownload} className="qr-btn qr-btn-secondary">
                <svg className="qr-btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                </svg>
                Download
              </button>
              <button onClick={handleShare} className="qr-btn qr-btn-secondary">
                <svg className="qr-btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z"/>
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="qr-footer">
          <p className="qr-footer-text">
            Keep this QR code secure and accessible for campus activities
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentQRCode;