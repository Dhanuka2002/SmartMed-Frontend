import React, { useState, useEffect } from 'react';
import './DoctorReport.css';

const DoctorReport = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);
  const [reportType, setReportType] = useState('detailed');
  const [printMode, setPrintMode] = useState(false);

  // Load selected patient data
  useEffect(() => {
    const stored = localStorage.getItem('selectedPatient');
    if (stored) {
      const patient = JSON.parse(stored);
      setSelectedPatient(patient);
      loadPatientMedicalData(patient);
    }
  }, []);

  const loadPatientMedicalData = (patient) => {
    if (!patient) return;
    
    console.log('Loading patient medical data for:', patient);
    
    // Try multiple approaches to load patient data
    const possibleKeys = [
      patient.email,
      patient.studentId,
      patient.studentName,
      `student_${patient.studentId}`,
      `student_${patient.email}`,
      `studentData_${patient.email}`,
      `hospitalData_${patient.email}`
    ];
    
    console.log('Trying keys:', possibleKeys);

    // Load student form data (Part 1)
    let foundStudentData = null;
    for (const key of possibleKeys) {
      const data = localStorage.getItem(`studentData_${key}`);
      if (data) {
        console.log(`Found student data with key: studentData_${key}`);
        foundStudentData = JSON.parse(data);
        break;
      }
    }
    
    if (foundStudentData) {
      console.log('Using found student data:', foundStudentData);
      setPatientData(foundStudentData);
    } else {
      console.log('No stored data found, creating fallback data');
      // If no stored data found, create basic data from selectedPatient with fallbacks
      const fallbackData = {
        fullName: patient.studentName || patient.name || 'John Doe (Demo)',
        studentId: patient.studentId || patient.id || 'STU001',
        email: patient.email || 'student@example.com',
        nic: patient.nic || patient.nicNumber || '199901234567',
        telephoneNumber: patient.phone || patient.telephone || '+94771234567',
        age: patient.age || calculateAge(patient.dateOfBirth) || 23,
        dateOfBirth: patient.dateOfBirth || patient.dob || '1999-01-01',
        gender: patient.gender || 'Male',
        nationality: patient.nationality || 'Sri Lankan',
        academicDivision: patient.academicDivision || patient.division || patient.medicalData?.student?.academicDivision || 'Information Technology'
      };
      console.log('Created fallback data:', fallbackData);
      setPatientData(fallbackData);
    }

    // Load hospital form data (Part 2)  
    let foundHospitalData = null;
    for (const key of possibleKeys) {
      const data = localStorage.getItem(`hospitalData_${key}`);
      if (data) {
        foundHospitalData = JSON.parse(data);
        break;
      }
    }
    
    if (foundHospitalData) {
      setHospitalData(foundHospitalData);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'yes': return '#ef4444';
      case 'no': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',  
      day: 'numeric'
    });
  };

  // Debug logging
  console.log('selectedPatient:', selectedPatient);
  console.log('patientData:', patientData);
  console.log('hospitalData:', hospitalData);

  if (!selectedPatient) {
    return (
      <div className="report-container">
        <div className="no-patient">
          <div className="no-patient-icon">📋</div>
          <h2>No Patient Selected</h2>
          <p>Please select a patient from the Doctor Dashboard or Queue to view their medical report.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`report-container ${printMode ? 'print-mode' : ''}`}>
      {/* Header Controls */}
      {!printMode && (
        <div className="report-controls">
          <div className="controls-left">
            <h1>📋 Medical Report</h1>
            <div className="patient-selector">
              <span className="patient-name">{selectedPatient?.studentName || 'Unknown Patient'}</span>
              <span className="queue-number">Queue #{selectedPatient?.queueNo}</span>
            </div>
          </div>
          <div className="controls-right">
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="report-type-select"
            >
              <option value="detailed">Detailed Report</option>
              <option value="summary">Summary Report</option>
              <option value="prescription">Prescription Only</option>
            </select>
            <button className="print-btn" onClick={handlePrint}>
              🖨️ Print Report
            </button>
          </div>
        </div>
      )}

      {/* Medical Report Content */}
      <div className="medical-report">
        {/* Report Header */}
        <div className="report-header">
          <div className="hospital-logo">
            <div className="logo-icon">🏥</div>
            <div className="hospital-info">
              <h1>SmartMed Healthcare System</h1>
              <p>University Medical Center</p>
              <p>Comprehensive Medical Examination Report</p>
            </div>
          </div>
          <div className="report-meta">
            <div className="report-date">
              <strong>Report Date:</strong> {formatDate(new Date().toISOString())}
            </div>
            <div className="report-id">
              <strong>Report ID:</strong> SMH-{selectedPatient?.queueNo || '001'}-{new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Patient Information Summary */}
        <div className="report-section patient-overview" style={{ display: 'block', visibility: 'visible' }}>
          <h2 className="section-title">Patient Information</h2>
          <div className="patient-info-grid" style={{ display: 'grid', visibility: 'visible' }}>
            <div className="info-card" style={{ display: 'block', visibility: 'visible' }}>
              <h3>Basic Details</h3>
              <div className="info-rows">
                <div className="info-row">
                  <span className="label">Full Name:</span>
                  <span className="value">
                    {patientData?.fullName || 
                     patientData?.name || 
                     selectedPatient?.studentName || 
                     selectedPatient?.name || 
                     'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Student ID:</span>
                  <span className="value">
                    {patientData?.studentRegistrationNumber || 
                     patientData?.studentId || 
                     patientData?.registrationNumber ||
                     selectedPatient?.studentId || 
                     selectedPatient?.id || 
                     'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">NIC:</span>
                  <span className="value">
                    {patientData?.nic || 
                     patientData?.nicNumber ||
                     selectedPatient?.nic || 
                     selectedPatient?.nicNumber ||
                     'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">
                    {patientData?.email || 
                     selectedPatient?.email || 
                     'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">
                    {patientData?.telephoneNumber || 
                     patientData?.telephone || 
                     patientData?.phone ||
                     selectedPatient?.phone || 
                     selectedPatient?.telephone ||
                     'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="info-card" style={{ 
              display: 'block', 
              visibility: 'visible',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              minHeight: '200px'
            }}>
              <h3 style={{ color: '#3b82f6', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                Personal Details - TEST
              </h3>
              <div className="info-rows" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label" style={{ fontWeight: '500', color: '#6b7280', minWidth: '120px' }}>Age:</span>
                  <span className="value" style={{ fontWeight: '600', color: '#1f2937', textAlign: 'right' }}>
                    {patientData?.age || selectedPatient?.age || '25 (TEST)'}
                  </span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label" style={{ fontWeight: '500', color: '#6b7280', minWidth: '120px' }}>Date of Birth:</span>
                  <span className="value" style={{ fontWeight: '600', color: '#1f2937', textAlign: 'right' }}>
                    {formatDate(patientData?.dateOfBirth || patientData?.dob || selectedPatient?.dateOfBirth) || 'January 1, 1999 (TEST)'}
                  </span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label" style={{ fontWeight: '500', color: '#6b7280', minWidth: '120px' }}>Gender:</span>
                  <span className="value" style={{ fontWeight: '600', color: '#1f2937', textAlign: 'right' }}>
                    {patientData?.gender || selectedPatient?.gender || 'Male (TEST)'}
                  </span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label" style={{ fontWeight: '500', color: '#6b7280', minWidth: '120px' }}>Nationality:</span>
                  <span className="value" style={{ fontWeight: '600', color: '#1f2937', textAlign: 'right' }}>
                    {patientData?.nationality || selectedPatient?.nationality || 'Sri Lankan (TEST)'}
                  </span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label" style={{ fontWeight: '500', color: '#6b7280', minWidth: '120px' }}>Academic Division:</span>
                  <span className="value" style={{ fontWeight: '600', color: '#1f2937', textAlign: 'right' }}>
                    {patientData?.academicDivision || 
                     patientData?.division ||
                     selectedPatient?.academicDivision ||
                     selectedPatient?.division ||
                     selectedPatient?.medicalData?.student?.academicDivision || 
                     'Information Technology (TEST)'}
                  </span>
                </div>
              </div>
              {/* Debug Info */}
              <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '0.75rem' }}>
                <div><strong>Debug Info:</strong></div>
                <div>patientData exists: {patientData ? 'Yes' : 'No'}</div>
                <div>selectedPatient exists: {selectedPatient ? 'Yes' : 'No'}</div>
                <div>patientData fullName: {patientData?.fullName || 'None'}</div>
                <div>selectedPatient studentName: {selectedPatient?.studentName || 'None'}</div>
                <div>patientData age: {patientData?.age || 'None'}</div>
                <div>patientData academicDivision: {patientData?.academicDivision || 'None'}</div>
              </div>
            </div>

            <div className="info-card">
              <h3>Emergency Contact</h3>
              <div className="info-rows">
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">
                    {patientData?.emergencyName || 
                     patientData?.emergencyContactName ||
                     patientData?.emergencyContact?.name ||
                     selectedPatient?.emergencyContact?.name ||
                     selectedPatient?.medicalData?.student?.emergencyContact?.name || 
                     'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">
                    {patientData?.emergencyTelephone || 
                     patientData?.emergencyPhone ||
                     patientData?.emergencyContact?.telephone ||
                     patientData?.emergencyContact?.phone ||
                     selectedPatient?.emergencyContact?.telephone ||
                     selectedPatient?.emergencyContact?.phone ||
                     selectedPatient?.medicalData?.student?.emergencyContact?.telephone || 
                     'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Relationship:</span>
                  <span className="value">
                    {patientData?.emergencyRelationship || 
                     patientData?.emergencyContact?.relationship ||
                     selectedPatient?.emergencyContact?.relationship ||
                     'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value">
                    {patientData?.emergencyAddress || 
                     patientData?.address ||
                     patientData?.emergencyContact?.address ||
                     selectedPatient?.address ||
                     selectedPatient?.emergencyContact?.address ||
                     'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(reportType === 'detailed' || reportType === 'summary') && (
          <>
            {/* Part 1: Student Medical History */}
            <div className="report-section">
              <h2 className="section-title">Part 1: Student Medical History</h2>
              
              {/* Family Medical History */}
              <div className="subsection">
                <h3>Family Medical History</h3>
                <div className="family-history-table">
                  <div className="table-header">
                    <div>Relation</div>
                    <div>Age</div>
                    <div>Status</div>
                    <div>Notes</div>
                  </div>
                  {patientData?.familyHistory && Object.entries(patientData.familyHistory).map(([relation, data]) => (
                    <div key={relation} className="table-row">
                      <div className="relation">{relation.charAt(0).toUpperCase() + relation.slice(1)}</div>
                      <div>{data.age || 'N/A'}</div>
                      <div className={`status ${data.aliveState ? data.aliveState.replace(' ', '-') : 'unknown'}`}>
                        {data.aliveState || 'Unknown'}
                      </div>
                      <div>{data.causeOfDeath || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="subsection">
                <h3>Medical Conditions & History</h3>
                <div className="conditions-grid">
                  {patientData?.medicalHistory && Object.entries(patientData.medicalHistory).map(([condition, data]) => (
                    <div key={condition} className="condition-card">
                      <div className="condition-header">
                        <span className="condition-name">{condition.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        <span 
                          className={`condition-status ${data.status}`}
                          style={{ backgroundColor: getStatusColor(data.status) }}
                        >
                          {data.status || 'N/A'}
                        </span>
                      </div>
                      {data.status === 'yes' && data.details && (
                        <div className="condition-details">
                          <p>{data.details}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vaccination History */}
              <div className="subsection">
                <h3>Vaccination History</h3>
                <div className="vaccination-grid">
                  {patientData?.vaccinations && Object.entries(patientData.vaccinations).map(([vaccine, date]) => (
                    <div key={vaccine} className="vaccination-item">
                      <div className="vaccine-name">{vaccine.toUpperCase()}</div>
                      <div className="vaccine-date">{formatDate(date)}</div>
                      <div className={`vaccine-status ${date ? 'completed' : 'pending'}`}>
                        {date ? '✅ Completed' : '❌ Not Given'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Part 2: Medical Officer Examination */}
            <div className="report-section">
              <h2 className="section-title">Part 2: Medical Officer Examination</h2>
              
              {/* Physical Measurements */}
              <div className="subsection">
                <h3>Physical Measurements</h3>
                <div className="measurements-grid">
                  <div className="measurement-card">
                    <div className="measurement-icon">⚖️</div>
                    <div className="measurement-value">{hospitalData?.weight || 'N/A'}</div>
                    <div className="measurement-label">Weight (kg)</div>
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">📏</div>
                    <div className="measurement-value">{hospitalData?.height || 'N/A'}</div>
                    <div className="measurement-label">Height (cm)</div>
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">💨</div>
                    <div className="measurement-value">
                      {hospitalData?.chestInspiration ? `${hospitalData.chestInspiration}/${hospitalData.chestExpiration}` : 'N/A'}
                    </div>
                    <div className="measurement-label">Chest (Insp/Exp)</div>
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">🩸</div>
                    <div className="measurement-value">{hospitalData?.bloodPressure || 'N/A'}</div>
                    <div className="measurement-label">Blood Pressure</div>
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">💓</div>
                    <div className="measurement-value">{hospitalData?.pulse || 'N/A'}</div>
                    <div className="measurement-label">Pulse</div>
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">🩸</div>
                    <div className="measurement-value">{hospitalData?.bloodGroup || 'N/A'}</div>
                    <div className="measurement-label">Blood Group</div>
                  </div>
                </div>
              </div>

              {/* System Examinations */}
              <div className="subsection">
                <h3>System Examinations</h3>
                <div className="systems-grid">
                  <div className="system-card">
                    <h4>🦷 Dental Health</h4>
                    <div className="system-findings">
                      <div className="finding">Decayed: {hospitalData?.teethDecayed ? '✅ Yes' : '❌ No'}</div>
                      <div className="finding">Missing: {hospitalData?.teethMissing ? '✅ Yes' : '❌ No'}</div>
                      <div className="finding">Dentures: {hospitalData?.teethDentures ? '✅ Yes' : '❌ No'}</div>
                      <div className="finding">Gingivitis: {hospitalData?.teethGingivitis ? '✅ Yes' : '❌ No'}</div>
                    </div>
                  </div>

                  <div className="system-card">
                    <h4>👂 Hearing & Speech</h4>
                    <div className="system-findings">
                      <div className="finding">Right Ear: {hospitalData?.hearingRight || 'N/A'}</div>
                      <div className="finding">Left Ear: {hospitalData?.hearingLeft || 'N/A'}</div>
                      <div className="finding">Speech: {hospitalData?.speech || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="system-card">
                    <h4>❤️ Cardiovascular</h4>
                    <div className="system-findings">
                      <div className="finding">Heart Disease History: {hospitalData?.heartDisease || 'N/A'}</div>
                      <div className="finding">Heart Sound: {hospitalData?.heartSound || 'N/A'}</div>
                      <div className="finding">Murmurs: {hospitalData?.murmurs || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="system-card">
                    <h4>🫁 Respiratory</h4>
                    <div className="system-findings">
                      <div className="finding">TB History: {hospitalData?.tuberculosis || 'N/A'}</div>
                      <div className="finding">TB Test: {hospitalData?.tuberculosisTest || 'N/A'}</div>
                      <div className="finding">X-ray Chest: {hospitalData?.xrayChest || 'N/A'}</div>
                      <div className="finding">X-ray Findings: {hospitalData?.xrayFindings || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="system-card">
                    <h4>👁️ Vision</h4>
                    <div className="system-findings">
                      <div className="finding">Right Eye (w/o glasses): {hospitalData?.visionRightWithout || 'N/A'}</div>
                      <div className="finding">Left Eye (w/o glasses): {hospitalData?.visionLeftWithout || 'N/A'}</div>
                      <div className="finding">Right Eye (w/ glasses): {hospitalData?.visionRightWith || 'N/A'}</div>
                      <div className="finding">Left Eye (w/ glasses): {hospitalData?.visionLeftWith || 'N/A'}</div>
                      <div className="finding">Color Vision: {hospitalData?.colorVisionNormal ? 'Normal' : 'Impaired'}</div>
                    </div>
                  </div>

                  <div className="system-card">
                    <h4>🧠 Nervous System</h4>
                    <div className="system-findings">
                      <div className="finding">Convulsions: {hospitalData?.convulsion || 'N/A'}</div>
                      <div className="finding">Knee Jerks: {hospitalData?.kneeJerks || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Tests */}
              <div className="subsection">
                <h3>Clinical Test Results</h3>
                <div className="clinical-tests">
                  <div className="test-result">
                    <span className="test-name">Hemoglobin:</span>
                    <span className="test-value">{hospitalData?.hemoglobin ? `${hospitalData.hemoglobin} g/dL` : 'N/A'}</span>
                  </div>
                  <div className="test-result">
                    <span className="test-name">Blood Group & Rh:</span>
                    <span className="test-value">{hospitalData?.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="test-result">
                    <span className="test-name">Vaccination Status:</span>
                    <span className="test-value">{hospitalData?.vaccinated === 'yes' ? '✅ Vaccinated' : '❌ Not Vaccinated'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Assessment */}
            <div className="report-section">
              <h2 className="section-title">Medical Assessment & Recommendations</h2>
              
              <div className="assessment-grid">
                <div className="assessment-card">
                  <h3>Specialist Referral</h3>
                  <div className={`referral-status ${hospitalData?.specialistReferral}`}>
                    {hospitalData?.specialistReferral === 'yes' ? '⚠️ Required' : '✅ Not Required'}
                  </div>
                  {hospitalData?.specialistReferral === 'yes' && hospitalData?.medicalCondition && (
                    <div className="condition-note">
                      <strong>Condition:</strong> {hospitalData.medicalCondition}
                    </div>
                  )}
                </div>

                <div className="assessment-card">
                  <h3>Fitness Assessment</h3>
                  <div className={`fitness-status ${hospitalData?.fitForStudies}`}>
                    {hospitalData?.fitForStudies === 'fit' ? '✅ Fit for Studies' : 
                     hospitalData?.fitForStudies === 'not-fit' ? '❌ Not Fit for Studies' : 'Assessment Pending'}
                  </div>
                  {hospitalData?.reason && (
                    <div className="reason-note">
                      <strong>Reason:</strong> {hospitalData.reason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Medical Officer Signatures */}
        {hospitalData && (
          <div className="report-section signatures">
            <h2 className="section-title">Medical Officer Verification</h2>
            <div className="signatures-grid">
              <div className="signature-box">
                <div className="signature-label">Medical Officer</div>
                {hospitalData.medicalOfficerSignature ? (
                  <img src={hospitalData.medicalOfficerSignature} alt="Medical Officer Signature" className="signature-image" />
                ) : (
                  <div className="signature-placeholder">Signature not available</div>
                )}
                <div className="signature-date">Date: {formatDate(hospitalData.date1)}</div>
              </div>
              
              <div className="signature-box">
                <div className="signature-label">ITUM Medical Officer</div>
                {hospitalData.itumMedicalOfficerSignature ? (
                  <img src={hospitalData.itumMedicalOfficerSignature} alt="ITUM Medical Officer Signature" className="signature-image" />
                ) : (
                  <div className="signature-placeholder">Signature not available</div>
                )}
                <div className="signature-date">Date: {formatDate(hospitalData.date2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Report Footer */}
        <div className="report-footer">
          <div className="footer-info">
            <p><strong>Report generated on:</strong> {formatDate(new Date().toISOString())}</p>
            <p><strong>Generated by:</strong> SmartMed Healthcare System</p>
            <p><strong>This report is confidential and for medical use only</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorReport;