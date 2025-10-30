import React, { useState, useRef } from "react";
import "./StudentEnteringDetails.css";
import Avatar from "../../common/Avatar/Avatar";
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';
import { autoGenerateQRIfReady } from '../../../services/medicalRecordService';

function StudentEnteringDetails() {
  // Get current user data and auto-populate
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const { alertState, showSuccess, showError, hideAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    // Basic Information - auto-populate from registration
    firstName: currentUser.name ? currentUser.name.split(' ')[0] : "",
    lastName: currentUser.name ? currentUser.name.split(' ').slice(1).join(' ') : "",
    fullName: currentUser.name || "",
    nic: "",
    studentRegistrationNumber: "",
    academicDivision: "",
    email: currentUser.email || "",
    profileImage: null,
    
    // Personal Details
    dateOfBirth: "",
    positionOfFamily: "",
    gender: "",
    lastAttendSchool: "",
    religion: "",
    occupationOfFather: "",
    singleMarried: "",
    occupationOfMother: "",
    age: "",
    homeAddress: "",
    nationality: "",
    telephoneNumber: "",
    extraCurricularActivities: "",
    
    // Emergency Contact
    emergencyName: "",
    emergencyTelephone: "",
    emergencyAddress: "",
    emergencyRelationship: "",
    
    // Family Medical History
    familyHistory: {
      father: { age: "", aliveState: "", deadAge: "", causeOfDeath: "" },
      mother: { age: "", aliveState: "", deadAge: "", causeOfDeath: "" },
      brothers: { age: "", aliveState: "", deadAge: "", causeOfDeath: "" },
      sisters: { age: "", aliveState: "", deadAge: "", causeOfDeath: "" },
      others: { age: "", aliveState: "", deadAge: "", causeOfDeath: "" }
    },
    
    // Medical History
    medicalHistory: {
      infectiousDiseases: { status: "", details: "" },
      wormInfestations: { status: "", details: "" },
      respiratory: { status: "", details: "" },
      circulatory: { status: "", details: "" },
      ent: { status: "", details: "" },
      eye: { status: "", details: "" },
      nervousSystem: { status: "", details: "" },
      surgical: { status: "", details: "" },
      misc: { status: "", details: "" },
      allergicHistory: { status: "", details: "" },
      menstrualHistory: { status: "", details: "" },
      disability: { status: "", details: "" }
    },
    
    // Vaccinations
    vaccinations: {
      bcg: { taken: "", date: "" },
      dpt: { taken: "", date: "" },
      mramur: { taken: "", date: "" },
      rubella: { taken: "", date: "" },
      hepatitisB: { taken: "", date: "" },
      chickenPox: { taken: "", date: "" }
    },

    // Certification
    certificationDate: "",
    signature: ""
  });

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Input restriction functions
  const handleNameKeyPress = (e) => {
    // Prevent numbers from being entered
    if (/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleTelephoneKeyPress = (e) => {
    // Allow only numbers, +, -, (, ), and space
    if (!/[0-9+\-() ]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      e.preventDefault();
    }
  };

  // NIC validation function
  const validateNIC = (nic) => {
    if (!nic) return { isValid: false, message: "NIC is required" };

    // Remove spaces and convert to uppercase
    const cleanNIC = nic.replace(/\s/g, '').toUpperCase();

    // Old format: 9 digits + V (e.g., 123456789V)
    const oldFormatRegex = /^[0-9]{9}[VX]$/;

    // New format: 12 digits (e.g., 200012345678)
    const newFormatRegex = /^[0-9]{12}$/;

    if (oldFormatRegex.test(cleanNIC)) {
      // Validate old format
      const year = parseInt(cleanNIC.substring(0, 2));
      const dayOfYear = parseInt(cleanNIC.substring(2, 5));

      // Check if day of year is valid (1-366 for male, 501-866 for female)
      if ((dayOfYear >= 1 && dayOfYear <= 366) || (dayOfYear >= 501 && dayOfYear <= 866)) {
        return { isValid: true, message: "" };
      } else {
        return { isValid: false, message: "Invalid day of year in NIC" };
      }
    } else if (newFormatRegex.test(cleanNIC)) {
      // Validate new format
      const year = parseInt(cleanNIC.substring(0, 4));
      const dayOfYear = parseInt(cleanNIC.substring(4, 7));

      // Check if year is reasonable (1900-2050)
      if (year < 1900 || year > 2050) {
        return { isValid: false, message: "Invalid birth year in NIC" };
      }

      // Check if day of year is valid (1-366 for male, 501-866 for female)
      if ((dayOfYear >= 1 && dayOfYear <= 366) || (dayOfYear >= 501 && dayOfYear <= 866)) {
        return { isValid: true, message: "" };
      } else {
        return { isValid: false, message: "Invalid day of year in NIC" };
      }
    } else {
      return {
        isValid: false,
        message: "Invalid NIC format. Use old format (123456789V) or new format (200012345678)"
      };
    }
  };

  // Student Registration Number validation function
  const validateStudentRegistrationNumber = (regNumber) => {
    if (!regNumber) return { isValid: false, message: "Student registration number is required" };

    // Remove spaces and convert to uppercase
    const cleanRegNumber = regNumber.replace(/\s/g, '').toUpperCase();

    // Format: 2 digits + 2 letters + 4 digits
    // Examples: 22IT0521, 21ME0423, 23EE0789
    const regNumberRegex = /^[0-9]{2}[A-Z]{2}[0-9]{4}$/;

    if (!regNumberRegex.test(cleanRegNumber)) {
      return {
        isValid: false,
        message: "Invalid format. Use format: 22IT0521 (2 digits + 2 letters + 4 digits)"
      };
    }

    // Extract parts for additional validation
    const year = parseInt(cleanRegNumber.substring(0, 2));
    const deptCode = cleanRegNumber.substring(2, 4);
    const studentNumber = parseInt(cleanRegNumber.substring(4, 8));

    // Validate year (reasonable range 20-30 for 2020-2030)
    if (year < 20 || year > 30) {
      return { isValid: false, message: "Invalid year. Year should be between 20-30 (2020-2030)" };
    }

    // Validate department codes based on academic divisions
    const validDeptCodes = [
      'CT', 'CE', 'EE', 'ET', 'IT', 'MT', 'ME', 'NS', 'PT', 'TC',
      'CH', 'CI', 'EL', 'IN', 'MA', 'MC', 'NA', 'PO', 'TX'
    ];

    if (!validDeptCodes.includes(deptCode)) {
      return {
        isValid: false,
        message: `Invalid department code "${deptCode}". Valid codes: CT, CE, EE, ET, IT, MT, ME, NS, PT, TC`
      };
    }

    // Validate student number (should be reasonable range)
    if (studentNumber < 1 || studentNumber > 9999) {
      return { isValid: false, message: "Invalid student number. Should be between 0001-9999" };
    }

    return { isValid: true, message: "" };
  };

  // Email validation function
  const validateEmail = (email) => {
    if (!email) return { isValid: false, message: "Email address is required" };

    // Remove spaces
    const cleanEmail = email.trim();

    // Basic email regex pattern
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(cleanEmail)) {
      return {
        isValid: false,
        message: "Please enter a valid email address (e.g., student@example.com)"
      };
    }

    // Check for minimum length
    if (cleanEmail.length < 5) {
      return { isValid: false, message: "Email address is too short" };
    }

    // Check for maximum length
    if (cleanEmail.length > 254) {
      return { isValid: false, message: "Email address is too long" };
    }

    // Check for valid domain structure
    const parts = cleanEmail.split('@');
    if (parts.length !== 2) {
      return { isValid: false, message: "Email must contain exactly one @ symbol" };
    }

    const [localPart, domain] = parts;

    // Validate local part (before @)
    if (localPart.length < 1 || localPart.length > 64) {
      return { isValid: false, message: "Email username part is invalid length" };
    }

    // Check for consecutive dots
    if (cleanEmail.includes('..')) {
      return { isValid: false, message: "Email cannot contain consecutive dots" };
    }

    // Check for leading/trailing dots in local part
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return { isValid: false, message: "Email username cannot start or end with a dot" };
    }

    // Validate domain part (after @)
    if (domain.length < 1 || domain.length > 253) {
      return { isValid: false, message: "Email domain part is invalid" };
    }

    // Check if domain has at least one dot
    if (!domain.includes('.')) {
      return { isValid: false, message: "Email domain must contain at least one dot" };
    }

    // Check for valid domain ending
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return { isValid: false, message: "Email domain ending is too short" };
    }

    return { isValid: true, message: "" };
  };

  // Validation function
  const validateForm = () => {
    const errors = {};

    // Basic Information - Mandatory fields
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    // NIC validation
    const nicValidation = validateNIC(formData.nic);
    if (!nicValidation.isValid) errors.nic = nicValidation.message;

    // Student Registration Number validation
    const regNumberValidation = validateStudentRegistrationNumber(formData.studentRegistrationNumber);
    if (!regNumberValidation.isValid) errors.studentRegistrationNumber = regNumberValidation.message;

    if (!formData.academicDivision) errors.academicDivision = "Academic division is required";

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) errors.email = emailValidation.message;

    if (!formData.profileImage) errors.profileImage = "Profile image is required";

    // Personal Details - Mandatory fields
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!formData.positionOfFamily) errors.positionOfFamily = "Position of family is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.lastAttendSchool.trim()) errors.lastAttendSchool = "Last attended school is required";
    if (!formData.religion) errors.religion = "Religion is required";
    if (!formData.occupationOfFather.trim()) errors.occupationOfFather = "Father's occupation is required";
    if (!formData.singleMarried) errors.singleMarried = "Marital status is required";
    if (!formData.occupationOfMother.trim()) errors.occupationOfMother = "Mother's occupation is required";
    if (!formData.age) errors.age = "Age is required";
    if (!formData.homeAddress.trim()) errors.homeAddress = "Home address is required";
    if (!formData.nationality) errors.nationality = "Nationality is required";
    if (!formData.telephoneNumber.trim()) errors.telephoneNumber = "Telephone number is required";
    if (!formData.extraCurricularActivities.trim()) errors.extraCurricularActivities = "Extra-curricular activities information is required";

    // Emergency Contact - Mandatory fields
    if (!formData.emergencyName.trim()) errors.emergencyName = "Emergency contact name is required";
    if (!formData.emergencyTelephone.trim()) errors.emergencyTelephone = "Emergency contact telephone is required";
    if (!formData.emergencyAddress.trim()) errors.emergencyAddress = "Emergency contact address is required";
    if (!formData.emergencyRelationship) errors.emergencyRelationship = "Emergency contact relationship is required";

    // Family Medical History - Optional fields (no validation required)

    // Medical History - Mandatory fields (all conditions must be answered)
    const medicalConditions = [
      "infectiousDiseases", "wormInfestations", "respiratory", "circulatory",
      "ent", "eye", "nervousSystem", "surgical", "misc", "allergicHistory",
      "menstrualHistory", "disability"
    ];
    medicalConditions.forEach(condition => {
      if (!formData.medicalHistory[condition].status) {
        errors[`medicalHistory_${condition}`] = `Please answer the question about ${condition.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
      // If status is "yes", details are required
      if (formData.medicalHistory[condition].status === "yes" && !formData.medicalHistory[condition].details.trim()) {
        errors[`medicalHistory_${condition}_details`] = `Please provide details for ${condition.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    });

    // Vaccinations - Mandatory fields (all must be answered)
    const vaccines = ["bcg", "dpt", "mramur", "rubella", "hepatitisB", "chickenPox"];
    vaccines.forEach(vaccine => {
      if (!formData.vaccinations[vaccine].taken) {
        errors[`vaccinations_${vaccine}`] = `Please indicate if you have taken ${vaccine.toUpperCase()} vaccination`;
      }
      // If taken is "yes", date is required
      if (formData.vaccinations[vaccine].taken === "yes" && !formData.vaccinations[vaccine].date) {
        errors[`vaccinations_${vaccine}_date`] = `Please provide date for ${vaccine.toUpperCase()} vaccination`;
      }
    });

    // Certification - Mandatory fields
    if (!formData.certificationDate) errors.certificationDate = "Certification date is required";
    if (!formData.signature.trim()) errors.signature = "Student signature/name is required";

    // Age validation
    if (formData.age && (formData.age < 16 || formData.age > 100)) {
      errors.age = "Please enter a valid age between 16 and 100";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to get error class
  const getErrorClass = (fieldName) => {
    return validationErrors[fieldName] ? 'error' : '';
  };

  // Helper function to render error message
  const renderError = (fieldName) => {
    return validationErrors[fieldName] ? (
      <span className="error-message">{validationErrors[fieldName]}</span>
    ) : null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };

    // Auto-update fullName when firstName or lastName changes
    if (name === 'firstName' || name === 'lastName') {
      const firstName = name === 'firstName' ? value : formData.firstName;
      const lastName = name === 'lastName' ? value : formData.lastName;
      updatedData.fullName = `${firstName} ${lastName}`.trim();
    }

    // Real-time NIC validation and formatting
    if (name === 'nic') {
      // Clean and format NIC input
      const cleanValue = value.replace(/[^0-9VXvx]/g, '').toUpperCase();
      updatedData.nic = cleanValue;

      const nicValidation = validateNIC(cleanValue);
      setValidationErrors(prev => ({
        ...prev,
        nic: nicValidation.isValid ? undefined : nicValidation.message
      }));
    }

    // Real-time Student Registration Number validation and formatting
    if (name === 'studentRegistrationNumber') {
      // Clean and format registration number input (allow only alphanumeric)
      const cleanValue = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
      updatedData.studentRegistrationNumber = cleanValue;

      const regNumberValidation = validateStudentRegistrationNumber(cleanValue);
      setValidationErrors(prev => ({
        ...prev,
        studentRegistrationNumber: regNumberValidation.isValid ? undefined : regNumberValidation.message
      }));
    }

    // Real-time Email validation
    if (name === 'email') {
      const emailValidation = validateEmail(value);
      setValidationErrors(prev => ({
        ...prev,
        email: emailValidation.isValid ? undefined : emailValidation.message
      }));
    }

    setFormData(updatedData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        setImagePreview(imageData);
        setFormData(prev => ({
          ...prev,
          profileImage: imageData
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFamilyHistoryChange = (member, field, value) => {
    setFormData(prev => ({
      ...prev,
      familyHistory: {
        ...prev.familyHistory,
        [member]: {
          ...prev.familyHistory[member],
          [field]: value
        }
      }
    }));
  };

  const handleMedicalHistoryChange = (condition, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [condition]: {
          ...prev.medicalHistory[condition],
          [field]: value
        }
      }
    }));
  };

  const handleVaccinationChange = (vaccine, field, value) => {
    setFormData(prev => ({
      ...prev,
      vaccinations: {
        ...prev.vaccinations,
        [vaccine]: {
          ...prev.vaccinations[vaccine],
          [field]: value,
          // Clear date if "No" is selected
          ...(field === 'taken' && value === 'no' ? { date: '' } : {})
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!validateForm()) {
      const errorCount = Object.keys(validationErrors).length;
      showError(`Please fix ${errorCount} error(s) in the form before submitting.`, 'Form Validation Error');
      setIsSubmitting(false);

      // Scroll to first error
      const firstErrorField = document.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/student-details/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        // Get current user to ensure data is saved under correct user
        const currentUserData = localStorage.getItem('currentUser');
        const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
        
        if (currentUser && currentUser.email) {
          // Save student data to localStorage with user-specific keys
          localStorage.setItem(`studentFormData_${currentUser.email}`, JSON.stringify(formData));
          localStorage.setItem(`studentData_${currentUser.email}`, JSON.stringify(formData));
          
          // Also save with form email for backward compatibility
          if (formData.email !== currentUser.email) {
            localStorage.setItem(`studentData_${formData.email}`, JSON.stringify(formData));
          }
          
          localStorage.setItem('studentName', formData.fullName);
          localStorage.setItem('studentEmail', formData.email || currentUser.email || 'No Email');
          
          // Clear any old general storage
          localStorage.removeItem('studentFormData');
        } else {
          // Fallback for older system
          localStorage.setItem('studentFormData', JSON.stringify(formData));
          localStorage.setItem(`studentData_${formData.email}`, JSON.stringify(formData));
        }
        
        showSuccess('Student details saved successfully!', 'Form Submitted');
        console.log('Saved with ID:', result.studentId);
        
        // Auto-generate QR code if both forms are complete
        const emailToCheck = currentUser?.email || formData.email;
        if (emailToCheck) {
          try {
            const qrResult = await autoGenerateQRIfReady(emailToCheck);
            if (qrResult.success && !qrResult.alreadyExists) {
              showSuccess('🎉 Both forms completed! Your medical QR code has been automatically generated. You can view it in the QR Code section.', 'QR Code Generated');
            }
          } catch (error) {
            console.error('Error auto-generating QR code:', error);
          }
        }
        
        // Trigger refresh event for dashboard
        window.dispatchEvent(new CustomEvent('studentDataUpdated'));
      } else {
        showError('Error: ' + result.message, 'Submission Error');
      }
    } catch (error) {
      console.error('Error saving student details:', error);
      showError('Failed to save student details. Please try again.', 'Save Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="entering-details-container">
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
      <div className="form-header">
        <div className="header-content">
          <h1>Student</h1>
          <h2>Medical Examination Report</h2>
          
        </div>
      </div>

      <form onSubmit={handleSubmit} className="medical-form">
        {/* Basic Information Section */}
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleInputChange}
                className={getErrorClass('firstName')}
                required
              />
              {renderError('firstName')}
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name *"
                value={formData.lastName}
                onChange={handleInputChange}
                className={getErrorClass('lastName')}
                required
              />
              {renderError('lastName')}
            </div>
            <div className="upload-section">
              <div className="upload-box">
                <Avatar 
                  src={imagePreview}
                  alt={formData.fullName || "Student"}
                  size="large"
                  showUploadIcon={!imagePreview}
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-avatar"
                />
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <div className="upload-text">
                  {imagePreview ? 'Click to change image' : 'Click to upload your image *'}
                </div>
                {renderError('profileImage')}
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="nic"
                placeholder="NIC * (e.g., 123456789V or 200012345678)"
                value={formData.nic}
                onChange={handleInputChange}
                className={getErrorClass('nic')}
                maxLength="12"
                style={{ textTransform: 'uppercase' }}
                required
              />
              {renderError('nic')}
              {formData.nic && !validationErrors.nic && (
                <span className="success-message">✓ Valid NIC format</span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="studentRegistrationNumber"
                placeholder="Student Registration Number * (e.g., 22IT0521, 21ME0423)"
                value={formData.studentRegistrationNumber}
                onChange={handleInputChange}
                className={getErrorClass('studentRegistrationNumber')}
                maxLength="8"
                style={{ textTransform: 'uppercase' }}
                required
              />
              {renderError('studentRegistrationNumber')}
              {formData.studentRegistrationNumber && !validationErrors.studentRegistrationNumber && (
                <span className="success-message">✓ Valid Registration Number format</span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <select
                name="academicDivision"
                value={formData.academicDivision}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Academic Division</option>
                <option value="chemical-engineering-technology">Chemical Engineering Technology</option>
                <option value="civil-engineering-technology">Civil Engineering Technology</option>
                <option value="electrical-engineering-technology">Electrical Engineering Technology</option>
                <option value="electronic-telecommunication-engineering-technology">Electronic & Telecommunication Engineering Technology</option>
                <option value="information-technology">Information Technology</option>
                <option value="marine-technology">Marine Technology</option>
                <option value="mechanical-engineering-technology">Mechanical Engineering Technology</option>
                <option value="nautical-studies">Nautical Studies</option>
                <option value="polymer-technology">Polymer Technology</option>
                <option value="textile-clothing-technology">Textile & Clothing Technology</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleInputChange}
                className={getErrorClass('email')}
                required
              />
              {renderError('email')}
              {formData.email && !validationErrors.email && (
                <span className="success-message">✓ Valid email address</span>
              )}
            </div>
          </div>
        </div>

        {/* Health History Form */}
        <div className="form-section">
          <h3>Health History Form</h3>
          <p className="form-description">
            This information is strictly confidential and is for the use of university Health service and will not be released to any one without your knowledge and consent.
          </p>
          <p className="form-note">
            Please hand over the completed form to the student and part II should be completed by MBBS qualified Medical Officer after he has signed and stamped. If the University Medical Officer needs to examine a student on considering his/her medical form, he/she should report immediately to the University Medical Officer.
          </p>
          <p className="form-note">
            All investigations requested on the form must be completed.
          </p>
        </div>

        {/* Part 1 - Personal Information */}
        <div className="form-section">
          <h4>Part 1</h4>
          <p>To be completed by the student</p>
          
          <div className="form-row">
            <div className="form-group">
              <input
                type="date"
                name="dateOfBirth"
                placeholder="Date Of Birth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <select
                name="positionOfFamily"
                value={formData.positionOfFamily}
                onChange={handleInputChange}
                required
              >
                <option value="">Position of family</option>
                <option value="eldest">Eldest</option>
                <option value="middle">Middle</option>
                <option value="youngest">Youngest</option>
                <option value="only-child">Only Child</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastAttendSchool"
                placeholder="Last Attend School"
                value={formData.lastAttendSchool}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <select
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
              >
                <option value="">Religion</option>
                <option value="buddhism">Buddhism</option>
                <option value="christianity">Christianity</option>
                <option value="islam">Islam</option>
                <option value="hinduism">Hinduism</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="occupationOfFather"
                placeholder="Occupation Of Father"
                value={formData.occupationOfFather}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <select
                name="singleMarried"
                value={formData.singleMarried}
                onChange={handleInputChange}
                required
              >
                <option value="">Single/Married</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="occupationOfMother"
                placeholder="Occupation Of Mother"
                value={formData.occupationOfMother}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                name="homeAddress"
                placeholder="Home Address And District"
                value={formData.homeAddress}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                required
              >
                <option value="">Nationality</option>
                <option value="sri-lankan">Sri Lankan</option>
                <option value="indian">Indian</option>
                <option value="british">British</option>
                <option value="american">American</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="tel"
                name="telephoneNumber"
                placeholder="Telephone Number"
                value={formData.telephoneNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <textarea
                name="extraCurricularActivities"
                placeholder="Extra-Curricular activities during the school days. Sports/ Music/ Dancing/ Leadership/ Religious work /Arts/none."
                value={formData.extraCurricularActivities}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <h4>Person to notify in case of emergency</h4>
          
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="emergencyName"
                placeholder="Name"
                value={formData.emergencyName}
                onChange={handleInputChange}
                onKeyPress={handleNameKeyPress}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="emergencyTelephone"
                placeholder="Telephone Number"
                value={formData.emergencyTelephone}
                onChange={handleInputChange}
                onKeyPress={handleTelephoneKeyPress}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <textarea
                name="emergencyAddress"
                placeholder="Address"
                value={formData.emergencyAddress}
                onChange={handleInputChange}
                rows="2"
              />
            </div>
            <div className="form-group">
              <select
                name="emergencyRelationship"
                value={formData.emergencyRelationship}
                onChange={handleInputChange}
                required
              >
                <option value="">Relationship</option>
                <option value="parent">Parent</option>
                <option value="guardian">Guardian</option>
                <option value="sibling">Sibling</option>
                <option value="spouse">Spouse</option>
                <option value="relative">Relative</option>
                <option value="friend">Friend</option>
              </select>
            </div>
          </div>
        </div>

        {/* Family Medical History */}
        <div className="form-section">
          <h4>Family Medical History</h4>
          <div className="family-history-table">
            <div className="table-header">
              <div className="header-cell">Relation</div>
              <div className="header-cell">Age</div>
              <div className="header-cell">Alive/State of Health</div>
              <div className="header-cell">Dead/age at death</div>
              <div className="header-cell">Cause of Death</div>
            </div>
            
            {["father", "mother", "brothers", "sisters", "others"].map((member) => (
              <div key={member} className="table-row">
                <div className="cell">
                  <label>{member.charAt(0).toUpperCase() + member.slice(1)}</label>
                </div>
                <div className="cell">
                  <input
                    type="number"
                    placeholder="Age"
                    value={formData.familyHistory[member].age}
                    onChange={(e) => handleFamilyHistoryChange(member, "age", e.target.value)}
                  />
                </div>
                <div className="cell">
                  <select
                    value={formData.familyHistory[member].aliveState}
                    onChange={(e) => handleFamilyHistoryChange(member, "aliveState", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="alive-healthy">Alive & Healthy</option>
                    <option value="alive-sick">Alive but Sick</option>
                    <option value="dead">Dead</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className="cell">
                  <input
                    type="number"
                    placeholder="Age at death"
                    value={formData.familyHistory[member].deadAge}
                    onChange={(e) => handleFamilyHistoryChange(member, "deadAge", e.target.value)}
                  />
                </div>
                <div className="cell">
                  <input
                    type="text"
                    placeholder="Cause of death"
                    value={formData.familyHistory[member].causeOfDeath}
                    onChange={(e) => handleFamilyHistoryChange(member, "causeOfDeath", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Medical History */}
        <div className="form-section">
          <h4>Student Medical History</h4>
          <p>Have you suffered from any of the following?</p>
          
          <div className="medical-history-list">
            {[
              { key: "infectiousDiseases", label: "1. Infectious Diseases - Mumps, Measles, Rubella, Chicken pox, Infective hepatitis, Others" },
              { key: "wormInfestations", label: "2. Worm Infestations - Round worm, Hook Worm, Thread worm, Tape worm, Filaria, Others." },
              { key: "respiratory", label: "3. Respiratory - Frequent colds, Hay fever, Asthma, Pneumonia, T.B., Others." },
              { key: "circulatory", label: "4. Circulatory - Heart disease, Blood pressure." },
              { key: "ent", label: "5. E.N.T - Ear infections, Sinusitis, Tonsillitis, Others." },
              { key: "eye", label: "6. Eye - Short sight, Long sight, infections, Injuries, Others." },
              { key: "nervousSystem", label: "7. Nervous system - Epilepsy, Migraine, Others." },
              { key: "surgical", label: "8. Surgical - Fractures, Injuries, Operations." },
              { key: "misc", label: "9. MISC - Anemia, Diabetes, Indigestion, Skin disorders, Kidney disease, Attempted suicide, Alcohol Addiction, Depression, Others." },
              { key: "allergicHistory", label: "10. Allergic History - Drugs / Food." },
              { key: "menstrualHistory", label: "11. Menstrual History (for Female Only) - Period- Regular/ Irregular, Flow- Slight / Normal / Excessive, pain- Yes/ No" },
              { key: "disability", label: "12. Disability: Do you believe that you have a disability that in any way requires you to receive special consideration from the University. If so, please indicate the type of disability and you will give a brief description about it." }
            ].map((condition) => (
              <div key={condition.key} className="medical-condition">
                <p>{condition.label}</p>
                <div className="condition-response">
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name={`${condition.key}_status`}
                        value="yes"
                        checked={formData.medicalHistory[condition.key].status === "yes"}
                        onChange={(e) => handleMedicalHistoryChange(condition.key, "status", e.target.value)}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`${condition.key}_status`}
                        value="no"
                        checked={formData.medicalHistory[condition.key].status === "no"}
                        onChange={(e) => handleMedicalHistoryChange(condition.key, "status", e.target.value)}
                      />
                      No
                    </label>
                  </div>
                  {formData.medicalHistory[condition.key].status === "yes" && (
                    <textarea
                      placeholder="Please provide details..."
                      value={formData.medicalHistory[condition.key].details}
                      onChange={(e) => handleMedicalHistoryChange(condition.key, "details", e.target.value)}
                      rows="2"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Immunization Section */}
        <div className="form-section">
          <h4>13. Immunization</h4>
          <div className="vaccination-table">
            <div className="table-header">
              <div className="header-cell">Vaccinations</div>
              <div className="header-cell">Taken</div>
              <div className="header-cell">Date</div>
            </div>
            
            {[
              { key: "bcg", label: "BCG" },
              { key: "dpt", label: "DPT" },
              { key: "mramur", label: "MRA/MUR" },
              { key: "rubella", label: "Rubella" },
              { key: "hepatitisB", label: "Hepatitis B" },
              { key: "chickenPox", label: "Chicken pox" }
            ].map((vaccine) => (
              <div key={vaccine.key} className="table-row">
                <div className="cell">
                  <label>{vaccine.label}</label>
                </div>
                <div className="cell">
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name={`${vaccine.key}_taken`}
                        value="yes"
                        checked={formData.vaccinations[vaccine.key].taken === "yes"}
                        onChange={(e) => handleVaccinationChange(vaccine.key, "taken", e.target.value)}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`${vaccine.key}_taken`}
                        value="no"
                        checked={formData.vaccinations[vaccine.key].taken === "no"}
                        onChange={(e) => handleVaccinationChange(vaccine.key, "taken", e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>
                <div className="cell">
                  <input
                    type="date"
                    value={formData.vaccinations[vaccine.key].date}
                    onChange={(e) => handleVaccinationChange(vaccine.key, "date", e.target.value)}
                    disabled={formData.vaccinations[vaccine.key].taken !== "yes"}
                    style={{
                      opacity: formData.vaccinations[vaccine.key].taken === "yes" ? 1 : 0.5,
                      cursor: formData.vaccinations[vaccine.key].taken === "yes" ? "pointer" : "not-allowed"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certification */}
        <div className="form-section">
          <div className="certification">
            <p>I certify that the information furnished by me are true and correct.</p>
            <div className="signature-section">
              <div className="signature-field">
                <label>Date</label>
                <input 
                  type="date" 
                  name="certificationDate"
                  value={formData.certificationDate}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="signature-field">
                <label>Student Name</label>
                <input 
                  type="text" 
                  name="signature"
                  placeholder="Member Name" 
                  value={formData.signature}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Medical Form'}
          </button>
          <p className="mandatory-note">
            * All fields marked with asterisk are mandatory
          </p>
        </div>
      </form>
    </div>
  );
}

export default StudentEnteringDetails;