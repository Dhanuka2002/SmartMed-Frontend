import React, { useState, useRef, useEffect } from 'react';
import './Hospital_Staff.css';

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
  const [formData, setFormData] = useState({
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
    condition: '',
    studentName: '',
    fitForStudies: '',
    reason: '',
    date1: '',
    date2: '',
    medicalOfficerSignature: '',
    itumMedicalOfficerSignature: ''
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

  const handleSubmit = () => {
    // Check if both signatures are present
    if (!formData.medicalOfficerSignature || !formData.itumMedicalOfficerSignature) {
      alert('Please provide both digital signatures before submitting.');
      return;
    }
    
    console.log('Form submitted:', formData);
    alert('Medical record submitted successfully!');
  };

  const clearAllSignatures = () => {
    setClearSignatures(prev => prev + 1);
    setFormData(prev => ({
      ...prev,
      medicalOfficerSignature: '',
      itumMedicalOfficerSignature: ''
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

          {/* Specialist Referral */}
          <div className="form-section">
            <label className="section-title">10. Does the student need referral to a specialist regarding any medical condition?</label>
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
                  name="condition" 
                  value={formData.condition}
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