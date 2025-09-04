import React, { useState, useRef } from "react";
import "./StudentEnteringDetails.css";
import Avatar from "../../common/Avatar/Avatar";
import { autoGenerateQRIfReady } from '../../../services/medicalRecordService';

function StudentEnteringDetails() {
  // Get current user data and auto-populate
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
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
      bcg: "",
      dpt: "",
      mramur: "",
      rubella: "",
      hepatitisB: "",
      chickenPox: ""
    },

    // Certification
    certificationDate: "",
    signature: ""
  });

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleVaccinationChange = (vaccine, value) => {
    setFormData(prev => ({
      ...prev,
      vaccinations: {
        ...prev.vaccinations,
        [vaccine]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        
        alert('Student details saved successfully!');
        console.log('Saved with ID:', result.studentId);
        
        // Auto-generate QR code if both forms are complete
        const emailToCheck = currentUser?.email || formData.email;
        if (emailToCheck) {
          try {
            const qrResult = await autoGenerateQRIfReady(emailToCheck);
            if (qrResult.success && !qrResult.alreadyExists) {
              alert('🎉 Both forms completed! Your medical QR code has been automatically generated. You can view it in the QR Code section.');
            }
          } catch (error) {
            console.error('Error auto-generating QR code:', error);
          }
        }
        
        // Trigger refresh event for dashboard
        window.dispatchEvent(new CustomEvent('studentDataUpdated'));
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving student details:', error);
      alert('Failed to save student details. Please try again.');
    }
  };

  return (
    <div className="entering-details-container">
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
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
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
                  {imagePreview ? 'Click to change image' : 'Click to upload your image'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="nic"
                placeholder="NIC"
                value={formData.nic}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="studentRegistrationNumber"
                placeholder="Student Registration Number"
                value={formData.studentRegistrationNumber}
                onChange={handleInputChange}
                required
              />
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
                <option value="faculty-of-medicine">Faculty of Medicine</option>
                <option value="faculty-of-engineering">Faculty of Engineering</option>
                <option value="faculty-of-science">Faculty of Science</option>
                <option value="faculty-of-arts">Faculty of Arts</option>
                <option value="faculty-of-management">Faculty of Management</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
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
                  <input
                    type="date"
                    value={formData.vaccinations[vaccine.key]}
                    onChange={(e) => handleVaccinationChange(vaccine.key, e.target.value)}
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
                <label>Signature</label>
                <input 
                  type="text" 
                  name="signature"
                  placeholder="Your signature" 
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
          <button type="submit" className="submit-btn">
            Submit Medical Form
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentEnteringDetails;