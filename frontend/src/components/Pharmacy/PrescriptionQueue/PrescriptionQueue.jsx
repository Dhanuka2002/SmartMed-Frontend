import React, { useState, useEffect } from "react";
// Removed unused imports - only using database prescriptions now
import { FiCalendar, FiUser, FiClock, FiCheck, FiEye } from "react-icons/fi";
import { usePrescription } from "../../../contexts/PrescriptionContext";
import "./PrescriptionQueue.css";

function PrescriptionQueue() {
  const [databasePrescriptions, setDatabasePrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  
  // Get prescription context for dispensed history
  const { dispensedPrescriptions } = usePrescription();

  // Update last updated timestamp when prescriptions change
  useEffect(() => {
    setLastUpdated(new Date());
  }, [databasePrescriptions]);

  // Load prescription data from database only
  useEffect(() => {
    loadDatabasePrescriptions();
    
    const databaseInterval = setInterval(loadDatabasePrescriptions, 15000); // Refresh every 15 seconds for database
    
    return () => {
      clearInterval(databaseInterval);
    };
  }, []);

  const loadDatabasePrescriptions = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading prescriptions from database...');
      
      const response = await fetch('http://localhost:8081/api/prescriptions/pending');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const prescriptions = await response.json();
      console.log('✅ Database prescriptions loaded:', prescriptions);
      
      // Transform database prescriptions to match the expected format
      const transformedPrescriptions = prescriptions.map(prescription => {
        // Extract medicines safely, handling potential nested structure
        const medicines = prescription.medicines || [];
        const medications = medicines.map(med => {
          // Handle both direct medicine object or nested structure
          const medicineData = med.prescription ? med : med;
          return {
            name: medicineData.medicineName || medicineData.name || 'Unknown Medicine',
            dosage: medicineData.dosage || 'N/A',
            frequency: medicineData.frequency || 'As directed',
            duration: medicineData.duration || 'N/A',
            quantity: medicineData.quantity || 1,
            instructions: medicineData.instructions || 'Take as directed'
          };
        });

        return {
          queueNo: prescription.queueNo || prescription.id || Math.random().toString(),
          internalId: prescription.id || Math.random(),
          studentName: prescription.patientName || 'Unknown Patient',
          studentId: prescription.patientId || prescription.studentId || 'N/A',
          email: prescription.email || '',
          phone: prescription.phone || '',
          prescriptionTime: prescription.createdDate || new Date().toISOString(),
          pharmacyStatus: mapDatabaseStatusToPharmacyStatus(prescription.status || 'Pending'),
          isDatabasePrescription: true, // Mark as database prescription
          prescription: {
            doctorName: prescription.doctorName || 'Unknown Doctor',
            prescriptionDate: prescription.createdDate || new Date().toISOString(),
            prescriptionText: prescription.prescriptionText || "",
            medications: medications
          }
        };
      });
      
      setDatabasePrescriptions(transformedPrescriptions);
      
    } catch (error) {
      console.error('❌ Error loading database prescriptions:', error);
      // Don't clear existing prescriptions on error - keep what we have
      // setDatabasePrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const mapDatabaseStatusToPharmacyStatus = (dbStatus) => {
    switch (dbStatus) {
      case 'Pending': return 'Pending';
      case 'In Progress': return 'Preparing';
      case 'Completed': return 'Dispensed';
      default: return 'Pending';
    }
  };

  // Only show database prescriptions (from doctor submissions via backend)
  const allPrescriptions = [
    // Database prescriptions (from doctor submissions)
    ...(databasePrescriptions || [])
  ];

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const handleDispense = async (queueNo) => {
    try {
      // Find the prescription (all prescriptions are now database prescriptions)
      const prescription = allPrescriptions.find(p => p.queueNo === queueNo);
      
      if (prescription) {
        // Handle database prescription dispensing
        const dispensingData = {
          dispensedBy: "Pharmacist", // TODO: Get from user context/authentication
          medicines: prescription.prescription.medications.map(med => ({
            medicineId: null, // Will be matched by name if needed
            medicineName: med.name,
            dispensedQuantity: med.quantity || 1
          }))
        };

        const response = await fetch(`http://localhost:8081/api/prescriptions/${prescription.internalId}/dispense`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dispensingData),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Check if prescription already exists in dispensed history to avoid duplicates
            const existingDispensed = JSON.parse(localStorage.getItem('contextDispensedPrescriptions') || '[]');
            const isDuplicate = existingDispensed.some(p => 
              p.queueNumber === prescription.queueNo ||
              (p.studentId === prescription.studentId && 
               p.studentName === prescription.studentName && 
               p.prescription.doctorName === prescription.prescription.doctorName)
            );

            if (!isDuplicate) {
              // Add the dispensed prescription to context for dispensed history
              const dispensedPrescriptionData = {
                id: `RX${Date.now()}${Math.random()}`, // Generate unique ID
                queueNumber: prescription.queueNo,
                studentName: prescription.studentName,
                studentId: prescription.studentId,
                email: prescription.email,
                phone: prescription.phone,
                prescription: {
                  doctorName: prescription.prescription.doctorName,
                  medications: prescription.prescription.medications,
                  prescriptionText: prescription.prescription.prescriptionText || ""
                },
                prescriptionDate: prescription.prescriptionTime,
                prescriptionTime: prescription.prescriptionTime,
                status: 'dispensed',
                dispensedDate: new Date().toISOString().split('T')[0],
                dispensedTime: new Date().toLocaleTimeString(),
                createdAt: new Date().toISOString()
              };

              // Add to localStorage for dispensed history
              const updatedDispensed = [dispensedPrescriptionData, ...existingDispensed];
              localStorage.setItem('contextDispensedPrescriptions', JSON.stringify(updatedDispensed));
            }
            
            alert('Prescription dispensed successfully!');
            loadDatabasePrescriptions(); // Reload to get updated status
            return true; // Return success
          } else {
            throw new Error(result.message);
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        throw new Error('Prescription not found');
      }
    } catch (error) {
      console.error('Error dispensing prescription:', error);
      alert(`Error dispensing prescription: ${error.message}`);
      return false; // Return failure
    }
  };

  const handleStatusUpdate = async (queueNo, status) => {
    try {
      // Find the prescription (all prescriptions are now database prescriptions)
      const prescription = allPrescriptions.find(p => p.queueNo === queueNo);
      
      if (prescription) {
        // Handle database prescription status update
        const statusData = {
          status: mapPharmacyStatusToDatabaseStatus(status),
          dispensedBy: status === 'Dispensed' ? "Pharmacist" : null // TODO: Get from user context/authentication
        };

        const response = await fetch(`http://localhost:8081/api/prescriptions/${prescription.internalId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(statusData),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log(`Updated database prescription ${queueNo} status to ${status}`);
            loadDatabasePrescriptions(); // Reload to get updated status
          } else {
            throw new Error(result.message);
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        throw new Error('Prescription not found');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Error updating prescription status: ${error.message}`);
    }
  };

  const mapPharmacyStatusToDatabaseStatus = (pharmacyStatus) => {
    switch (pharmacyStatus) {
      case 'Pending': return 'Pending';
      case 'Preparing': return 'In Progress';
      case 'Ready': return 'In Progress';
      case 'Dispensed': return 'Completed';
      default: return 'Pending';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Preparing': return 'status-preparing';
      case 'Ready': return 'status-ready';
      case 'Dispensed': return 'status-dispensed';
      default: return 'status-pending';
    }
  };

  // Filter prescriptions for display (exclude dispensed from main list)
  const activePrescriptions = (allPrescriptions || []).filter(prescription => 
    prescription && prescription.pharmacyStatus !== 'Dispensed'
  );

  const filteredPrescriptions = (activePrescriptions || []).filter(prescription =>
    prescription && (
      (prescription.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prescription.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prescription.queueNo || '').toString().includes(searchTerm)
    )
  );



  return (
    <div className="queue-container">
      {/* Header */}
      <div className="queue-header">
        <div>
          <h1 className="title">Prescription Queue</h1>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            🔄 Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        <div className="queue-stats">
          <div className="stat-card" style={{ borderLeft: '4px solid #6c757d' }}>
            <span className="stat-number">{(allPrescriptions || []).length}</span>
            <span className="stat-label">Total Prescriptions</span>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #ffc107' }}>
            <span className="stat-number" style={{ color: '#856404' }}>
              {(allPrescriptions || []).filter(p => p && p.pharmacyStatus === 'Pending').length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #28a745' }}>
            <span className="stat-number" style={{ color: '#155724' }}>
              {(allPrescriptions || []).filter(p => p && p.pharmacyStatus === 'Ready').length}
            </span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #6c757d' }}>
            <span className="stat-number" style={{ color: '#495057' }}>
              {(allPrescriptions || []).filter(p => p && p.pharmacyStatus === 'Dispensed').length}
            </span>
            <span className="stat-label">Dispensed</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by patient name, ID, or queue number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button 
          onClick={loadDatabasePrescriptions} 
          className="refresh-btn"
          disabled={loading}
        >
          🔄 {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        
      </div>

      {/* Prescription Queue Table */}
      <div className="queue-table-container">
        {filteredPrescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No prescriptions in queue</h3>
            <p>Prescriptions from doctors will appear here</p>
          </div>
        ) : (
          <div className="queue-table">
            <div className="table-header">
              <div className="header-cell student-col">Student Name</div>
              <div className="header-cell id-col">Student ID</div>
              <div className="header-cell status-col">Status</div>
              <div className="header-cell action-col">Action</div>
            </div>
            
            <div className="table-body">
              {filteredPrescriptions.map((prescription) => (
                <div className="table-row" key={prescription.queueNo}>
                  <div className="table-cell student-col">
                    <div className="student-info">
                      <FiUser size={16} className="student-icon" />
                      <div className="student-details">
                        <span className="student-name">{prescription.studentName}</span>
                        <div className="queue-time">
                          <FiClock size={12} />
                          <span>{new Date(prescription.prescriptionTime).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="table-cell id-col">
                    <span className="student-id">{prescription.studentId}</span>
                  </div>
                  <div className="table-cell status-col">
                    <div className={`status-badge ${getStatusClass(prescription.pharmacyStatus || 'Pending')}`}>
                      {prescription.pharmacyStatus || 'Pending'}
                    </div>
                  </div>
                  <div className="table-cell action-col">
                    <div className="action-buttons">
                      <button 
                        className="view-prescription-btn"
                        onClick={() => handleViewDetails(prescription)}
                        title="View Prescription Details"
                      >
                        <FiEye size={16} />
                        View Prescription
                      </button>
                      
                      {prescription.pharmacyStatus !== 'Dispensed' && (
                        <>
                          <select
                            value={prescription.pharmacyStatus || 'Pending'}
                            onChange={(e) => handleStatusUpdate(prescription.queueNo, e.target.value)}
                            className="status-select-mini"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                          </select>
                          
                          <button 
                            className="dispense-btn-mini"
                            onClick={() => handleDispense(prescription.queueNo)}
                            disabled={prescription.pharmacyStatus !== 'Ready'}
                            title="Dispense Medication"
                          >
                            <FiCheck size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Complete Prescription Details Interface */}
      {selectedPrescription && (
        <div className="prescription-details-overlay" onClick={() => setSelectedPrescription(null)}>
          <div className="prescription-details-container" onClick={(e) => e.stopPropagation()}>
            
            {/* Main Prescription Details */}
            <div className="floating-header">
              <div className="header-content">
                <div className="prescription-header-info">
                  <div className="patient-avatar">
                    <FiUser size={24} />
                  </div>
                  <div className="header-text">
                    <h1 className="patient-title">{selectedPrescription.studentName}</h1>
                    <p className="patient-subtitle">ID: {selectedPrescription.studentId} • Queue #{selectedPrescription.queueNo}</p>
                  </div>
                </div>
                
                <div className="header-status">
                  <div className={`modern-status-badge ${getStatusClass(selectedPrescription.pharmacyStatus || 'Pending')}`}>
                    <div className="status-indicator"></div>
                    <span>{selectedPrescription.pharmacyStatus || 'Pending'}</span>
                  </div>
                  <button 
                    className="modern-close-btn"
                    onClick={() => setSelectedPrescription(null)}
                    title="Close"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="modern-content-area">
              
              {/* Quick Info Panel */}
              <div className="quick-info-panel">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon doctor-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="m22 21-3-3m-2.9 1.5a3.5 3.5 0 1 1-4.9-4.9 3.5 3.5 0 0 1 4.9 4.9Z"></path>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Doctor</span>
                      <span className="info-value">{selectedPrescription.prescription.doctorName}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon time-icon">
                      <FiClock size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Prescribed</span>
                      <span className="info-value">
                        {new Date(selectedPrescription.prescriptionTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon medication-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                        <path d="m9 9 5 12 1.774-5.226L21 14 9 9z"></path>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Medications</span>
                      <span className="info-value">
                        {selectedPrescription.prescription.medications?.length || 0} items
                      </span>
                    </div>
                  </div>
                  
                
                </div>
              </div>

              {/* Medications Table */}
              {selectedPrescription.prescription.medications && selectedPrescription.prescription.medications.length > 0 && (
                <div className="medications-section">
                  <div className="section-header">
                    <h2 className="section-title">
                      <div className="title-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="m12 1 0 6m0 6 0 6M6 12l6 0m6 0 6 0"></path>
                        </svg>
                      </div>
                      Prescribed Medications
                    </h2>
                    <div className="medication-count-badge">
                      {selectedPrescription.prescription.medications.length}
                    </div>
                  </div>
                  
                  <div className="medications-table-container">
                    <table className="medications-table">
                      <thead>
                        <tr>
                          <th>Medicine Name</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Quantity</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPrescription.prescription.medications.map((medication, index) => (
                          <tr key={index}>
                            <td>
                              <div className="medicine-name-cell">
                                <div className="medicine-icon">💊</div>
                                <span className="medicine-name">{medication.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="dosage-text">{medication.dosage}</span>
                            </td>
                            <td>
                              <span className="frequency-text">{medication.frequency}</span>
                            </td>
                            <td>
                              <span className="duration-text">{medication.duration}</span>
                            </td>
                            <td>
                              <span className="quantity-text">{medication.quantity || 'N/A'}</span>
                            </td>
                            <td>
                              <span className="instructions-text">
                                {medication.instructions || 'No specific instructions'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Doctor's Notes */}
              {selectedPrescription.prescription.prescriptionText && (
                <div className="notes-section">
                  <div className="section-header">
                    <h2 className="section-title">
                      <div className="title-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14,2 14,8 20,8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                      </div>
                      Doctor's Notes
                    </h2>
                  </div>
                  <div className="notes-content">
                    <p>{selectedPrescription.prescription.prescriptionText}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Action Bar */}
            <div className="floating-action-bar">
              <div className="action-bar-content">
                <button 
                  className="modern-btn secondary"
                  onClick={() => setSelectedPrescription(null)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                  <span>Back to Queue</span>
                </button>
                
                {selectedPrescription.pharmacyStatus !== 'Dispensed' && (
                  <div className="dispense-controls">
                    <select
                      value={selectedPrescription.pharmacyStatus || 'Pending'}
                      onChange={(e) => handleStatusUpdate(selectedPrescription.queueNo, e.target.value)}
                      className="modern-status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                    </select>
                    
                    <button 
                      className="modern-btn primary"
                      onClick={async () => {
                        const success = await handleDispense(selectedPrescription.queueNo);
                        if (success) {
                          setSelectedPrescription(null);
                        }
                      }}
                      disabled={selectedPrescription.pharmacyStatus !== 'Ready'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                      <span>Dispense Medication</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionQueue;