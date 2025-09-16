import React, { useState, useEffect } from "react";
// Removed unused imports - only using database prescriptions now
import { FiCalendar, FiUser, FiClock, FiCheck, FiEye } from "react-icons/fi";
import { usePrescription } from "../../../contexts/PrescriptionContext";
import PrescriptionDisplay from "../../common/PrescriptionDisplay/PrescriptionDisplay";
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';
import "./PrescriptionQueue.css";

function PrescriptionQueue() {
  const [databasePrescriptions, setDatabasePrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const { alertState, showSuccess, showError, hideAlert } = useAlert();
  
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
            
            showSuccess('Prescription dispensed successfully!', 'Prescription Dispensed');
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
      showError(`Error dispensing prescription: ${error.message}`, 'Dispense Failed');
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
      showError(`Error updating prescription status: ${error.message}`, 'Status Update Failed');
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

      {/* Professional Prescription Display */}
      {selectedPrescription && (
        <PrescriptionDisplay 
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          showDownload={true}
          showPharmacyActions={true}
          onStatusUpdate={handleStatusUpdate}
          onDispense={async (queueNo) => {
            const success = await handleDispense(queueNo);
            if (success) {
              setSelectedPrescription(null);
            }
          }}
        />
      )}
    </div>
  );
}

export default PrescriptionQueue;