import React, { useState, useRef, useEffect } from 'react';
import './Hospital_Staff.css';
import { autoGenerateQRIfReady } from '../../services/medicalRecordService';

const SignaturePad = ({ onSignatureChange, label, clearSignal, width = 300, height = 120 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Set white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    if (clearSignal) {
      clearSignature();
    }
  }, [clearSignal]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsEmpty(false);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    onSignatureChange(signatureData);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSignatureChange('');
  };

  return (
    <div className="signature-pad-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="signature-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          border: '2px solid #3A40DF',
          borderRadius: '4px',
          cursor: 'crosshair',
          backgroundColor: 'white',
          touchAction: 'none',
          width: '100%',
          maxWidth: width + 'px',
          height: height + 'px'
        }}
      />
      <button
        type="button"
        className="clear-signature-btn"
        onClick={clearSignature}
        disabled={isEmpty}
        style={{
          marginTop: '0.5rem',
          padding: '0.3rem 0.8rem',
          backgroundColor: isEmpty ? '#6c757d' : '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          fontSize: '0.8rem',
          cursor: isEmpty ? 'not-allowed' : 'pointer',
          opacity: isEmpty ? 0.6 : 1
        }}
      >
        Clear Signature
      </button>
    </div>
  );
};

const Hospital_Staff = () => {
  // Get current user email for tracking purposes
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Predefined allergy categories
  const defaultAllergyCategories = [
    'Food Allergies',
    'Drug/Medication Allergies', 
    'Environmental Allergies',
    'Seasonal Allergies',
    'Insect Sting Allergies',
    'Latex Allergies',
    'Contact Allergies',
    'Chemical Allergies',
    'Animal Allergies',
    'Metal Allergies'
  ];
  
  const [allergyCategories, setAllergyCategories] = useState(defaultAllergyCategories);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    studentEmail: currentUser.role === 'Student' ? currentUser.email : '',
    vaccinated: '',
    weight: '',
    height: '',
    chestInspiration: '',
    chestExpiration: '',
    teethDecayed: false,
    teethMissing: false,
    teethDentures: false,
    teethGingivitis: false,
    hearingRight: '',
    hearingLeft: '',
    speech: '',
    heartDisease: '',
    heartSound: '',
    bloodPressure: '',
    murmurs: '',
    pulse: '',
    tuberculosis: '',
    tuberculosisTest: '',
    xrayChest: '',
    xrayNo: '',
    xrayFindings: '',
    xrayDate: '',
    convulsion: '',
    kneeJerks: '',
    liverSpleen: '',
    hemorrhoids: '',
    hernialOrifices: '',
    visionRightWithout: '',
    visionLeftWithout: '',
    visionRightWith: '',
    visionLeftWith: '',
    colorVisionNormal: true,
    colorVisionRed: false,
    colorVisionGreen: false,
    scarsOperations: '',
    varicoseVeins: '',
    boneJoint: '',
    bloodGroup: '',
    hemoglobin: '',
    specialistReferral: '',
    medicalCondition: '',
    studentName: '',
    fitForStudies: '',
    reason: '',
    date1: '',
    medicalOfficerSignature: '',
    // Allergies section
    allergies: {},
    allergyDetails: '',
    hasAllergies: ''
  });

  const [clearSignatures, setClearSignatures] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignatureChange = (signatureName, signatureData) => {
    setFormData(prev => ({
      ...prev,
      [signatureName]: signatureData
    }));
  };

  const handleAllergyChange = (category, checked) => {
    setFormData(prev => ({
      ...prev,
      allergies: {
        ...prev.allergies,
        [category]: checked
      }
    }));
  };

  const addNewAllergyCategory = () => {
    if (newCategory.trim() && !allergyCategories.includes(newCategory.trim())) {
      const updatedCategories = [...allergyCategories, newCategory.trim()];
      setAllergyCategories(updatedCategories);
      setNewCategory('');
      setShowAddCategory(false);
      
      // Auto-select the newly added category
      setFormData(prev => ({
        ...prev,
        allergies: {
          ...prev.allergies,
          [newCategory.trim()]: true
        }
      }));
    }
  };

  const removeAllergyCategory = (categoryToRemove) => {
    if (!defaultAllergyCategories.includes(categoryToRemove)) {
      setAllergyCategories(prev => prev.filter(cat => cat !== categoryToRemove));
      setFormData(prev => {
        const newAllergies = { ...prev.allergies };
        delete newAllergies[categoryToRemove];
        return {
          ...prev,
          allergies: newAllergies
        };
      });
    }
  };

  const handleSubmit = async () => {
    // Check if medical officer signature is present
    if (!formData.medicalOfficerSignature) {
      alert('Please provide the medical officer digital signature before submitting.');
      return;
    }
    
    // Check if student email is provided
    if (!formData.studentEmail || formData.studentEmail.trim() === '') {
      alert('Please provide the student email address.');
      return;
    }
    
    // Check if student name is provided
    if (!formData.studentName || formData.studentName.trim() === '') {
      alert('Please provide the student name.');
      return;
    }

    try {
      // Prepare data with proper type conversion
      const submissionData = {
        ...formData,
        // Convert empty strings to null for numeric fields
        weight: formData.weight === '' ? null : parseFloat(formData.weight),
        height: formData.height === '' ? null : parseFloat(formData.height),
        chestInspiration: formData.chestInspiration === '' ? null : parseFloat(formData.chestInspiration),
        chestExpiration: formData.chestExpiration === '' ? null : parseFloat(formData.chestExpiration),
        hemoglobin: formData.hemoglobin === '' ? null : parseFloat(formData.hemoglobin),
        // Serialize allergies object to JSON string for backend storage
        allergies: JSON.stringify(formData.allergies)
      };

      // You may need to add authentication headers here
      // For example, if you have a token: 'Authorization': 'Bearer ' + token
      const response = await fetch('http://localhost:8081/api/medical-records/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
        },
        body: JSON.stringify(submissionData)
      });

      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if the response has content before parsing
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Server returned invalid JSON');
      }

      if (result.status === 'success') {
        // Save hospital data to localStorage for QR code generation
        localStorage.setItem('hospitalFormData', JSON.stringify(formData));
        localStorage.setItem(`hospitalData_${formData.studentEmail}`, JSON.stringify(formData));
        
        alert('Medical record saved successfully to database!');
        console.log('Record ID:', result.recordId);
        
        // Auto-generate QR code if both forms are complete
        const emailToCheck = formData.studentEmail;
        if (emailToCheck) {
          try {
            const qrResult = await autoGenerateQRIfReady(emailToCheck);
            if (qrResult.success && !qrResult.alreadyExists) {
              alert('🎉 Both forms completed! The student\'s medical QR code has been automatically generated. The student can now view their QR code in the Student QR Code section.');
            } else if (qrResult.success && qrResult.alreadyExists) {
              alert('✅ Medical record updated. The student\'s QR code was already generated and remains valid.');
            }
          } catch (error) {
            console.error('Error auto-generating QR code:', error);
          }
        }
        
        // Optionally reset the form
        // resetForm();
      } else {
        alert('Error saving medical record: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving medical record:', error);
      alert('Failed to save medical record. Please check your connection and try again.');
    }
  };

  const clearAllSignatures = () => {
    setClearSignatures(prev => prev + 1);
    setFormData(prev => ({
      ...prev,
      medicalOfficerSignature: ''
    }));
  };

  return (
    <div className="hospital-container">
      <div className="form-container">
        <div className="form-header">
          <div className="header-content">
            <h1>Hospital Staff</h1>
            <p>Hospital Medical Record Details</p>
          </div>
          <div className="header-icon">
            <div className="medical-icon">👨‍⚕️</div>
          </div>
        </div>

        <div className="part-header">
          <h2>Part 2</h2>
        </div>

        <div className="medical-officer-note">
          <strong>FOR USE OF MEDICAL OFFICER</strong> (to be completed by a M.B.B.S. qualified doctor)<br/>
          General medical information. (All investigations requested must be completed)
        </div>

        <div className="medical-form">
          {/* Student Email Input */}
          <div className="form-section">
            <label className="form-label">Student Email Address</label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleInputChange}
              placeholder="Enter student's email address"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            />
          </div>
          {/* Vaccination Status */}
          <div className="form-section">
            <label className="form-label">a. Has the student been successfully vaccinated?</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="vaccinated" 
                  value="yes" 
                  onChange={handleInputChange}
                />
                Yes
              </label>
              <label>
                <input 
                  type="radio" 
                  name="vaccinated" 
                  value="no" 
                  onChange={handleInputChange}
                />
                No
              </label>
            </div>
          </div>

          {/* Physical Measurements */}
          <div className="form-section">
            <div className="measurements-grid">
              <div className="measurement-item">
                <label>Weight</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    name="weight" 
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="Enter weight"
                  />
                  <span className="unit">kg</span>
                </div>
              </div>
              <div className="measurement-item">
                <label>Height</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    name="height" 
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="Enter height"
                  />
                  <span className="unit">cm</span>
                </div>
              </div>
              <div className="measurement-item">
                <label>Circumference of Chest</label>
                <div className="chest-measurements">
                  <div>
                    <label>Full Inspiration</label>
                    <input 
                      type="number" 
                      name="chestInspiration" 
                      value={formData.chestInspiration}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>Full Expiration</label>
                    <input 
                      type="number" 
                      name="chestExpiration" 
                      value={formData.chestExpiration}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Condition of Teeth */}
          <div className="form-section">
            <label className="section-title">1. Condition of teeth</label>
            <div className="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="teethDecayed" 
                  checked={formData.teethDecayed}
                  onChange={handleInputChange}
                />
                Decayed
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="teethMissing" 
                  checked={formData.teethMissing}
                  onChange={handleInputChange}
                />
                Missing
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="teethDentures" 
                  checked={formData.teethDentures}
                  onChange={handleInputChange}
                />
                Dentures
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="teethGingivitis" 
                  checked={formData.teethGingivitis}
                  onChange={handleInputChange}
                />
                Gingivitis
              </label>
            </div>
          </div>

          {/* Hearing */}
          <div className="form-section">
            <label className="section-title">2. Hearing</label>
            <div className="hearing-grid">
              <div>
                <label>R ear</label>
                <select name="hearingRight" value={formData.hearingRight} onChange={handleInputChange}>
                  <option value="">Select</option>
                  <option value="normal">Normal</option>
                  <option value="impaired">Impaired</option>
                  <option value="deaf">Deaf</option>
                </select>
              </div>
              <div>
                <label>L ear</label>
                <select name="hearingLeft" value={formData.hearingLeft} onChange={handleInputChange}>
                  <option value="">Select</option>
                  <option value="normal">Normal</option>
                  <option value="impaired">Impaired</option>
                  <option value="deaf">Deaf</option>
                </select>
              </div>
            </div>
            <div className="speech-section">
              <label>Speech</label>
              <input 
                type="text" 
                name="speech" 
                value={formData.speech}
                onChange={handleInputChange}
                placeholder="Speech condition"
              />
            </div>
          </div>

          {/* Circulation */}
          <div className="form-section">
            <label className="section-title">3. Circulation</label>
            <div className="circulation-grid">
              <div>
                <label>Any past history of heart disease?</label>
                <input 
                  type="text" 
                  name="heartDisease" 
                  value={formData.heartDisease}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Murmurs</label>
                <input 
                  type="text" 
                  name="murmurs" 
                  value={formData.murmurs}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Heart sound</label>
                <input 
                  type="text" 
                  name="heartSound" 
                  value={formData.heartSound}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Pulse</label>
                <input 
                  type="text" 
                  name="pulse" 
                  value={formData.pulse}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Blood pressure</label>
                <input 
                  type="text" 
                  name="bloodPressure" 
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  placeholder="e.g., 120/80"
                />
              </div>
            </div>
          </div>

          {/* Respiration */}
          <div className="form-section">
            <label className="section-title">4. Respiration</label>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                Past history of Tuberculosis, Bronchitis or Asthma?
              </label>
              <input 
                type="text" 
                name="tuberculosis" 
                value={formData.tuberculosis}
                onChange={handleInputChange}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                Special test for tuberculosis
              </label>
              <input 
                type="text" 
                name="tuberculosisTest" 
                value={formData.tuberculosisTest}
                onChange={handleInputChange}
              />
            </div>
            <div className="xray-section">
              <div className="xray-grid">
                <div>
                  <label>X-ray chest</label>
                  <input 
                    type="text" 
                    name="xrayChest" 
                    value={formData.xrayChest}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>X-ray No:</label>
                  <input 
                    type="text" 
                    name="xrayNo" 
                    value={formData.xrayNo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Findings:</label>
                <input 
                  type="text" 
                  name="xrayFindings" 
                  value={formData.xrayFindings}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Date:</label>
                <input 
                  type="date" 
                  name="xrayDate" 
                  value={formData.xrayDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Nervous Functions */}
          <div className="form-section">
            <label className="section-title">5. Nervous Functions</label>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                Any traces of convulsion, insanity or inebriety observable?
              </label>
              <input 
                type="text" 
                name="convulsion" 
                value={formData.convulsion}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                Are knee jerks and pupils abnormal?
              </label>
              <input 
                type="text" 
                name="kneeJerks" 
                value={formData.kneeJerks}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Examination of Abdomen */}
          <div className="form-section">
            <label className="section-title">6. Examination of Abdomen</label>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                Any evidence of enlargement of liver or spleen?
              </label>
              <input 
                type="text" 
                name="liverSpleen" 
                value={formData.liverSpleen}
                onChange={handleInputChange}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                Whether subject to hemorrhoids?
              </label>
              <input 
                type="text" 
                name="hemorrhoids" 
                value={formData.hemorrhoids}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                Hernial Orifices
              </label>
              <input 
                type="text" 
                name="hernialOrifices" 
                value={formData.hernialOrifices}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Vision */}
          <div className="form-section">
            <label className="section-title">7. Vision</label>
            <div className="vision-grid">
              <div className="vision-group">
                <label>Without glasses</label>
                <div>
                  <label>Rt</label>
                  <input 
                    type="text" 
                    name="visionRightWithout" 
                    value={formData.visionRightWithout}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Lt</label>
                  <input 
                    type="text" 
                    name="visionLeftWithout" 
                    value={formData.visionLeftWithout}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="vision-group">
                <label>With glasses</label>
                <div>
                  <label>Rt</label>
                  <input 
                    type="text" 
                    name="visionRightWith" 
                    value={formData.visionRightWith}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Lt</label>
                  <input 
                    type="text" 
                    name="visionLeftWith" 
                    value={formData.visionLeftWith}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="color-vision">
              <label>Color Vision</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    name="colorVisionNormal" 
                    checked={formData.colorVisionNormal}
                    onChange={handleInputChange}
                  />
                  Normal/blind
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    name="colorVisionRed" 
                    checked={formData.colorVisionRed}
                    onChange={handleInputChange}
                  />
                  Red
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    name="colorVisionGreen" 
                    checked={formData.colorVisionGreen}
                    onChange={handleInputChange}
                  />
                  Green
                </label>
              </div>
            </div>
          </div>

          {/* Extremities and Surface */}
          <div className="form-section">
            <label className="section-title">8. Extremities and surface</label>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                a) Are there any scars from operations, injuries?
              </label>
              <input 
                type="text" 
                name="scarsOperations" 
                value={formData.scarsOperations}
                onChange={handleInputChange}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                b) Are there varicose veins or any affection of the skin?
              </label>
              <input 
                type="text" 
                name="varicoseVeins" 
                value={formData.varicoseVeins}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                c) Any bone or joint abnormalities?
              </label>
              <input 
                type="text" 
                name="boneJoint" 
                value={formData.boneJoint}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Clinical Tests */}
          <div className="form-section">
            <label className="section-title">9. Clinical Tests</label>
            <div className="clinical-tests">
              <div>
                <label>Blood group & Rh</label>
                <input 
                  type="text" 
                  name="bloodGroup" 
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  placeholder="e.g., A+, B-, O+, AB-"
                />
              </div>
              <div>
                <label>Hemoglobin</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    name="hemoglobin" 
                    value={formData.hemoglobin}
                    onChange={handleInputChange}
                    step="0.1"
                  />
                  <span className="unit">g/dL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Allergies Section */}
          <div className="form-section">
            <label className="section-title">10. Allergies and Sensitivities</label>
            
            {/* Has Allergies Question */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                Does the student have any known allergies?
              </label>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="hasAllergies" 
                    value="yes" 
                    onChange={handleInputChange}
                  />
                  Yes
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="hasAllergies" 
                    value="no" 
                    onChange={handleInputChange}
                  />
                  No
                </label>
              </div>
            </div>

            {/* Allergy Categories - Show only if has allergies */}
            {formData.hasAllergies === 'yes' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                    Select applicable allergy categories:
                  </label>
                  <div className="allergy-categories">
                    {allergyCategories.map((category, index) => (
                      <div key={index} className="allergy-category-item">
                        <label className="allergy-checkbox">
                          <input 
                            type="checkbox" 
                            checked={formData.allergies[category] || false}
                            onChange={(e) => handleAllergyChange(category, e.target.checked)}
                          />
                          {category}
                        </label>
                        {!defaultAllergyCategories.includes(category) && (
                          <button 
                            type="button" 
                            className="remove-category-btn"
                            onClick={() => removeAllergyCategory(category)}
                            title="Remove custom category"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Category */}
                <div style={{ marginBottom: '1rem' }}>
                  {!showAddCategory ? (
                    <button 
                      type="button" 
                      className="add-category-btn"
                      onClick={() => setShowAddCategory(true)}
                    >
                      + Add New Allergy Category
                    </button>
                  ) : (
                    <div className="add-category-form">
                      <input 
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new allergy category"
                        onKeyPress={(e) => e.key === 'Enter' && addNewAllergyCategory()}
                      />
                      <button 
                        type="button" 
                        className="add-btn"
                        onClick={addNewAllergyCategory}
                      >
                        Add
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategory('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Allergy Details */}
                <div>
                  <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                    Please provide specific details about allergies (medications, foods, reactions, etc.):
                  </label>
                  <textarea 
                    name="allergyDetails" 
                    value={formData.allergyDetails}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe specific allergies, symptoms, severity, treatments used, etc..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Specialist Referral */}
          <div className="form-section">
            <label className="section-title">11. Does the student need referral to a specialist regarding any medical condition?</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="specialistReferral" 
                  value="yes" 
                  onChange={handleInputChange}
                />
                Yes
              </label>
              <label>
                <input 
                  type="radio" 
                  name="specialistReferral" 
                  value="no" 
                  onChange={handleInputChange}
                />
                No
              </label>
            </div>
            {formData.specialistReferral === 'yes' && (
              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                  If so, what is the condition?
                </label>
                <textarea 
                  name="medicalCondition" 
                  value={formData.medicalCondition}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe the condition..."
                />
              </div>
            )}
          </div>

          {/* Final Assessment */}
          <div className="form-section">
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                I am of opinion that Mr/Mrs/Miss
              </label>
              <input 
                type="text" 
                name="studentName" 
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="Student name"
              />
            </div>
            <div className="fit-assessment">
              <div className="radio-group" style={{ marginBottom: '1rem' }}>
                <label>
                  <input 
                    type="radio" 
                    name="fitForStudies" 
                    value="fit" 
                    onChange={handleInputChange}
                  />
                  Is fit for higher studies
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="fitForStudies" 
                    value="not-fit" 
                    onChange={handleInputChange}
                  />
                  Is not fit for higher studies
                </label>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                  For the following reasons:
                </label>
                <textarea 
                  name="reason" 
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Provide reasons..."
                />
              </div>
            </div>
          </div>

          {/* Digital Signatures Section */}
          <div className="signatures-section">
            <div className="signature-row">
              <div className="signature-item">
                <label>Medical Officer Signature</label>
                <SignaturePad
                  onSignatureChange={(data) => handleSignatureChange('medicalOfficerSignature', data)}
                  label="Medical Officer"
                  clearSignal={clearSignatures}
                  width={300}
                  height={120}
                />
              </div>
            </div>
            <div className="signature-actions">
              <button type="button" className="clear-signature-btn" onClick={clearAllSignatures}>
                Clear Signature
              </button>
            </div>
          </div>

          <div className="submit-section">
            <button type="button" className="submit-btn" onClick={handleSubmit}>
              Submit Medical Record
            </button>
          </div>    
        </div>
      </div>

   
    </div>
  );
};

export default Hospital_Staff;