import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';
import "./MedicineRequests.css";

function MedicineRequests() {
  const [pharmacy, setPharmacy] = useState("");
  const [medicine, setMedicine] = useState("");
  const [quantity, setQuantity] = useState("");
  const [requestDate, setRequestDate] = useState(new Date());
  const [about, setAbout] = useState("");
  const [priority, setPriority] = useState("normal");
  const { alertState, showSuccess, showError, hideAlert } = useAlert();

  const handleGeneratePDF = (e) => {
    e.preventDefault();
    // Validate form
    if (!pharmacy || !medicine || !quantity) {
      showError('Please fill in all required fields', 'Form Validation Error');
      return;
    }
    // Add your PDF generation logic here
    showSuccess('PDF Generated Successfully!', 'PDF Generated');
  };

  const handleEmailRequest = (e) => {
    e.preventDefault();
    // Validate form
    if (!pharmacy || !medicine || !quantity) {
      showError('Please fill in all required fields', 'Form Validation Error');
      return;
    }
    // Add your email sending logic here
    showSuccess('Order Request Sent Successfully!', 'Request Sent');
  };

  const handleClearForm = () => {
    setPharmacy("");
    setMedicine("");
    setQuantity("");
    setRequestDate(new Date());
    setAbout("");
    setPriority("normal");
  };

  return (
    <div className="medicine-requests-container">
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
      <div className="header-section">
        <h1 className="page-title">Medicine Request System</h1>
      
      </div>

      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-header">
            <h2>New Medicine Request</h2>
            <div className="form-progress">
              <div className="progress-bar"></div>
            </div>
          </div>

          <form className="medicine-request-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="pharmacy" className="required">
                  <span className="label-text">External Pharmacy</span>
                  <span className="required-asterisk">*</span>
                </label>
                <select
                  id="pharmacy"
                  value={pharmacy}
                  onChange={(e) => setPharmacy(e.target.value)}
                  className={!pharmacy ? "error" : ""}
                >
                  <option value="">Choose a pharmacy</option>
                  <option value="MediPlus Pharmacy">MediPlus Pharmacy</option>
                  <option value="HealthCare Central">HealthCare Central</option>
                  <option value="Wellness Pharmacy">Wellness Pharmacy</option>
                  <option value="City Medical Store">City Medical Store</option>
                  <option value="Guardian Pharmacy">Guardian Pharmacy</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">
                  <span className="label-text">Priority Level</span>
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="medicine" className="required">
                  <span className="label-text">Medicine Name</span>
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  id="medicine"
                  type="text"
                  value={medicine}
                  onChange={(e) => setMedicine(e.target.value)}
                  placeholder="Enter medicine name"
                  className={!medicine ? "error" : ""}
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity" className="required">
                  <span className="label-text">Quantity</span>
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  min="1"
                  className={!quantity ? "error" : ""}
                />
              </div>

              <div className="form-group">
                <label htmlFor="requestDate">
                  <span className="label-text">Request Date</span>
                </label>
                <DatePicker
                  id="requestDate"
                  selected={requestDate}
                  onChange={(date) => setRequestDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="datepicker-input"
                  minDate={new Date()}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="about">
                  <span className="label-text">Additional Notes</span>
                </label>
                <textarea
                  id="about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Enter any additional information or special instructions..."
                  rows="4"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleClearForm}>
                <span className="btn-icon">↻</span>
                Clear Form
              </button>
              <div className="primary-actions">
                <button type="button" className="btn btn-outline" onClick={handleGeneratePDF}>
                  <span className="btn-icon">📄</span>
                  Generate PDF
                </button>
                <button type="button" className="btn btn-primary" onClick={handleEmailRequest}>
                  <span className="btn-icon">📧</span>
                  Send Request
                </button>
              </div>
            </div>
          </form>
        </div>

       
            </div>
          </div>
       

  );
}

export default MedicineRequests;