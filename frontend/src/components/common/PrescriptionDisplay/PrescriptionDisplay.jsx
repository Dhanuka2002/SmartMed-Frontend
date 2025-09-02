import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SignatureDisplay from '../SignatureDisplay/SignatureDisplay';
import './PrescriptionDisplay.css';

const PrescriptionDisplay = ({ 
  prescription, 
  onClose, 
  showDownload = true,
  showPharmacyActions = false,
  onStatusUpdate = null,
  onDispense = null,
  className = '' 
}) => {
  const prescriptionRef = useRef();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return 'Invalid time';
    }
  };

  const downloadPDF = async () => {
    if (!prescriptionRef.current) return;
    
    try {
      // Create a temporary container with white background
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.background = 'white';
      tempContainer.style.padding = '20px';
      tempContainer.style.width = '800px';
      
      // Clone the prescription content
      const prescriptionClone = prescriptionRef.current.cloneNode(true);
      tempContainer.appendChild(prescriptionClone);
      document.body.appendChild(tempContainer);
      
      // Generate canvas from the cloned element
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight + 40
      });
      
      // Remove temporary container
      document.body.removeChild(tempContainer);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Account for margins
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }
      
      // Download the PDF
      const fileName = `Prescription_${prescription.studentName || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className={`prescription-display-overlay ${className}`}>
      <div className="prescription-display-container">
        {/* Action Bar - Only visible on screen, not in PDF */}
        <div className="prescription-actions no-print">
          <div className="left-actions">
            {showDownload && (
              <button 
                className="download-btn"
                onClick={downloadPDF}
                title="Download Prescription as PDF"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PDF
              </button>
            )}
          </div>

          <div className="right-actions">
            {showPharmacyActions && prescription.pharmacyStatus !== 'Dispensed' && (
              <>
                <select
                  value={prescription.pharmacyStatus || 'Pending'}
                  onChange={(e) => onStatusUpdate && onStatusUpdate(prescription.queueNo, e.target.value)}
                  className="status-select"
                  title="Update prescription status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                </select>
                
                <button 
                  className="dispense-btn"
                  onClick={() => onDispense && onDispense(prescription.queueNo)}
                  disabled={prescription.pharmacyStatus !== 'Ready'}
                  title="Dispense Medication"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                  Dispense
                </button>
              </>
            )}
            
            {onClose && (
              <button className="close-btn" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Close
              </button>
            )}
          </div>
        </div>

        {/* Professional Prescription Layout */}
        <div ref={prescriptionRef} className="medical-prescription">
          {/* Header */}
          <div className="prescription-header">
            <div className="medical-logo">
              <div className="logo-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div className="clinic-info">
                <h1>SmartMed Clinic</h1>
                <p>Digital Healthcare Solutions</p>
                <div className="clinic-details">
                  <span>📍 Medical Campus, University Drive</span>
                  <span>📞 +1 (555) 123-4567</span>
                  <span>📧 info@smartmedclinic.com</span>
                </div>
              </div>
            </div>
            <div className="prescription-id">
              <div className="rx-number">
                <span className="rx-label">℞</span>
                <span className="rx-id">#{prescription.queueNo || prescription.internalId}</span>
              </div>
              <div className="date-info">
                <div className="date-item">
                  <span className="date-label">Date:</span>
                  <span className="date-value">{formatDate(prescription.prescriptionTime)}</span>
                </div>
                <div className="date-item">
                  <span className="date-label">Time:</span>
                  <span className="date-value">{formatTime(prescription.prescriptionTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="patient-section">
            <div className="section-title">
              <h2>Patient Information</h2>
            </div>
            <div className="patient-details">
              <div className="patient-row">
                <div className="patient-field">
                  <label>Patient Name:</label>
                  <span className="patient-value">{prescription.studentName}</span>
                </div>
                <div className="patient-field">
                  <label>Patient ID:</label>
                  <span className="patient-value">{prescription.studentId}</span>
                </div>
              </div>
              <div className="patient-row">
                <div className="patient-field">
                  <label>Date of Birth:</label>
                  <span className="patient-value">Not Specified</span>
                </div>
                <div className="patient-field">
                  <label>Gender:</label>
                  <span className="patient-value">Not Specified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="doctor-section">
            <div className="section-title">
              <h2>Prescribing Physician</h2>
            </div>
            <div className="doctor-details">
              <div className="doctor-name">
                <span className="doctor-title">Dr.</span>
                <span className="doctor-value">{prescription.prescription.doctorName}</span>
              </div>
              <div className="doctor-info">
                <span>Medical License: MD-2024-001</span>
                <span>Specialization: General Medicine</span>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="medications-section">
            <div className="section-title">
              <h2>Prescribed Medications</h2>
            </div>
            <div className="medications-list">
              {prescription.prescription.medications && prescription.prescription.medications.map((medication, index) => (
                <div key={index} className="medication-item">
                  <div className="medication-header">
                    <div className="medication-number">{index + 1}.</div>
                    <div className="medication-name">{medication.name}</div>
                  </div>
                  <div className="medication-details">
                    <div className="medication-grid">
                      <div className="med-detail">
                        <label>Strength/Dosage:</label>
                        <span>{medication.dosage}</span>
                      </div>
                      <div className="med-detail">
                        <label>Quantity:</label>
                        <span>{medication.quantity || '30'} tablets/capsules</span>
                      </div>
                      <div className="med-detail">
                        <label>Frequency:</label>
                        <span>{medication.frequency}</span>
                      </div>
                      <div className="med-detail">
                        <label>Duration:</label>
                        <span>{medication.duration}</span>
                      </div>
                    </div>
                    {medication.instructions && (
                      <div className="medication-instructions">
                        <label>Special Instructions:</label>
                        <span>{medication.instructions}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes */}
          {prescription.prescription.prescriptionText && (
            <div className="notes-section">
              <div className="section-title">
                <h2>Clinical Notes & Instructions</h2>
              </div>
              <div className="notes-content">
                <p>{prescription.prescription.prescriptionText}</p>
              </div>
            </div>
          )}

          {/* Digital Signature */}
          <div className="signature-section">
            <div className="section-title">
              <h2>Digital Signature</h2>
            </div>
            <div className="signature-area">
              <SignatureDisplay 
                prescriptionId={prescription.internalId}
                doctorName={prescription.prescription.doctorName}
                showHeader={false}
                showValidation={true}
                className="prescription-signature"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="prescription-footer">
            <div className="footer-content">
              <div className="footer-warning">
                <p><strong>⚠️ IMPORTANT INSTRUCTIONS:</strong></p>
                <ul>
                  <li>Take medications exactly as prescribed</li>
                  <li>Complete the full course even if you feel better</li>
                  <li>Do not share medications with others</li>
                  <li>Contact your doctor if you experience any side effects</li>
                  <li>Store medications in a cool, dry place away from children</li>
                </ul>
              </div>
              <div className="footer-info">
                <div className="validity">
                  <p><strong>Prescription Validity:</strong> This prescription is valid for 30 days from the date of issue.</p>
                </div>
                <div className="generated-info">
                  <p>Generated electronically by SmartMed Digital Healthcare System</p>
                  <p className="generation-time">Generated on: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDisplay;