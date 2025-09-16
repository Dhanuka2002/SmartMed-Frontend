import React, { useState, useEffect } from 'react';
import DigitalSignature from '../../common/DigitalSignature/DigitalSignature';
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';
import './PrescriptionForm.css';

const PrescriptionForm = ({ patient, onClose, onSubmit }) => {
  const { alertState, showSuccess, showError, hideAlert } = useAlert();
  const [formData, setFormData] = useState({
    patientId: patient?.id || '',
    patientName: patient?.name || '',
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    additionalNotes: '',
    signature: null,
    prescriptionDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableMedicines] = useState([
    'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Aspirin', 'Metformin',
    'Lisinopril', 'Simvastatin', 'Omeprazole', 'Amlodipine', 'Metoprolol',
    'Hydrochlorothiazide', 'Gabapentin', 'Tramadol', 'Prednisone', 'Albuterol'
  ]);

  const frequencyOptions = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
    'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'As needed'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = formData.medicines.map((medicine, i) => 
      i === index ? { ...medicine, [field]: value } : medicine
    );
    
    setFormData(prev => ({
      ...prev,
      medicines: updatedMedicines
    }));

    // Clear medicine errors
    if (errors[`medicine_${index}_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`medicine_${index}_${field}`]: ''
      }));
    }
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    }));
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medicines: updatedMedicines
      }));
    }
  };

  const handleSignatureChange = (signatureData) => {
    setFormData(prev => ({
      ...prev,
      signature: signatureData
    }));
    
    if (errors.signature) {
      setErrors(prev => ({
        ...prev,
        signature: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    formData.medicines.forEach((medicine, index) => {
      if (!medicine.name.trim()) {
        newErrors[`medicine_${index}_name`] = 'Medicine name is required';
      }
      if (!medicine.dosage.trim()) {
        newErrors[`medicine_${index}_dosage`] = 'Dosage is required';
      }
      if (!medicine.frequency.trim()) {
        newErrors[`medicine_${index}_frequency`] = 'Frequency is required';
      }
      if (!medicine.duration.trim()) {
        newErrors[`medicine_${index}_duration`] = 'Duration is required';
      }
    });

    if (!formData.signature) {
      newErrors.signature = 'Digital signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const prescriptionData = {
        ...formData,
        prescriptionId: `RX-${Date.now()}`,
        doctorId: 'DR001', // This would come from auth context
        doctorName: 'Dr. Smith', // This would come from auth context
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      await onSubmit(prescriptionData);
      
      // Show success message
      showSuccess('Prescription sent to pharmacy successfully!', 'Prescription Sent');
      onClose();
      
    } catch (error) {
      console.error('Error submitting prescription:', error);
      showError('Error submitting prescription. Please try again.', 'Submission Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="prescription-form-overlay">
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
      <div className="prescription-form-container">
        <div className="prescription-form-header">
          <h2>Digital Prescription</h2>
          <button 
            type="button" 
            className="close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form className="prescription-form" onSubmit={handleSubmit}>
          {/* Patient Information */}
          <div className="form-section">
            <h3>Patient Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  value={formData.patientName}
                  disabled
                  className="form-input disabled"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="prescriptionDate"
                  value={formData.prescriptionDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="form-section">
            <div className="form-group">
              <label>
                Diagnosis <span className="required">*</span>
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Enter patient diagnosis..."
                className={`form-textarea ${errors.diagnosis ? 'error' : ''}`}
                rows="3"
              />
              {errors.diagnosis && <span className="error-message">{errors.diagnosis}</span>}
            </div>
          </div>

          {/* Medicines */}
          <div className="form-section">
            <div className="medicines-header">
              <h3>Prescribed Medicines</h3>
              <button
                type="button"
                className="add-medicine-btn"
                onClick={addMedicine}
                disabled={isSubmitting}
              >
                + Add Medicine
              </button>
            </div>

            {formData.medicines.map((medicine, index) => (
              <div key={index} className="medicine-card">
                <div className="medicine-header">
                  <h4>Medicine {index + 1}</h4>
                  {formData.medicines.length > 1 && (
                    <button
                      type="button"
                      className="remove-medicine-btn"
                      onClick={() => removeMedicine(index)}
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="medicine-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Medicine Name <span className="required">*</span></label>
                      <select
                        value={medicine.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        className={`form-select ${errors[`medicine_${index}_name`] ? 'error' : ''}`}
                      >
                        <option value="">Select medicine...</option>
                        {availableMedicines.map(med => (
                          <option key={med} value={med}>{med}</option>
                        ))}
                      </select>
                      {errors[`medicine_${index}_name`] && 
                        <span className="error-message">{errors[`medicine_${index}_name`]}</span>
                      }
                    </div>

                    <div className="form-group">
                      <label>Dosage <span className="required">*</span></label>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        className={`form-input ${errors[`medicine_${index}_dosage`] ? 'error' : ''}`}
                      />
                      {errors[`medicine_${index}_dosage`] && 
                        <span className="error-message">{errors[`medicine_${index}_dosage`]}</span>
                      }
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Frequency <span className="required">*</span></label>
                      <select
                        value={medicine.frequency}
                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                        className={`form-select ${errors[`medicine_${index}_frequency`] ? 'error' : ''}`}
                      >
                        <option value="">Select frequency...</option>
                        {frequencyOptions.map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                      {errors[`medicine_${index}_frequency`] && 
                        <span className="error-message">{errors[`medicine_${index}_frequency`]}</span>
                      }
                    </div>

                    <div className="form-group">
                      <label>Duration <span className="required">*</span></label>
                      <input
                        type="text"
                        value={medicine.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                        className={`form-input ${errors[`medicine_${index}_duration`] ? 'error' : ''}`}
                      />
                      {errors[`medicine_${index}_duration`] && 
                        <span className="error-message">{errors[`medicine_${index}_duration`]}</span>
                      }
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Instructions</label>
                    <input
                      type="text"
                      value={medicine.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take after meals"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Notes */}
          <div className="form-section">
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Any additional notes for the pharmacist..."
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>

          {/* Form Actions with Digital Signature */}
          <div className="form-actions-container">
            {/* Digital Signature */}
            <div className="signature-section-bottom">
              <h3 className="signature-title">Digital Signature Required</h3>
              <p className="signature-description">
                Sign below to authorize this prescription before sending to pharmacy
              </p>
              <div className="signature-container">
                <DigitalSignature
                  onSignatureChange={handleSignatureChange}
                  disabled={isSubmitting}
                />
                {errors.signature && <span className="error-message signature-error">{errors.signature}</span>}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Sending to Pharmacy...
                  </>
                ) : (
                  '📝 Sign & Send to Pharmacy'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;