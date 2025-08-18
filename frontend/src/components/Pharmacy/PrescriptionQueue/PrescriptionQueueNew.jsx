// Just saving the new modal content temporarily
const newModalContent = `
            {/* Main Prescription Details */}
            <div className="prescription-main-content">
              
              {/* Patient Information Section */}
              <div className="patient-info-section">
                <div className="patient-header">
                  <div className="patient-avatar-large">
                    <FiUser size={32} />
                  </div>
                  <div className="patient-details-header">
                    <h1 className="patient-name-large">{selectedPrescription.studentName}</h1>
                    <div className="patient-meta">
                      <span className="patient-id-large">Student ID: {selectedPrescription.studentId}</span>
                      <span className="queue-number-large">Queue #{selectedPrescription.queueNo}</span>
                      <div className={\`prescription-status-large \${getStatusClass(selectedPrescription.pharmacyStatus || 'Pending')}\`}>
                        <div className="status-dot"></div>
                        <span>{selectedPrescription.pharmacyStatus || 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="close-prescription-btn"
                    onClick={() => setSelectedPrescription(null)}
                    title="Close Prescription Details"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="patient-contact-info">
                  <div className="contact-item">
                    <div className="contact-icon email-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div className="contact-details">
                      <span className="contact-label">Email Address</span>
                      <span className="contact-value">{selectedPrescription.email}</span>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon phone-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div className="contact-details">
                      <span className="contact-label">Phone Number</span>
                      <span className="contact-value">{selectedPrescription.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="prescription-actions-section">
                <div className="actions-container">
                  <button 
                    className="back-to-queue-btn"
                    onClick={() => setSelectedPrescription(null)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m15 18-6-6 6-6"></path>
                    </svg>
                    <span>Back to Queue</span>
                  </button>
                  
                  {selectedPrescription.pharmacyStatus !== 'Dispensed' && (
                    <div className="status-dispense-controls">
                      <div className="status-control">
                        <label className="status-label">Update Status:</label>
                        <select
                          value={selectedPrescription.pharmacyStatus || 'Pending'}
                          onChange={(e) => handleStatusUpdate(selectedPrescription.queueNo, e.target.value)}
                          className="full-status-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                        </select>
                      </div>
                      
                      <button 
                        className="dispense-medication-btn"
                        onClick={() => {
                          handleDispense(selectedPrescription.queueNo);
                          setSelectedPrescription(null);
                        }}
                        disabled={selectedPrescription.pharmacyStatus !== 'Ready'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        <span>Dispense Medication</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
`;