import React, { useState, useEffect } from 'react';
import './SignatureDisplay.css';

const SignatureDisplay = ({ 
  prescriptionId, 
  signature = null, 
  signedAt = null, 
  doctorName = null,
  showHeader = true,
  showValidation = true,
  className = '',
  onError = null 
}) => {
  const [signatureData, setSignatureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If signature data is provided directly, use it
  useEffect(() => {
    if (signature) {
      setSignatureData({
        signature,
        signedAt,
        doctorName,
        hasSignature: true
      });
    }
  }, [signature, signedAt, doctorName]);

  // Fetch signature data from API if prescriptionId is provided
  const fetchSignatureData = async () => {
    if (!prescriptionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8081/api/prescriptions/${prescriptionId}/signature`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSignatureData(data);
      } else {
        throw new Error(data.message || 'Failed to fetch signature');
      }
    } catch (err) {
      console.error('Error fetching signature:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when prescriptionId changes
  useEffect(() => {
    if (prescriptionId && !signature) {
      fetchSignatureData();
    }
  }, [prescriptionId]);

  // Loading state
  if (loading) {
    return (
      <div className={`signature-display loading ${className}`}>
        <div className="signature-loading">
          <div className="loading-spinner"></div>
          <span>Loading signature...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`signature-display error ${className}`}>
        <div className="signature-error">
          <span className="error-icon">⚠️</span>
          <span>Error loading signature: {error}</span>
          <button 
            className="retry-btn" 
            onClick={fetchSignatureData}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No signature available
  if (!signatureData || !signatureData.hasSignature || !signatureData.signature) {
    return (
      <div className={`signature-display no-signature ${className}`}>
        <div className="no-signature-message">
          <span className="no-signature-icon">📝</span>
          <span>No digital signature available</span>
        </div>
      </div>
    );
  }

  const formatSignedAt = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  return (
    <div className={`signature-display ${className}`}>
      {showHeader && (
        <div className="signature-header">
          <div className="signature-title">
            <span className="signature-icon">✍️</span>
            <h3>Digital Signature</h3>
          </div>
        </div>
      )}
      
      <div className="signature-content">
        <div className="signature-image-container">
          <img 
            src={signatureData.signature} 
            alt="Digital Signature" 
            className="signature-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="signature-load-error" style={{ display: 'none' }}>
            <span>⚠️ Signature image failed to load</span>
          </div>
        </div>
        
        <div className="signature-info">
          <div className="signature-detail">
            <span className="detail-label">Signed by:</span>
            <span className="detail-value">{signatureData.doctorName || 'Unknown Doctor'}</span>
          </div>
          
          {signatureData.signedAt && (
            <div className="signature-detail">
              <span className="detail-label">Signed at:</span>
              <span className="detail-value">{formatSignedAt(signatureData.signedAt)}</span>
            </div>
          )}
          
          {signatureData.patientName && (
            <div className="signature-detail">
              <span className="detail-label">Patient:</span>
              <span className="detail-value">{signatureData.patientName}</span>
            </div>
          )}
          
          {showValidation && (
            <div className="signature-validation">
              <span className="validation-icon">✓</span>
              <span className="validation-text">Valid Digital Signature</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignatureDisplay;