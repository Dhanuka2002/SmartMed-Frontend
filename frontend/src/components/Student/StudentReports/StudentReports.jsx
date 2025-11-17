/**
 * StudentReports Component
 * 
 * Comprehensive medical report dashboard for students displaying:
 * - Personal information and profile
 * - Health statistics (allergies, age, gender, vaccinations)
 * - Vaccination timeline and history
 * - Medical conditions overview
 * - Hospital staff examination results (Part 2)
 * - Emergency contact information
 * - Health metrics with visual progress indicators
 * 
 * Data Sources:
 * - Student Details Form (Part 1): Personal info, medical history, vaccinations
 * - Hospital Examination Form (Part 2): Clinical measurements, assessments
 * - localStorage: User-specific data storage
 * 
 * @component
 */

import React, { useState, useEffect } from "react";
import "./StudentReports.css";
import qrCode from "../../../assets/qr.png"; // Static QR code image
import studentAvatar from "../../../assets/student.jpg"; // Default avatar fallback
import Avatar from "../../common/Avatar/Avatar"; // Reusable avatar component

function StudentReports() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /** 
   * Detailed student medical data from student details form (Part 1)
   * Includes: personal info, medical history, vaccinations, emergency contacts
   */
  const [studentData, setStudentData] = useState(null);
  
  /** 
   * Current logged-in user information
   * Contains: name, email, role from localStorage
   */
  const [currentUser, setCurrentUser] = useState(null);
  
  /** 
   * Student form data specifically for profile image
   * May differ from studentData due to storage migration
   */
  const [studentFormData, setStudentFormData] = useState(null);
  
  /** 
   * Hospital examination data from medical staff (Part 2)
   * Includes: physical measurements, clinical tests, system examinations
   */
  const [hospitalData, setHospitalData] = useState(null);

  // ============================================================================
  // DATA LOADING & INITIALIZATION
  // ============================================================================
  
  /**
   * Effect hook to load all student data from localStorage on component mount
   * 
   * Loading sequence:
   * 1. Current user authentication data
   * 2. User-specific student details (Part 1)
   * 3. General student form data (for profile image fallback)
   * 4. User-specific hospital examination data (Part 2)
   */
  useEffect(() => {
    // Get current user data from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Get detailed student data if available
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.email) {
      const detailedData = localStorage.getItem(`studentData_${user.email}`);
      if (detailedData) {
        setStudentData(JSON.parse(detailedData));
      }
    }
    
    // Get student form data for profile image
    const formData = localStorage.getItem('studentFormData');
    if (formData) {
      setStudentFormData(JSON.parse(formData));
    }

    // Get hospital data (Part 2 from Hospital Staff form)
    if (user.email) {
      const hospitalFormData = localStorage.getItem(`hospitalData_${user.email}`);
      if (hospitalFormData) {
        setHospitalData(JSON.parse(hospitalFormData));
      }
    }
  }, []);

  // ============================================================================
  // DATA EXTRACTION & PROCESSING FUNCTIONS
  // ============================================================================
  
  /**
   * Extracts and merges allergy information from multiple sources
   * 
   * Data sources:
   * 1. Student medical history (Part 1) - allergicHistory.details (comma-separated)
   * 2. Hospital staff form (Part 2) - allergies object + allergyDetails text
   * 
   * Handles:
   * - String to array conversion
   * - JSON parsing for hospital allergies object
   * - Category extraction (boolean flags)
   * - Detail text parsing
   * - Duplicate removal using Set
   * 
   * @returns {string[]} Array of unique allergy names
   */
  const getAllergies = () => {
    try {
      const allergies = [];
      
      // Get allergies from student medical history (original source)
      if (studentData?.medicalHistory?.allergicHistory) {
        const allergicHistory = studentData.medicalHistory.allergicHistory;
        if (allergicHistory.status === "yes" && allergicHistory.details) {
          // Ensure details is a string before splitting
          const details = String(allergicHistory.details);
          const studentAllergies = details.split(',').map(item => item.trim()).filter(item => item.length > 0);
          allergies.push(...studentAllergies);
        }
      }
      
      // Get allergies from hospital staff form data
      if (hospitalData && hospitalData.hasAllergies === 'yes') {
        // Handle allergies object (might be JSON string or object)
        let hospitalAllergies = {};
        if (typeof hospitalData.allergies === 'string') {
          try {
            hospitalAllergies = JSON.parse(hospitalData.allergies);
          } catch (e) {
            console.warn('Error parsing hospital allergies JSON:', e);
            hospitalAllergies = {};
          }
        } else if (typeof hospitalData.allergies === 'object' && hospitalData.allergies !== null) {
          hospitalAllergies = hospitalData.allergies;
        }
        
        // Extract selected allergy categories
        Object.keys(hospitalAllergies).forEach(category => {
          if (hospitalAllergies[category] === true) {
            allergies.push(category);
          }
        });
        
        // Add allergy details if available
        if (hospitalData.allergyDetails && hospitalData.allergyDetails.trim()) {
          const detailAllergies = hospitalData.allergyDetails.split(',').map(item => item.trim()).filter(item => item.length > 0);
          allergies.push(...detailAllergies);
        }
      }
      
      // Remove duplicates and return
      return [...new Set(allergies)];
    } catch (error) {
      console.error('Error getting allergies:', error);
      return [];
    }
  };

  /**
   * Extracts and formats vaccination data from student records
   * 
   * Handles two data formats:
   * 1. String format: Direct date string
   * 2. Object format: {taken: boolean, date: string}
   * 
   * Process:
   * - Iterates through vaccinations object
   * - Normalizes date formats
   * - Determines status (Complete/Pending)
   * - Sorts by date (newest first)
   * 
   * @returns {Array<{name: string, date: string, status: string}>} Sorted vaccination records
   */
  const getVaccinations = () => {
    try {
      if (!studentData?.vaccinations) return [];
      
      const vaccinations = [];
      Object.entries(studentData.vaccinations).forEach(([vaccine, dateValue]) => {
        if (dateValue) {
          // Handle both string dates and object dates {taken, date}
          let actualDate = dateValue;
          let status = "Complete";
          
          if (typeof dateValue === 'object' && dateValue !== null) {
            // If dateValue is an object with taken and date properties
            if (dateValue.date) {
              actualDate = dateValue.date;
            } else if (dateValue.taken) {
              actualDate = dateValue.taken;
            } else {
              // If it's an object but doesn't have expected properties
              actualDate = "Date not available";
            }
            
            // Determine status based on taken property
            status = dateValue.taken ? "Complete" : "Pending";
          }
          
          vaccinations.push({
            name: vaccine.toUpperCase(),
            date: String(actualDate), // Ensure it's always a string
            status: status
          });
        }
      });
      
      return vaccinations.sort((a, b) => {
        try {
          return new Date(b.date) - new Date(a.date);
        } catch (error) {
          return 0; // If date parsing fails, maintain order
        }
      });
    } catch (error) {
      console.error('Error getting vaccinations:', error);
      return [];
    }
  };

  /**
   * Calculates current age from date of birth
   * 
   * Logic:
   * - Calculates year difference
   * - Adjusts for birthday not yet occurred this year
   * - Handles month and day comparison for accuracy
   * 
   * @param {string} dob - Date of birth in ISO format (YYYY-MM-DD)
   * @returns {number|null} Age in years, or null if dob invalid
   */
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Extracts medical conditions from student medical history
   * 
   * Process:
   * - Iterates through medicalHistory object
   * - Filters conditions where status === "yes"
   * - Formats condition names (camelCase to Title Case)
   * - Collects details for each condition
   * 
   * @returns {{total: number, conditions: Array<{name: string, details: string}>}} 
   *          Total count and array of active medical conditions
   */
  const getMedicalConditionsData = () => {
    if (!studentData?.medicalHistory) return { total: 0, conditions: [] };
    
    const conditions = [];
    let totalConditions = 0;
    
    Object.entries(studentData.medicalHistory).forEach(([key, value]) => {
      if (value.status === "yes") {
        totalConditions++;
        conditions.push({
          name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          details: value.details || 'No details provided'
        });
      }
    });
    
    return { total: totalConditions, conditions };
  };

  // ============================================================================
  // COMPUTED VALUES (MEMOIZED)
  // ============================================================================
  
  /**
   * Memoized allergies array
   * Recalculates only when studentData or hospitalData changes
   * Improves performance by avoiding unnecessary getAllergies() calls
   */
  const allergies = React.useMemo(() => {
    return getAllergies() || [];
  }, [studentData, hospitalData]);
  
  /** Vaccination records array - computed on every render */
  const vaccinations = getVaccinations() || [];
  
  /** Medical conditions summary - computed on every render */
  const medicalConditions = getMedicalConditionsData() || { total: 0, conditions: [] };

  // ============================================================================
  // JSX RENDER
  // ============================================================================
  
  return (
    <div className="student-reports">
      {/* ===== AUTHENTICATION CHECK ===== */}
      {/* Show login prompt if user not authenticated */}
      {!currentUser ? (
        <div className="no-user-notice">
          <h2>Please log in to view your medical reports</h2>
          <a href="/login" className="login-btn">Login</a>
        </div>
      ) : (
        <>
          {/* ===== MAIN PROFILE CARD ===== */}
          {/* Displays student profile, stats, health overview, and vaccination timeline */}
          <div className="profile-card">
            
            {/* ===== PROFILE HEADER ===== */}
            {/* Avatar, name, student ID, division, and QR code section */}
            <div className="profile-header">
              <div className="profile-info">
                <div className="profile-avatar-wrapper">
                  <Avatar 
                    src={studentFormData?.profileImage || studentData?.profileImage}
                    alt={studentData?.fullName || currentUser?.name || 'Student'}
                    size="large"
                    className="student-avatar"
                  />
                  <div className="avatar-status"></div>
                </div>
                <div className="student-details">
                  <h2 className="student-name">
                    {studentData?.fullName || currentUser?.name || 'Student Name'}
                  </h2>
                  <p className="student-id">
                    Student ID: {studentData?.studentRegistrationNumber || 'Not provided'}
                  </p>
                  <p className="student-division">
                    {studentData?.academicDivision ? 
                      studentData.academicDivision.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                      'Academic Division'
                    }
                  </p>
                </div>
              </div>
              <div className="qr-section">
                <div className="qr-container">
                  <img src={qrCode} alt="QR Code" className="qr-code" />
                </div>
                <p className="qr-label">Scan for details</p>
              </div>
            </div>

        {/* ===== STATS GRID ===== */}
        {/* Four-card grid showing key health metrics: allergies, age, gender, vaccinations */}
        <div className="stats-grid">
          <div className="stat-card allergies-count">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <span className="stat-label">Known Allergies</span>
              <span className="stat-value">{allergies ? allergies.length : 0}</span>
            </div>
          </div>
          <div className="stat-card age">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <span className="stat-label">Age</span>
              <span className="stat-value">
                {studentData?.age || (studentData?.dateOfBirth ? calculateAge(studentData.dateOfBirth) : 'Not provided')} 
                {(studentData?.age || calculateAge(studentData?.dateOfBirth)) && ' years'}
              </span>
            </div>
          </div>
          <div className="stat-card gender">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <span className="stat-label">Gender</span>
              <span className="stat-value">
                {studentData?.gender ? 
                  studentData.gender.charAt(0).toUpperCase() + studentData.gender.slice(1) : 
                  'Not provided'
                }
              </span>
            </div>
          </div>
          <div className="stat-card vaccinations-count">
            <div className="stat-icon">💉</div>
            <div className="stat-content">
              <span className="stat-label">Vaccinations</span>
              <span className="stat-value">{vaccinations.length}</span>
            </div>
          </div>
        </div>

        {/* ===== HEALTH OVERVIEW CHARTS ===== */}
        {/* Circular progress indicators for vaccination coverage, allergies count, medical conditions */}
        <div className="health-charts">
          <div className="chart-card">
            <h3 className="chart-title">Health Overview</h3>
            <div className="chart-content">
              <div className="health-summary">
                <div className="health-metric">
                  <div className="metric-circle">
                    <div className="circle-progress" style={{
                      background: `conic-gradient(#4CAF50 ${((vaccinations.length / 6) * 360)}deg, #e0e0e0 0deg)`
                    }}>
                      <span className="metric-value">{Math.round((vaccinations.length / 6) * 100)}%</span>
                    </div>
                    <span className="metric-label">Vaccination Coverage</span>
                  </div>
                </div>
                <div className="health-metric">
                  <div className="metric-circle">
                    <div className="circle-progress" style={{
                      background: `conic-gradient(${(allergies && allergies.length > 0) ? '#FF9800' : '#4CAF50'} ${(allergies && allergies.length > 3) ? 270 : (allergies ? allergies.length * 90 : 0)}deg, #e0e0e0 0deg)`
                    }}>
                      <span className="metric-value">{allergies ? allergies.length : 0}</span>
                    </div>
                    <span className="metric-label">Allergies</span>
                  </div>
                </div>
                <div className="health-metric">
                  <div className="metric-circle">
                    <div className="circle-progress" style={{
                      background: `conic-gradient(${medicalConditions.total > 0 ? '#F44336' : '#4CAF50'} ${medicalConditions.total * 60}deg, #e0e0e0 0deg)`
                    }}>
                      <span className="metric-value">{medicalConditions.total}</span>
                    </div>
                    <span className="metric-label">Medical Conditions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== VACCINATION TIMELINE ===== */}
        {/* Timeline visualization of all vaccinations with dates (conditionally rendered) */}
        {vaccinations.length > 0 && (
          <div className="timeline-chart">
            <h3 className="chart-title">Vaccination Timeline</h3>
            <div className="timeline-content">
              {vaccinations.map((vaccination, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content-item">
                    <div className="timeline-header">
                      <span className="vaccine-name">{vaccination.name || 'Unknown Vaccine'}</span>
                      <span className="vaccine-date">{typeof vaccination.date === 'string' ? vaccination.date : 'Date not available'}</span>
                    </div>
                    <div className="timeline-bar">
                      <div className="bar-fill" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

      {/* ===== HOSPITAL STAFF EXAMINATION RESULTS (PART 2) ===== */}
      {/* Comprehensive medical examination data from hospital staff - conditionally rendered */}
      {hospitalData && (
        <div className="hospital-examination-section">
          <div className="section-header">
            <h2 className="section-title">Hospital Staff Medical Examination</h2>
            <span className="section-subtitle">Part 2 - Medical Officer Assessment</span>
          </div>

          {/* ===== Physical Measurements Subsection ===== */}
          {/* Grid of 4 cards: Weight, Height, Blood Pressure, Pulse */}
          <div className="measurements-overview">
            <h3 className="subsection-title">Physical Measurements</h3>
            <div className="measurements-grid">
              <div className="measurement-card">
                <div className="measurement-icon">⚖️</div>
                <div className="measurement-value">{hospitalData.weight || 'N/A'}</div>
                <div className="measurement-label">Weight (kg)</div>
              </div>
              <div className="measurement-card">
                <div className="measurement-icon">📏</div>
                <div className="measurement-value">{hospitalData.height || 'N/A'}</div>
                <div className="measurement-label">Height (cm)</div>
              </div>
              <div className="measurement-card">
                <div className="measurement-icon">🩸</div>
                <div className="measurement-value">{hospitalData.bloodPressure || 'N/A'}</div>
                <div className="measurement-label">Blood Pressure</div>
              </div>
              <div className="measurement-card">
                <div className="measurement-icon">💓</div>
                <div className="measurement-value">{hospitalData.pulse || 'N/A'}</div>
                <div className="measurement-label">Pulse</div>
              </div>
            </div>
          </div>

          {/* ===== Clinical Test Results Subsection ===== */}
          {/* Blood Group, Hemoglobin, Vaccination Status */}
          <div className="clinical-results">
            <h3 className="subsection-title">Clinical Test Results</h3>
            <div className="clinical-grid">
              <div className="clinical-card">
                <div className="clinical-icon">🩸</div>
                <div className="clinical-content">
                  <span className="clinical-label">Blood Group</span>
                  <span className="clinical-value">{hospitalData.bloodGroup || 'N/A'}</span>
                </div>
              </div>
              <div className="clinical-card">
                <div className="clinical-icon">🩸</div>
                <div className="clinical-content">
                  <span className="clinical-label">Hemoglobin</span>
                  <span className="clinical-value">{hospitalData.hemoglobin ? `${hospitalData.hemoglobin} g/dL` : 'N/A'}</span>
                </div>
              </div>
              <div className="clinical-card">
                <div className="clinical-icon">💉</div>
                <div className="clinical-content">
                  <span className="clinical-label">Vaccination Status</span>
                  <span className="clinical-value">{hospitalData.vaccinated === 'yes' ? '✅ Vaccinated' : hospitalData.vaccinated === 'no' ? '❌ Not Vaccinated' : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Medical Assessment Subsection ===== */}
          {/* Fitness for Studies evaluation and Specialist Referral status */}
          <div className="medical-assessment">
            <h3 className="subsection-title">Medical Assessment</h3>
            <div className="assessment-grid">
              <div className="assessment-card">
                <div className="assessment-header">
                  <span className="assessment-label">Fitness for Studies</span>
                </div>
                <div className={`assessment-status ${hospitalData.fitForStudies === 'fit' ? 'fit' : hospitalData.fitForStudies === 'not-fit' ? 'not-fit' : 'pending'}`}>
                  {hospitalData.fitForStudies === 'fit' ? '✅ Fit for Studies' : 
                   hospitalData.fitForStudies === 'not-fit' ? '❌ Not Fit for Studies' : 'Assessment Pending'}
                </div>
                {hospitalData.reason && (
                  <div className="assessment-reason">
                    <strong>Reason:</strong> {hospitalData.reason}
                  </div>
                )}
              </div>
              <div className="assessment-card">
                <div className="assessment-header">
                  <span className="assessment-label">Specialist Referral</span>
                </div>
                <div className={`assessment-status ${hospitalData.specialistReferral === 'yes' ? 'required' : hospitalData.specialistReferral === 'no' ? 'not-required' : 'pending'}`}>
                  {hospitalData.specialistReferral === 'yes' ? '⚠️ Required' : 
                   hospitalData.specialistReferral === 'no' ? '✅ Not Required' : 'Assessment Pending'}
                </div>
                {hospitalData.specialistReferral === 'yes' && hospitalData.medicalCondition && (
                  <div className="assessment-reason">
                    <strong>Condition:</strong> {hospitalData.medicalCondition}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== System Examinations Subsection ===== */}
          {/* Detailed findings for: Dental, Hearing & Speech, Vision, Cardiovascular */}
          <div className="system-examinations">
            <h3 className="subsection-title">System Examinations</h3>
            <div className="systems-grid">
              
              {/* Dental Health Card: Decayed, Missing, Gingivitis status */}
              <div className="system-card">
                <div className="system-header">
                  <span className="system-icon">🦷</span>
                  <span className="system-title">Dental Health</span>
                </div>
                <div className="system-findings">
                  <div className="finding-item">
                    <span className="finding-label">Decayed:</span>
                    <span className={`finding-value ${hospitalData.teethDecayed ? 'positive' : 'negative'}`}>
                      {hospitalData.teethDecayed ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Missing:</span>
                    <span className={`finding-value ${hospitalData.teethMissing ? 'positive' : 'negative'}`}>
                      {hospitalData.teethMissing ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Gingivitis:</span>
                    <span className={`finding-value ${hospitalData.teethGingivitis ? 'positive' : 'negative'}`}>
                      {hospitalData.teethGingivitis ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hearing & Speech Card: Right ear, Left ear, Speech assessment */}
              <div className="system-card">
                <div className="system-header">
                  <span className="system-icon">👂</span>
                  <span className="system-title">Hearing & Speech</span>
                </div>
                <div className="system-findings">
                  <div className="finding-item">
                    <span className="finding-label">Right Ear:</span>
                    <span className="finding-value">{hospitalData.hearingRight || 'N/A'}</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Left Ear:</span>
                    <span className="finding-value">{hospitalData.hearingLeft || 'N/A'}</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Speech:</span>
                    <span className="finding-value">{hospitalData.speech || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Vision Card: Right/Left eye vision without glasses, Color vision */}
              <div className="system-card">
                <div className="system-header">
                  <span className="system-icon">👁️</span>
                  <span className="system-title">Vision</span>
                </div>
                <div className="system-findings">
                  <div className="finding-item">
                    <span className="finding-label">Right Eye (w/o glasses):</span>
                    <span className="finding-value">{hospitalData.visionRightWithout || 'N/A'}</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Left Eye (w/o glasses):</span>
                    <span className="finding-value">{hospitalData.visionLeftWithout || 'N/A'}</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Color Vision:</span>
                    <span className={`finding-value ${hospitalData.colorVisionNormal ? 'normal' : 'abnormal'}`}>
                      {hospitalData.colorVisionNormal ? 'Normal' : 'Impaired'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cardiovascular Card: Heart disease history, Heart sound, Murmurs */}
              <div className="system-card">
                <div className="system-header">
                  <span className="system-icon">❤️</span>
                  <span className="system-title">Cardiovascular</span>
                </div>
                <div className="system-findings">
                  <div className="finding-item">
                    <span className="finding-label">Heart Disease History:</span>
                    <span className="finding-value">{hospitalData.heartDisease || 'N/A'}</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Heart Sound:</span>
                    <span className="finding-value">{hospitalData.heartSound || 'N/A'}</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Murmurs:</span>
                    <span className="finding-value">{hospitalData.murmurs || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MEDICAL INFORMATION GRID ===== */}
      {/* Two-card layout: Allergies Card (left) and Vaccination Card (right) */}
      <div className="medical-grid">
        
        {/* ===== Allergies Card ===== */}
        {/* Lists all known allergies from both student and hospital forms */}
        <div className="medical-card allergies-card">
          <div className="card-header">
            <div className="card-icon allergies-icon">⚠️</div>
            <h3 className="card-title">Known Allergies</h3>
          </div>
          <div className="card-content">
            {allergies && allergies.length > 0 ? (
              <div>
                <div className="allergies-list">
                  {allergies.map((allergy, index) => (
                    <div key={index} className="allergy-item">
                      <span className="allergy-dot"></span>
                      <span className="allergy-name">{allergy || 'Unknown allergy'}</span>
                    </div>
                  ))}
                </div>
                
                {/* Show hospital staff allergy details if available */}
                {hospitalData && hospitalData.hasAllergies === 'yes' && hospitalData.allergyDetails && (
                  <div className="allergy-details-section">
                    <h4 className="allergy-details-title">Medical Staff Assessment:</h4>
                    <p className="allergy-details-text">{hospitalData.allergyDetails}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-data">No known allergies</p>
            )}
          </div>
        </div>

        {/* ===== Vaccination Card ===== */}
        {/* Table format showing vaccination name, date, and status */}
        <div className="medical-card vaccination-card">
          <div className="card-header">
            <div className="card-icon vaccination-icon">💉</div>
            <h3 className="card-title">Vaccination History</h3>
          </div>
          <div className="card-content">
            <div className="vaccination-table">
              <div className="table-header">
                <span>Vaccination</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              {vaccinations.map((vaccination, index) => (
                <div key={index} className="table-row">
                  <span className="vaccination-name">{vaccination.name || 'Unknown Vaccine'}</span>
                  <span className="vaccination-date">{typeof vaccination.date === 'string' ? vaccination.date : 'Date not available'}</span>
                  <span className={`vaccination-status status-${(vaccination.status || 'unknown').toLowerCase()}`}>
                    {vaccination.status || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== EMERGENCY CONTACT CARD ===== */}
      {/* Displays emergency contact person details from student form */}
      <div className="emergency-card">
        <div className="card-header">
          <div className="card-icon emergency-icon">🚨</div>
          <h3 className="card-title">Emergency Contact</h3>
        </div>
        <div className="emergency-content">
          {studentData ? (
            <>
              <div className="emergency-info">
                <span className="emergency-label">Primary Contact:</span>
                <span className="emergency-value">
                  {studentData.emergencyName || 'Not provided'}
                </span>
              </div>
              <div className="emergency-info">
                <span className="emergency-label">Phone:</span>
                <span className="emergency-value">
                  {studentData.emergencyTelephone || 'Not provided'}
                </span>
              </div>
              <div className="emergency-info">
                <span className="emergency-label">Relationship:</span>
                <span className="emergency-value">
                  {studentData.emergencyRelationship ? 
                    studentData.emergencyRelationship.charAt(0).toUpperCase() + studentData.emergencyRelationship.slice(1) : 
                    'Not provided'
                  }
                </span>
              </div>
              <div className="emergency-info">
                <span className="emergency-label">Address:</span>
                <span className="emergency-value">
                  {studentData.emergencyAddress || 'Not provided'}
                </span>
              </div>
            </>
          ) : (
            <div className="no-emergency-data">
              <p>Complete your medical profile to view emergency contact information.</p>
              <a href="/student/entering-details" className="complete-profile-btn">
                Complete Profile
              </a>
            </div>
          )}
        </div>
      </div>


      {/* ===== INCOMPLETE PROFILE NOTICE ===== */}
      {/* Prompt to complete medical profile if studentData is missing */}
      {!studentData && (
        <div className="incomplete-profile-notice">
          <h3>Complete Your Medical Profile</h3>
          <p>To see detailed medical reports and charts, please complete your medical profile.</p>
          <a href="/student/entering-details" className="complete-profile-btn">
            Complete Medical Profile
          </a>
        </div>
      )}
    </>
  )}
    </div>
  );
}

export default StudentReports;