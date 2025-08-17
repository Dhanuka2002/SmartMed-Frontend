import React, { useState, useEffect } from "react";
import { getPharmacyQueue, completePharmacyProcess, updateQueueEntryStatus } from "../../../services/queueService";
import { usePrescription } from "../../../contexts/PrescriptionContext";
import { FiCalendar, FiUser, FiClock, FiCheck, FiEye } from "react-icons/fi";
import "./PrescriptionQueue.css";

function PrescriptionQueue() {
  const { 
    prescriptions: contextPrescriptions, 
    dispensedPrescriptions: contextDispensedPrescriptions,
    dispensePrescription, 
    addPrescription,
    updatePrescriptionStatus,
    clearAllPrescriptions: clearContextPrescriptions
  } = usePrescription();
  const [legacyPrescriptions, setLegacyPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update last updated timestamp when prescriptions change
  useEffect(() => {
    setLastUpdated(new Date());
  }, [contextPrescriptions, contextDispensedPrescriptions, legacyPrescriptions]);

  // Load legacy pharmacy queue data (for compatibility)
  useEffect(() => {
    // Auto-clear old Kane data on component load
    const pharmacyQueue = JSON.parse(localStorage.getItem('pharmacyQueue') || '[]');
    const hasKaneData = pharmacyQueue.some(p => 
      p.studentName === "Kane" || p.studentName === "Test Student"
    );
    
    if (hasKaneData) {
      console.log('Clearing old Kane/test data...');
      const filteredQueue = pharmacyQueue.filter(prescription => 
        prescription.studentName !== "Kane" && 
        prescription.studentName !== "Test Student" &&
        prescription.studentId !== "TEST001"
      );
      localStorage.setItem('pharmacyQueue', JSON.stringify(filteredQueue));
    }
    
    loadLegacyPrescriptions();
    const interval = setInterval(loadLegacyPrescriptions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadLegacyPrescriptions = () => {
    const pharmacyQueue = getPharmacyQueue();
    setLegacyPrescriptions(pharmacyQueue);
  };

  // Combine all prescriptions (pending, dispensed, and legacy)
  const allPrescriptions = [
    // Active context prescriptions (pending/preparing/ready)
    ...(contextPrescriptions || []).map((prescription, index) => {
      console.log(`Mapping prescription ${index}:`, {
        id: prescription.id,
        patientName: prescription.patientName,
        patientId: prescription.patientId,
        doctorName: prescription.doctorName
      });
      
      return {
        queueNo: prescription.queueNumber || prescription.id, // Use queueNumber if available, fallback to id
        internalId: prescription.id, // Keep internal ID for operations
        studentName: prescription.patientName,
        studentId: prescription.patientId,
        email: `${prescription.patientId}@student.university.edu`,
        phone: "+1234567890",
        prescriptionTime: prescription.createdAt || new Date().toISOString(),
        pharmacyStatus: prescription.pharmacyStatus || (prescription.status === 'pending' ? 'Pending' : 'Dispensed'),
        isContextPrescription: true, // Mark as context prescription
        prescription: {
          doctorName: prescription.doctorName,
          prescriptionDate: prescription.prescriptionDate,
          prescriptionText: "",
          medications: (prescription.medicines || []).map(med => ({
            name: med.medicineName,
            dosage: med.dosage,
            frequency: med.instructions,
            duration: `${med.quantity} units`,
            instructions: med.instructions
          }))
        }
      };
    }),
    // Dispensed context prescriptions
    ...(contextDispensedPrescriptions || []).map(prescription => ({
      queueNo: prescription.queueNumber || prescription.id, // Use queueNumber if available, fallback to id
      internalId: prescription.id, // Keep internal ID for operations
      studentName: prescription.patientName,
      studentId: prescription.patientId,
      email: `${prescription.patientId}@student.university.edu`,
      phone: "+1234567890",
      prescriptionTime: prescription.createdAt || new Date().toISOString(),
      pharmacyStatus: 'Dispensed',
      isContextPrescription: true,
      prescription: {
        doctorName: prescription.doctorName,
        prescriptionDate: prescription.prescriptionDate,
        prescriptionText: "",
        medications: (prescription.medicines || []).map(med => ({
          name: med.medicineName,
          dosage: med.dosage,
          frequency: med.instructions,
          duration: `${med.quantity} units`,
          instructions: med.instructions
        }))
      }
    })),
    // Legacy prescriptions (filter out test data)
    ...(legacyPrescriptions || []).filter(prescription => 
      prescription && 
      prescription.studentName && 
      prescription.studentName !== "Kane" && 
      prescription.studentName !== "Test Student" &&
      prescription.studentId &&
      prescription.studentId !== "TEST001"
    )
  ];

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const handleDispense = async (queueNo) => {
    try {
      // Find the prescription to check if it's a context prescription
      const prescription = allPrescriptions.find(p => p.queueNo === queueNo);
      
      if (prescription && prescription.isContextPrescription) {
        // Use context dispensing for dynamic prescriptions (use internal ID)
        const success = dispensePrescription(prescription.internalId || prescription.queueNo);
        if (success) {
          alert('Prescription dispensed successfully!');
        } else {
          alert('Error dispensing prescription');
        }
      } else {
        // Use legacy dispensing for old queue system
        await completePharmacyProcess(queueNo);
        alert('Prescription dispensed successfully!');
        loadLegacyPrescriptions();
      }
    } catch (error) {
      console.error('Error dispensing prescription:', error);
      alert('Error dispensing prescription');
    }
  };

  const handleStatusUpdate = async (queueNo, status) => {
    try {
      // Find the prescription to check if it's a context prescription
      const prescription = allPrescriptions.find(p => p.queueNo === queueNo);
      
      if (prescription && prescription.isContextPrescription) {
        // Use context status update for dynamic prescriptions (use internal ID)
        updatePrescriptionStatus(prescription.internalId || prescription.queueNo, status);
        console.log(`Updated prescription ${queueNo} status to ${status}`);
      } else {
        // Use legacy status update for old queue system
        await updateQueueEntryStatus('pharmacy', queueNo, { pharmacyStatus: status });
        loadLegacyPrescriptions();
        console.log(`Updated legacy prescription ${queueNo} status to ${status}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating prescription status');
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

  // Function to clear old test data
  const clearOldTestData = () => {
    const pharmacyQueue = JSON.parse(localStorage.getItem('pharmacyQueue') || '[]');
    const filteredQueue = pharmacyQueue.filter(prescription => 
      prescription.studentName !== "Kane" && 
      prescription.studentName !== "Test Student" &&
      prescription.studentId !== "TEST001"
    );
    localStorage.setItem('pharmacyQueue', JSON.stringify(filteredQueue));
    loadLegacyPrescriptions();
    alert('Old test data cleared!');
  };

  // Function to clear all prescriptions (for testing)
  const clearAllPrescriptions = () => {
    if (window.confirm('This will clear ALL prescriptions. Continue?')) {
      clearContextPrescriptions();
      localStorage.removeItem('pharmacyQueue');
      setLegacyPrescriptions([]);
      alert('All prescriptions cleared!');
    }
  };

  // Demo function to add sample prescription
  const addSamplePrescription = () => {
    const samplePatients = [
      { name: "Franklin John", id: "22IT099" },
      { name: "Sarah Wilson", id: "22CS045" },
      { name: "Mike Johnson", id: "22ME078" },
      { name: "Emma Davis", id: "22EE032" },
      { name: "Alex Brown", id: "22CE021" },
      { name: "Lisa Garcia", id: "22BM067" },
      { name: "David Lee", id: "22CS088" },
      { name: "Sophie Chen", id: "22IT055" },
      { name: "Ryan Thompson", id: "22ME033" },
      { name: "Maria Rodriguez", id: "22EE044" }
    ];
    const sampleDoctors = ["Dr. Smith", "Dr. Johnson", "Dr. Brown", "Dr. Davis", "Dr. Wilson"];
    
    // Ensure unique selection by adding timestamp
    const timestamp = Date.now();
    const randomIndex = Math.floor(Math.random() * samplePatients.length);
    const selectedPatient = samplePatients[randomIndex];
    const randomDoctor = sampleDoctors[Math.floor(Math.random() * sampleDoctors.length)];
    
    const samplePrescription = {
      patientName: selectedPatient.name,
      patientId: selectedPatient.id,
      doctorName: randomDoctor,
      uniqueId: `DEMO_${timestamp}_${randomIndex}`, // Add unique identifier
      medicines: [
        { 
          medicineId: 1, 
          medicineName: "Paracetamol", 
          quantity: Math.floor(Math.random() * 15) + 5, 
          dosage: "500mg", 
          instructions: "Take 1 tablet twice daily after meals" 
        },
        { 
          medicineId: 2, 
          medicineName: "Amoxicillin", 
          quantity: Math.floor(Math.random() * 10) + 5, 
          dosage: "250mg", 
          instructions: "Take 1 tablet three times daily" 
        }
      ]
    };
    
    console.log('Adding demo prescription for:', selectedPatient.name, selectedPatient.id);
    addPrescription(samplePrescription);
  };

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
          <div className="stat-card" style={{ borderLeft: '4px solid #17a2b8' }}>
            <span className="stat-number" style={{ color: '#0c5460' }}>
              {(allPrescriptions || []).filter(p => p && p.pharmacyStatus === 'Preparing').length}
            </span>
            <span className="stat-label">Preparing</span>
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
        <button onClick={loadLegacyPrescriptions} className="refresh-btn">
          🔄 Refresh
        </button>
        <button onClick={addSamplePrescription} className="refresh-btn" style={{ marginLeft: '10px', backgroundColor: '#28a745' }}>
          + Add Demo Student
        </button>
        <button onClick={clearOldTestData} className="refresh-btn" style={{ marginLeft: '10px', backgroundColor: '#dc3545' }}>
          🗑️ Clear Old Data
        </button>
        <button onClick={clearAllPrescriptions} className="refresh-btn" style={{ marginLeft: '10px', backgroundColor: '#dc3545' }}>
          🗑️ Clear All
        </button>
        <div style={{ marginLeft: '20px', fontSize: '12px', color: '#666' }}>
          Context: {(contextPrescriptions || []).length} Active + {(contextDispensedPrescriptions || []).length} Dispensed | Legacy: {(legacyPrescriptions || []).length} | Total: {(allPrescriptions || []).length}
        </div>
      </div>

      {/* Prescription Cards */}
      <div className="cards">
        {filteredPrescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No prescriptions in queue</h3>
            <p>Prescriptions from doctors will appear here</p>
          </div>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <div className="card" key={prescription.queueNo}>
              <div className="card-header">
                <div className="patient-info">
                  <h3 className="patient-name">{prescription.studentName}</h3>
                  <div className="patient-details">
                    <span className="patient-id">
                      <FiUser size={14} />
                      {prescription.studentId}
                    </span>
                    <span className="queue-number">
                      Queue #{prescription.queueNo}
                    </span>
                  </div>
                </div>
                <div className={`status-badge ${getStatusClass(prescription.pharmacyStatus || 'Pending')}`}>
                  {prescription.pharmacyStatus || 'Pending'}
                </div>
              </div>

              <div className="prescription-info">
                <div className="prescription-meta">
                  <span className="prescription-date">
                    <FiCalendar size={14} />
                    {new Date(prescription.prescriptionTime).toLocaleDateString()}
                  </span>
                  <span className="prescription-time">
                    <FiClock size={14} />
                    {new Date(prescription.prescriptionTime).toLocaleTimeString()}
                  </span>
                  <span className="doctor-name">
                    👨‍⚕️ {prescription.prescription.doctorName}
                  </span>
                </div>

                {/* Prescription Preview */}
                <div className="prescription-preview">
                  {prescription.prescription.prescriptionText && (
                    <div className="prescription-text">
                      <strong>Notes:</strong>
                      <p>{prescription.prescription.prescriptionText.substring(0, 100)}...</p>
                    </div>
                  )}
                  
                  {prescription.prescription.medications && prescription.prescription.medications.length > 0 && (
                    <div className="medications-preview">
                      <strong>Medications ({prescription.prescription.medications.length}):</strong>
                      <ul>
                        {prescription.prescription.medications.slice(0, 2).map((med, index) => (
                          <li key={index}>
                            {med.name} {med.dosage} - {med.frequency}
                          </li>
                        ))}
                        {prescription.prescription.medications.length > 2 && (
                          <li>...and {prescription.prescription.medications.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => handleViewDetails(prescription)}
                >
                  <FiEye size={16} />
                  View Details
                </button>
                
                {prescription.pharmacyStatus !== 'Dispensed' && (
                  <>
                    <select
                      value={prescription.pharmacyStatus || 'Pending'}
                      onChange={(e) => handleStatusUpdate(prescription.queueNo, e.target.value)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                    </select>
                    
                    <button 
                      className="action-btn dispense-btn"
                      onClick={() => handleDispense(prescription.queueNo)}
                      disabled={prescription.pharmacyStatus !== 'Ready'}
                    >
                      <FiCheck size={16} />
                      Dispense
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="modal-overlay" onClick={() => setSelectedPrescription(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Prescription Details - Queue #{selectedPrescription.queueNo}</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedPrescription(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Patient Information */}
              <div className="section">
                <h4>Patient Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedPrescription.studentName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Student ID:</label>
                    <span>{selectedPrescription.studentId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedPrescription.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedPrescription.phone}</span>
                  </div>
                </div>
              </div>

              {/* Prescription Information */}
              <div className="section">
                <h4>Prescription Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Doctor:</label>
                    <span>{selectedPrescription.prescription.doctorName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{new Date(selectedPrescription.prescription.prescriptionDate).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status ${getStatusClass(selectedPrescription.pharmacyStatus)}`}>
                      {selectedPrescription.pharmacyStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                {selectedPrescription.prescription.prescriptionText && (
                  <div className="prescription-notes">
                    <label>Doctor's Notes:</label>
                    <div className="notes-content">
                      {selectedPrescription.prescription.prescriptionText}
                    </div>
                  </div>
                )}
              </div>

              {/* Medications */}
              {selectedPrescription.prescription.medications && selectedPrescription.prescription.medications.length > 0 && (
                <div className="section">
                  <h4>Medications</h4>
                  <div className="medications-list">
                    {selectedPrescription.prescription.medications.map((medication, index) => (
                      <div key={index} className="medication-item">
                        <div className="medication-name">{medication.name}</div>
                        <div className="medication-details">
                          <span><strong>Dosage:</strong> {medication.dosage}</span>
                          <span><strong>Frequency:</strong> {medication.frequency}</span>
                          <span><strong>Duration:</strong> {medication.duration}</span>
                          {medication.instructions && (
                            <span><strong>Instructions:</strong> {medication.instructions}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedPrescription(null)}
              >
                Close
              </button>
              {selectedPrescription.pharmacyStatus !== 'Dispensed' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    handleDispense(selectedPrescription.queueNo);
                    setSelectedPrescription(null);
                  }}
                  disabled={selectedPrescription.pharmacyStatus !== 'Ready'}
                >
                  Dispense Medication
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionQueue;