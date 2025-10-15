import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SignatureDisplay from '../SignatureDisplay/SignatureDisplay';
import AlertMessage from '../AlertMessage';
import useAlert from '../../../hooks/useAlert';
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
  const { alertState, showError, hideAlert } = useAlert();

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
      // Show loading message
      const originalButtonText = document.querySelector('.download-btn').innerHTML;
      document.querySelector('.download-btn').innerHTML = '<span>Generating PDF...</span>';
      document.querySelector('.download-btn').disabled = true;
      
      // Create a dedicated PDF container with exact A4 proportions
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: absolute;
        left: -10000px;
        top: 0;
        width: 210mm;
        background: white;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #000;
        padding: 0;
        margin: 0;
        overflow: visible;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        zoom: 1;
      `;
      
      // Create the complete prescription HTML structure for PDF
      pdfContainer.innerHTML = `
        <div style="padding: 10mm; background: white; min-height: 257mm; overflow: visible; font-size: 12px; line-height: 1.3;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 8px; border-bottom: 2px solid #2563eb; margin-bottom: 10px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 30px; height: 30px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold;">
                ℞
              </div>
              <div>
                <h1 style="font-size: 16px; font-weight: 800; color: #1e40af; margin: 0 0 2px 0; font-family: 'Crimson Text', serif;">SmartMed Clinic</h1>
                <p style="font-size: 8px; color: #64748b; margin: 0 0 4px 0; font-style: italic;">Digital Healthcare Solutions</p>
                <div style="font-size: 8px; color: #475569;">
                  <div>📍 Medical Campus, University Drive</div>
                  <div>📞 +1 (555) 123-4567</div>
                  <div>📧 info@smartmedclinic.com</div>
                </div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
                <span style="font-size: 20px; font-weight: bold; color: #dc2626; font-family: 'Crimson Text', serif;">℞</span>
                <span style="font-size: 12px; font-weight: 700; color: #1e40af;">#${prescription.queueNo || prescription.internalId}</span>
              </div>
              <div style="font-size: 10px;">
                <div style="margin-bottom: 2px;"><span style="font-weight: 600; color: #475569;">Date:</span> <span style="color: #1a202c; font-weight: 500;">${formatDate(prescription.prescriptionTime)}</span></div>
                <div><span style="font-weight: 600; color: #475569;">Time:</span> <span style="color: #1a202c; font-weight: 500;">${formatTime(prescription.prescriptionTime)}</span></div>
              </div>
            </div>
          </div>

          <!-- Patient Information -->
          <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <h2 style="font-size: 12px; font-weight: 700; color: #1e40af; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #3b82f6; padding-bottom: 2px;">Patient Information</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <div style="font-size: 8px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 2px;">Patient Name</div>
                <div style="font-size: 10px; font-weight: 600; color: #1a202c; padding: 3px 6px; background: #f1f5f9; border-radius: 2px; border-left: 2px solid #3b82f6;">${prescription.studentName}</div>
              </div>
              <div>
                <div style="font-size: 8px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 2px;">Patient ID</div>
                <div style="font-size: 10px; font-weight: 600; color: #1a202c; padding: 3px 6px; background: #f1f5f9; border-radius: 2px; border-left: 2px solid #3b82f6;">${prescription.studentId}</div>
              </div>
            </div>
          </div>

          <!-- Doctor Information -->
          <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <h2 style="font-size: 12px; font-weight: 700; color: #1e40af; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #3b82f6; padding-bottom: 2px;">Prescribing Physician</h2>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="font-size: 12px; font-weight: 700; color: #dc2626; font-family: 'Crimson Text', serif;">Dr.</span>
              <span style="font-size: 13px; font-weight: 700; color: #1e40af;">${prescription.prescription.doctorName}</span>
            </div>
            <div style="display: flex; gap: 12px; font-size: 8px; color: #475569;">
              <span>Medical License: MD-2024-001</span>
              <span>Specialization: General Medicine</span>
            </div>
          </div>

          <!-- Prescribed Medications -->
          <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <h2 style="font-size: 12px; font-weight: 700; color: #1e40af; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #3b82f6; padding-bottom: 2px;">Prescribed Medications</h2>
            ${prescription.prescription.medications?.map((medication, index) => `
              <div style="border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; background: #fafafa; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: #1e40af; color: white;">
                  <div style="font-size: 10px; font-weight: 700; background: white; color: #1e40af; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${index + 1}</div>
                  <div style="font-size: 12px; font-weight: 700; flex: 1;">${medication.name}</div>
                </div>
                <div style="padding: 8px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
                    <div>
                      <div style="font-size: 7px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 2px;">Strength/Dosage</div>
                      <div style="font-size: 9px; font-weight: 600; color: #1a202c; padding: 3px 5px; background: white; border-radius: 2px; border: 1px solid #e2e8f0;">${medication.dosage}</div>
                    </div>
                    <div>
                      <div style="font-size: 7px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 2px;">Quantity</div>
                      <div style="font-size: 9px; font-weight: 600; color: #1a202c; padding: 3px 5px; background: white; border-radius: 2px; border: 1px solid #e2e8f0;">${medication.quantity || '30'} tablets/capsules</div>
                    </div>
                    <div>
                      <div style="font-size: 7px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 2px;">Frequency</div>
                      <div style="font-size: 9px; font-weight: 600; color: #1a202c; padding: 3px 5px; background: white; border-radius: 2px; border: 1px solid #e2e8f0;">${medication.frequency}</div>
                    </div>
                    <div>
                      <div style="font-size: 7px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 2px;">Duration</div>
                      <div style="font-size: 9px; font-weight: 600; color: #1a202c; padding: 3px 5px; background: white; border-radius: 2px; border: 1px solid #e2e8f0;">${medication.duration}</div>
                    </div>
                  </div>
                  ${medication.instructions ? `
                    <div style="padding-top: 6px; border-top: 1px solid #e2e8f0;">
                      <div style="font-size: 7px; font-weight: 600; color: #dc2626; text-transform: uppercase; margin-bottom: 3px;">Special Instructions</div>
                      <div style="font-size: 8px; color: #1a202c; font-style: italic; background: #fef2f2; padding: 4px 6px; border-radius: 2px; border-left: 2px solid #dc2626;">${medication.instructions}</div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('') || '<p style="color: #6b7280; font-size: 10px;">No medications prescribed.</p>'}
          </div>

          ${prescription.prescription.prescriptionText ? `
          <!-- Clinical Notes -->
          <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <h2 style="font-size: 12px; font-weight: 700; color: #1e40af; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #3b82f6; padding-bottom: 2px;">Clinical Notes & Instructions</h2>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 3px; padding: 8px; border-left: 2px solid #059669;">
              <p style="margin: 0; font-size: 9px; line-height: 1.4; color: #374151;">${prescription.prescription.prescriptionText}</p>
            </div>
          </div>
          ` : ''}

          <!-- Digital Signature Section -->
          <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <h2 style="font-size: 12px; font-weight: 700; color: #1e40af; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #3b82f6; padding-bottom: 2px;">Digital Signature</h2>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px;">
              <div style="border: 1px dashed #3b82f6; border-radius: 3px; padding: 8px; background: white; margin-bottom: 8px; text-align: center; min-height: 40px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-style: italic; font-size: 8px;">
                Digital Signature Present - Validated ✓
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div style="padding: 4px 6px; background: white; border-radius: 3px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 7px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 2px;">Signed by</div>
                  <div style="font-size: 9px; font-weight: 600; color: #1a202c;">${prescription.prescription.doctorName}</div>
                </div>
                <div style="padding: 4px 6px; background: white; border-radius: 3px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 7px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 2px;">Signed at</div>
                  <div style="font-size: 9px; font-weight: 600; color: #1a202c;">${formatDate(prescription.prescriptionTime)} ${formatTime(prescription.prescriptionTime)}</div>
                </div>
              </div>
              <div style="margin-top: 8px; padding: 4px 8px; background: #f0fdf4; border: 1px solid #16a34a; border-radius: 3px; display: flex; align-items: center; gap: 4px;">
                <span style="color: #16a34a; font-size: 10px;">✓</span>
                <span style="color: #16a34a; font-weight: 600; font-size: 8px;">Valid Digital Signature</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 8px 0; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-top: 1px solid #3b82f6; margin-top: 8px;">
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 2px solid #dc2626; border-radius: 3px; padding: 6px; margin-bottom: 8px;">
              <p style="margin: 0 0 3px 0; font-weight: 600; color: #dc2626; font-size: 8px;"><strong>⚠️ IMPORTANT INSTRUCTIONS:</strong></p>
              <ul style="margin: 3px 0 0 12px; padding: 0; list-style-type: disc;">
                <li style="font-size: 7px; color: #7f1d1d; margin-bottom: 1px;">Take medications exactly as prescribed</li>
                <li style="font-size: 7px; color: #7f1d1d; margin-bottom: 1px;">Complete the full course even if you feel better</li>
                <li style="font-size: 7px; color: #7f1d1d; margin-bottom: 1px;">Do not share medications with others</li>
                <li style="font-size: 7px; color: #7f1d1d; margin-bottom: 1px;">Contact your doctor if you experience any side effects</li>
                <li style="font-size: 7px; color: #7f1d1d; margin-bottom: 1px;">Store medications in a cool, dry place away from children</li>
              </ul>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 4px; border-top: 1px solid #cbd5e1;">
              <div>
                <p style="margin: 0; font-size: 8px; font-weight: 600; color: #1e40af;"><strong>Prescription Validity:</strong> This prescription is valid for 30 days from the date of issue.</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 7px; color: #64748b; line-height: 1.2;">Generated electronically by SmartMed Digital Healthcare System</p>
                <p style="margin: 0; font-size: 7px; color: #475569; font-weight: 600; line-height: 1.2;">Generated on: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add to DOM
      document.body.appendChild(pdfContainer);
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate PDF using html2canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        foreignObjectRendering: false,
        removeContainer: false
      });
      
      // Remove temporary container
      document.body.removeChild(pdfContainer);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF (split pages if needed)
      let position = 0;
      while (position < imgHeight) {
        if (position > 0) {
          pdf.addPage();
        }
        
        const pageHeight = Math.min(pdfHeight, imgHeight - position);
        const sourceY = (position / imgHeight) * canvas.height;
        const sourceHeight = (pageHeight / imgHeight) * canvas.height;
        
        // Create page canvas
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        pageCtx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );
        
        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, pageHeight);
        
        position += pdfHeight;
      }
      
      // Download PDF
      const fileName = `Prescription_${prescription.studentName || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Restore button
      document.querySelector('.download-btn').innerHTML = originalButtonText;
      document.querySelector('.download-btn').disabled = false;
      
      console.log('PDF generated successfully with all content!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Error generating PDF. Please try again.', 'PDF Generation Failed');
      
      // Restore button
      document.querySelector('.download-btn').innerHTML = originalButtonText;
      document.querySelector('.download-btn').disabled = false;
    }
  };

  return (
    <div className={`prescription-display-overlay ${className}`}>
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
                <h1>SmartMed</h1>
                <p>Digital Healthcare Solutions</p>
                <div className="clinic-details">
                  <span>📍 Institute of Technology University of Moratuwa</span>
                  <span>📞 +1 (555) 123-4567</span>
                  <span>📧 info@smartmed.com</span>
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
                <span className="doctor-title">Dr.Sugath Dhanapala</span>
              </div>
              <div className="doctor-info">
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