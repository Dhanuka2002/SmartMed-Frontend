/*import React from "react";
import "./DoctorPatient.css";
import qr from "../../../assets/qr.png";
import patientAvatar from "../../../assets/student.jpg"; // Replace with your actual avatar image path

function DoctorPatient() {
  return (
    <div className="doctor-patient-container">
      <div className="patient-header">
        <div className="patient-avatar">
          <img src={patientAvatar} alt="Patient Avatar" />
          <h3>Franklin Jhon</h3>
        </div>

        <div className="patient-profile-box">
          <h4>Franklin Jhon</h4>
          <p>ID: 22IT099</p>
          <p>Division: IT</p>
          <p>Allergies: Penicillin</p>
          <img src={qr} alt="QR Code" className="qr-img" />
          <button className="health-history-btn">Health History</button>
        </div>
      </div>

      <div className="prescription-box">
        <h4>Prescription</h4>
        <textarea placeholder="Write prescription here..."></textarea>
        <button className="esign-btn">e - Sign</button>
      </div>
    </div>
  );
}

export default DoctorPatient;
*/


import React, { useState, useEffect } from "react";
import { addPrescriptionAndMoveToPharmacy } from "../../../services/queueService";
import { usePrescription } from "../../../contexts/PrescriptionContext";
import { useMedicineInventory } from "../../../contexts/MedicineInventoryContext";
import "./DoctorPatient.css";
import qr from "../../../assets/qr.png";
import patientAvatar from "../../../assets/student.jpg";
import Avatar from "../../common/Avatar/Avatar";

function DoctorPatient() {
  const { addPrescription } = usePrescription();
  const { medicines: medicineInventory, searchMedicines, getCategories, dispenseMedicines } = useMedicineInventory();
  const [prescriptionText, setPrescriptionText] = useState("");
  const [activeTab, setActiveTab] = useState("prescription");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: ""
  });
  const [medications, setMedications] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(-1);
  const [currentSearchItemId, setCurrentSearchItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [patientFormData, setPatientFormData] = useState(null);

  // Function to load patient form data and profile image from multiple sources
  const loadPatientFormData = (patient) => {
    if (!patient) {
      setPatientFormData(null);
      return;
    }

    let profileImageSrc = null;
    
    // Method 1: Check if profile image is already in the medical data
    if (patient.medicalData?.student?.profileImage) {
      profileImageSrc = patient.medicalData.student.profileImage;
    }
    
    // Method 2: Check studentFormData in localStorage by email
    const formData = localStorage.getItem('studentFormData');
    if (formData) {
      try {
        const parsedFormData = JSON.parse(formData);
        if (parsedFormData.email === patient.email || 
            parsedFormData.fullName === patient.studentName ||
            parsedFormData.studentRegistrationNumber === patient.studentId) {
          setPatientFormData(parsedFormData);
          if (parsedFormData.profileImage && !profileImageSrc) {
            profileImageSrc = parsedFormData.profileImage;
          }
          return;
        }
      } catch (error) {
        console.error('Error parsing studentFormData:', error);
      }
    }
    
    // Method 3: Check for student-specific data in localStorage
    const studentDataKey = `studentData_${patient.email}`;
    const studentData = localStorage.getItem(studentDataKey);
    if (studentData) {
      try {
        const parsedStudentData = JSON.parse(studentData);
        if (parsedStudentData.profileImage && !profileImageSrc) {
          profileImageSrc = parsedStudentData.profileImage;
        }
        setPatientFormData({
          ...parsedStudentData,
          profileImage: profileImageSrc || parsedStudentData.profileImage
        });
        return;
      } catch (error) {
        console.error('Error parsing student data:', error);
      }
    }
    
    // Method 4: Create minimal form data with available profile image
    if (profileImageSrc) {
      setPatientFormData({
        profileImage: profileImageSrc,
        email: patient.email,
        fullName: patient.studentName
      });
    } else {
      // No profile image found, set empty form data
      setPatientFormData({
        email: patient.email,
        fullName: patient.studentName,
        profileImage: null
      });
    }
  };

  // Function to get the profile image source with fallback logic
  const getProfileImageSrc = () => {
    // Priority order for profile image sources:
    
    // 1. From patientFormData (localStorage studentFormData)
    if (patientFormData?.profileImage) {
      return patientFormData.profileImage;
    }
    
    // 2. From medical data (if included in QR scan data)
    if (selectedPatient?.medicalData?.student?.profileImage) {
      return selectedPatient.medicalData.student.profileImage;
    }
    
    // 3. From patient queue data (if profile image was stored there)
    if (selectedPatient?.profileImage) {
      return selectedPatient.profileImage;
    }
    
    // 4. Check current user data (if same student)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        if (userData.email === selectedPatient?.email && userData.profileImage) {
          return userData.profileImage;
        }
      } catch (error) {
        console.error('Error parsing currentUser data:', error);
      }
    }
    
    // 5. Return null to use Avatar component's fallback (initials)
    return null;
  };

  // Load selected patient from localStorage (set from DoctorQueue)
  useEffect(() => {
    const loadSelectedPatient = () => {
      const storedPatient = localStorage.getItem('selectedPatient');
      if (storedPatient) {
        const patient = JSON.parse(storedPatient);
        const previousPatient = selectedPatient;
        setSelectedPatient(patient);
        
        // Show notification when a new patient is selected
        if (previousPatient && previousPatient.queueNo !== patient.queueNo) {
          setNotification({
            type: 'info',
            message: `New patient selected: ${patient.studentName} (Queue #${patient.queueNo})`
          });
          setTimeout(() => setNotification(null), 5000);
        } else if (!previousPatient) {
          setNotification({
            type: 'success',
            message: `Patient loaded: ${patient.studentName} (Queue #${patient.queueNo})`
          });
          setTimeout(() => setNotification(null), 3000);
        }
        
        // Load medical data if available
        if (patient.medicalData && patient.medicalData.examination) {
          const examination = patient.medicalData.examination;
          setVitals({
            bloodPressure: examination.examination?.circulation?.bloodPressure || "",
            heartRate: examination.examination?.circulation?.pulse || "",
            temperature: "98.6°F", // Default
            weight: examination.physicalMeasurements?.weight || "",
            height: examination.physicalMeasurements?.height || ""
          });
        }
        
        // Load patient image from multiple sources
        loadPatientFormData(patient);
      } else {
        if (selectedPatient) {
          setNotification({
            type: 'warning',
            message: 'No patient currently selected'
          });
          setTimeout(() => setNotification(null), 3000);
        }
        setSelectedPatient(null);
      }
    };

    // Load initially
    loadSelectedPatient();

    // Set up listener for localStorage changes (when new patient is selected)
    const handleStorageChange = (e) => {
      if (e.key === 'selectedPatient') {
        loadSelectedPatient();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes every 2 seconds in case storage event doesn't fire
    const interval = setInterval(loadSelectedPatient, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Default patient info if no patient selected
  const patientInfo = selectedPatient ? {
    name: selectedPatient.studentName,
    id: selectedPatient.studentId,
    queueNo: selectedPatient.queueNo,
    age: selectedPatient.medicalData?.student?.age || "N/A",
    gender: selectedPatient.medicalData?.student?.gender || "N/A",
    division: selectedPatient.medicalData?.student?.academicDivision || "N/A",
    phone: selectedPatient.phone,
    email: selectedPatient.email,
    allergies: extractAllergies(selectedPatient.medicalData),
    medicalConditions: extractMedicalConditions(selectedPatient.medicalData),
    bloodType: selectedPatient.medicalData?.examination?.examination?.clinicalTests?.bloodGroup || "N/A",
    lastVisit: new Date(selectedPatient.addedTime).toLocaleDateString(),
    emergencyContact: selectedPatient.medicalData?.student?.emergencyContact?.telephone || "N/A",
    emergencyContactName: selectedPatient.medicalData?.student?.emergencyContact?.name || "N/A",
    emergencyContactRelation: selectedPatient.medicalData?.student?.emergencyContact?.relationship || "N/A"
  } : {
    name: "No Patient Selected",
    id: "N/A",
    age: "N/A",
    gender: "N/A",
    division: "N/A",
    phone: "N/A",
    email: "N/A",
    allergies: ["No patient selected"],
    medicalConditions: ["No patient selected"],
    bloodType: "N/A",
    lastVisit: "N/A",
    emergencyContact: "N/A",
    emergencyContactName: "N/A",
    emergencyContactRelation: "N/A"
  };

  // Extract allergies from medical data
  function extractAllergies(medicalData) {
    if (!medicalData || !medicalData.student || !medicalData.student.studentMedicalHistory) {
      return ["No allergies recorded"];
    }
    
    const allergicHistory = medicalData.student.studentMedicalHistory.allergicHistory;
    if (allergicHistory && allergicHistory.status === 'yes' && allergicHistory.details) {
      return [allergicHistory.details];
    }
    
    return ["No known allergies"];
  }

  // Extract medical conditions from medical data
  function extractMedicalConditions(medicalData) {
    if (!medicalData || !medicalData.student || !medicalData.student.studentMedicalHistory) {
      return ["No conditions recorded"];
    }
    
    const conditions = [];
    const medHistory = medicalData.student.studentMedicalHistory;
    
    if (medHistory.significantMedicalHistory && medHistory.significantMedicalHistory.status === 'yes') {
      conditions.push(medHistory.significantMedicalHistory.details);
    }
    
    if (medHistory.chronicIllness && medHistory.chronicIllness.status === 'yes') {
      conditions.push(`Chronic: ${medHistory.chronicIllness.details}`);
    }
    
    if (medHistory.surgicalHistory && medHistory.surgicalHistory.status === 'yes') {
      conditions.push(`Surgery: ${medHistory.surgicalHistory.details}`);
    }
    
    return conditions.length > 0 ? conditions : ["No significant conditions"];
  }

  // Generate medical history from patient data
  const getMedicalHistory = () => {
    if (!selectedPatient?.medicalData) {
      return [
        { date: "No data", condition: "No patient selected", doctor: "N/A" }
      ];
    }

    const history = [];
    const medData = selectedPatient.medicalData;
    const recordDate = new Date(medData.timestamp).toLocaleDateString();

    // Add current medical record entry
    history.push({
      date: recordDate,
      condition: "Medical Examination & Assessment",
      doctor: "Medical Center",
      details: "Comprehensive medical examination completed"
    });

    // Add vaccination status
    if (medData.examination?.vaccinationStatus === 'yes') {
      history.push({
        date: recordDate,
        condition: "Vaccination Record",
        doctor: "Medical Center",
        details: "Student vaccination status verified"
      });
    }

    // Add any significant medical history
    const medHistory = medData.student?.studentMedicalHistory;
    if (medHistory?.significantMedicalHistory?.status === 'yes') {
      history.push({
        date: "Previous",
        condition: "Significant Medical History",
        doctor: "Previous Records",
        details: medHistory.significantMedicalHistory.details
      });
    }

    // Add chronic illness if any
    if (medHistory?.chronicIllness?.status === 'yes') {
      history.push({
        date: "Ongoing",
        condition: "Chronic Condition",
        doctor: "Previous Records",
        details: medHistory.chronicIllness.details
      });
    }

    // Add surgical history if any
    if (medHistory?.surgicalHistory?.status === 'yes') {
      history.push({
        date: "Previous",
        condition: "Surgical History",
        doctor: "Previous Records",
        details: medHistory.surgicalHistory.details
      });
    }

    return history.length > 1 ? history : [
      { date: recordDate, condition: "First Visit - Medical Assessment", doctor: "Medical Center", details: "Initial comprehensive examination" }
    ];
  };

  const medicalHistory = getMedicalHistory();

  // Medicine inventory is now managed by the MedicineInventoryContext
  // and will include both system medicines and pharmacist-added medicines

  const commonPrescriptions = [
    {
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "3 days",
      instructions: "Take after meals"
    },
    {
      name: "Amoxicillin",
      dosage: "250mg",
      frequency: "Three times daily",
      duration: "7 days", 
      instructions: "Complete the full course"
    },
    {
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "As needed",
      duration: "5 days",
      instructions: "Take with food, maximum 3 times daily"
    },
    {
      name: "Vitamin D3",
      dosage: "1000IU",
      frequency: "Once daily",
      duration: "30 days",
      instructions: "Take with breakfast"
    }
  ];

  const handlePrescriptionAdd = (prescription) => {
    const newText = prescriptionText ? 
      `${prescriptionText}\n• ${prescription.name} ${prescription.dosage} - ${prescription.frequency} for ${prescription.duration} (${prescription.instructions})` : 
      `• ${prescription.name} ${prescription.dosage} - ${prescription.frequency} for ${prescription.duration} (${prescription.instructions})`;
    setPrescriptionText(newText);
  };

  const addPrescriptionItem = () => {
    const newItem = {
      id: Date.now(),
      medicineId: null,
      medicineName: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: "",
      instructions: "",
      availableStock: 0
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
  };

  const updatePrescriptionItem = (id, field, value) => {
    setPrescriptionItems(prescriptionItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If medicine name is selected, auto-fill dosage and update stock info
        if (field === 'medicineName') {
          const medicine = medicineInventory.find(med => med.name === value);
          if (medicine) {
            updatedItem.medicineId = medicine.id;
            updatedItem.dosage = medicine.dosage;
            updatedItem.availableStock = medicine.quantity;
          } else {
            updatedItem.medicineId = null;
            updatedItem.availableStock = 0;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removePrescriptionItem = (id) => {
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== id));
  };

  const addQuickMedicine = (commonMed) => {
    const medicine = medicineInventory.find(med => med.name === commonMed.name);
    const newItem = {
      id: Date.now(),
      medicineId: medicine ? medicine.id : null,
      medicineName: commonMed.name,
      dosage: commonMed.dosage,
      frequency: commonMed.frequency,
      duration: commonMed.duration,
      quantity: calculateQuantity(commonMed.frequency, commonMed.duration),
      instructions: commonMed.instructions,
      availableStock: medicine ? medicine.quantity : 0
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
  };

  const calculateQuantity = (frequency, duration) => {
    const freqMap = {
      "Once daily": 1,
      "Twice daily": 2,
      "Three times daily": 3,
      "Four times daily": 4,
      "As needed": 2 // Default assumption
    };
    
    const durationDays = parseInt(duration.split(' ')[0]) || 1;
    const dailyDose = freqMap[frequency] || 1;
    
    return Math.ceil(durationDays * dailyDose);
  };

  // Enhanced medicine search functionality
  const filteredMedicines = searchMedicines(medicineSearch);

  const handleMedicineSelect = (medicine, itemId) => {
    updatePrescriptionItem(itemId, 'medicineName', medicine.name);
    setMedicineSearch('');
    setShowMedicineDropdown(false);
    setSelectedMedicineIndex(-1);
    setCurrentSearchItemId(null);
  };

  const handleKeyDown = (e, itemId) => {
    if (!showMedicineDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMedicineIndex(prev => 
        prev < filteredMedicines.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMedicineIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedMedicineIndex >= 0) {
        handleMedicineSelect(filteredMedicines[selectedMedicineIndex], itemId);
      }
    } else if (e.key === 'Escape') {
      setShowMedicineDropdown(false);
      setSelectedMedicineIndex(-1);
    }
  };

  const addMedication = () => {
    const newMedication = {
      id: Date.now(),
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: ""
    };
    setMedications([...medications, newMedication]);
  };

  const updateMedication = (id, field, value) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const removeMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleSign = async () => {
    if (!selectedPatient) {
      alert("No patient selected.");
      return;
    }

    if (!prescriptionText.trim() && medications.length === 0 && prescriptionItems.length === 0) {
      alert("Please add prescription details before signing.");
      return;
    }

    // Validate prescription items
    const invalidItems = prescriptionItems.filter(item => 
      !item.medicineName || !item.frequency || !item.duration || !item.quantity
    );
    
    if (invalidItems.length > 0) {
      alert("Please complete all prescription item details before sending to pharmacy.");
      return;
    }

    // Check inventory availability
    const insufficientStock = prescriptionItems.filter(item => {
      const medicine = medicineInventory.find(med => med.id === item.medicineId);
      return medicine && parseInt(item.quantity) > medicine.quantity;
    });

    if (insufficientStock.length > 0) {
      const insufficientNames = insufficientStock.map(item => item.medicineName).join(', ');
      if (!confirm(`Warning: Insufficient stock for ${insufficientNames}. Continue anyway?`)) {
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create prescription medicines array from new prescription items
      const prescriptionMedicines = [
        // From structured prescription items
        ...prescriptionItems.map(item => ({
          medicineId: item.medicineId || Date.now(),
          medicineName: item.medicineName,
          quantity: parseInt(item.quantity) || 1,
          dosage: item.dosage,
          instructions: `${item.frequency} for ${item.duration} - ${item.instructions}`.trim()
        })),
        // From legacy medication entries
        ...medications.map((med, index) => ({
          medicineId: Date.now() + index,
          medicineName: med.name,
          quantity: parseInt(med.duration) || 10,
          dosage: med.dosage,
          instructions: `${med.frequency} - ${med.instructions}`.trim()
        }))
      ];

      // Add text-based prescriptions as additional medicines
      if (prescriptionText.trim()) {
        const textPrescriptions = prescriptionText.split('\n').filter(line => line.trim());
        textPrescriptions.forEach((prescription, index) => {
          if (prescription.trim()) {
            prescriptionMedicines.push({
              medicineId: Date.now() + prescriptionMedicines.length + index,
              medicineName: prescription.trim(),
              quantity: 1,
              dosage: "As prescribed",
              instructions: "Take as directed by doctor"
            });
          }
        });
      }

      // Create prescription object for pharmacy context
      const prescriptionData = {
        patientName: patientInfo.name,
        patientId: patientInfo.id,
        doctorName: "Dr. Smith", // You can get this from user context
        medicines: prescriptionMedicines
      };

      // Add prescription to context (this will make it appear in pharmacy queue)
      const prescriptionId = addPrescription(prescriptionData);
      
      // Update inventory quantities when prescription is sent
      dispenseMedicines(prescriptionMedicines);

      // Also maintain the existing queue service for compatibility
      const legacyPrescription = {
        prescriptionText,
        medications: [...medications, ...prescriptionItems.map(item => ({
          name: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions
        }))],
        doctorName: "Dr. Smith",
        prescriptionDate: new Date().toISOString(),
        patientName: patientInfo.name,
        patientId: patientInfo.id,
        queueNo: patientInfo.queueNo,
        status: "Prescribed",
        instructions: "Take as directed"
      };

      await addPrescriptionAndMoveToPharmacy(selectedPatient.queueNo, legacyPrescription);
      
      alert(`Prescription #${prescriptionId} sent to pharmacy successfully! Patient ${patientInfo.name} moved to pharmacy queue.`);
      
      // Clear the form
      setPrescriptionText("");
      setMedications([]);
      setPrescriptionItems([]);
      
      // Clear selected patient
      localStorage.removeItem('selectedPatient');
      setSelectedPatient(null);
      
    } catch (error) {
      console.error('Error sending prescription:', error);
      alert('Error sending prescription to pharmacy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="doctor-patient-container">
      {/* Notification Display */}
      {notification && (
        <div className={`notification ${notification.type}`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          color: 'white',
          fontWeight: '500',
          zIndex: 1000,
          maxWidth: '400px',
          background: notification.type === 'success' ? '#28a745' :
                     notification.type === 'warning' ? '#ffc107' :
                     notification.type === 'error' ? '#dc3545' : '#17a2b8',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span>{notification.type === 'success' ? '✅' : 
                    notification.type === 'warning' ? '⚠️' : 
                    notification.type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Patient Header Section */}
      <div className="patient-header-section">
        <div className="patient-card">
          <div className="patient-avatar-section">
            <div className="avatar-container">
              <Avatar 
                src={getProfileImageSrc()}
                alt={patientInfo.name || 'Patient'}
                size="large"
                className="patient-avatar-img"
              />
              <div className="status-indicator online"></div>
            </div>
            <div className="patient-basic-info">
              <h2 className="patient-name">{patientInfo.name}</h2>
              <p className="patient-id">Patient ID: {patientInfo.id}</p>
              <div className="patient-tags">
                {selectedPatient && <span className="tag queue">Queue #{patientInfo.queueNo}</span>}
                <span className="tag division">{patientInfo.division}</span>
                {!selectedPatient && <span className="tag no-patient">No Patient</span>}
              </div>
            </div>
          </div>

          <div className="patient-details-grid">
            <div className="detail-card">
              <div className="detail-icon">👤</div>
              <div className="detail-content">
                <span className="detail-label">Age & Gender</span>
                <span className="detail-value">{patientInfo.age} years, {patientInfo.gender}</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">🩸</div>
              <div className="detail-content">
                <span className="detail-label">Blood Type</span>
                <span className="detail-value">{patientInfo.bloodType}</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">⚠️</div>
              <div className="detail-content">
                <span className="detail-label">Allergies</span>
                <span className="detail-value">{patientInfo.allergies.join(", ")}</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">🏥</div>
              <div className="detail-content">
                <span className="detail-label">Medical Conditions</span>
                <span className="detail-value">{patientInfo.medicalConditions.join(", ")}</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">📞</div>
              <div className="detail-content">
                <span className="detail-label">Contact</span>
                <span className="detail-value">{patientInfo.phone}</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">📧</div>
              <div className="detail-content">
                <span className="detail-label">Email</span>
                <span className="detail-value">{patientInfo.email}</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">🚨</div>
              <div className="detail-content">
                <span className="detail-label">Emergency Contact</span>
                <span className="detail-value">{patientInfo.emergencyContactName} ({patientInfo.emergencyContactRelation}) - {patientInfo.emergencyContact}</span>
              </div>
            </div>
          </div>

          <div className="qr-section">
            <div className="qr-container">
              <img src={qr} alt="Patient QR Code" className="qr-code" />
              <p className="qr-label">Patient QR Code</p>
            </div>
            <button className="action-btn secondary">
              <span className="btn-icon">📋</span>
              View Full Profile
            </button>
          </div>
        </div>
      </div>

      {/* Vitals Section */}
      <div className="vitals-section">
        <h3 className="section-title">Current Vitals</h3>
        <div className="vitals-grid">
          <div className="vital-card">
            <div className="vital-icon">❤️</div>
            <div className="vital-info">
              <span className="vital-label">Heart Rate</span>
              <span className="vital-value">{vitals.heartRate}</span>
            </div>
          </div>
          
          <div className="vital-card">
            <div className="vital-icon">🌡️</div>
            <div className="vital-info">
              <span className="vital-label">Temperature</span>
              <span className="vital-value">{vitals.temperature}</span>
            </div>
          </div>
          
          <div className="vital-card">
            <div className="vital-icon">📈</div>
            <div className="vital-info">
              <span className="vital-label">Blood Pressure</span>
              <span className="vital-value">{vitals.bloodPressure}</span>
            </div>
          </div>
          
          <div className="vital-card">
            <div className="vital-icon">⚖️</div>
            <div className="vital-info">
              <span className="vital-label">Weight</span>
              <span className="vital-value">{vitals.weight}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="content-tabs">
        <div className="tab-header">
          <button 
            className={`tab-btn ${activeTab === "prescription" ? "active" : ""}`}
            onClick={() => setActiveTab("prescription")}
          >
            📝 Prescription
          </button>
          <button 
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📚 Medical History
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "prescription" && (
            <div className="prescription-section">
              <div className="prescription-header">
                <h3 className="section-title">Write Prescription</h3>
                <div className="prescription-date">
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="prescription-content">
                <div className="prescription-form">
                  <div className="form-group">
                    <label className="form-label">Prescription Details</label>
                    <textarea
                      className="prescription-textarea"
                      placeholder="Enter prescription details here..."
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      rows="8"
                    />
                  </div>

                  {/* Enhanced Prescription Management */}
                  <div className="enhanced-prescription">
                    <div className="prescription-header">
                      <h4 className="prescription-title">Prescription Items</h4>
                      <button 
                        type="button" 
                        className="add-prescription-btn"
                        onClick={addPrescriptionItem}
                        disabled={!selectedPatient}
                      >
                        + Add Medicine
                      </button>
                    </div>

                    {/* Global Medicine Search */}
                    <div className="global-medicine-search">
                      <div className="search-header">
                        <h5>🔍 Search Medicines in Inventory</h5>
                        <span className="inventory-count">({medicineInventory.length} medicines available)</span>
                      </div>
                      <div className="search-container">
                        <input
                          type="text"
                          placeholder="Search by medicine name, category, or dosage..."
                          value={medicineSearch}
                          onChange={(e) => setMedicineSearch(e.target.value)}
                          className="global-search-input"
                          disabled={!selectedPatient}
                        />
                        {medicineSearch && (
                          <button 
                            className="clear-search-btn"
                            onClick={() => setMedicineSearch('')}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      {medicineSearch && (
                        <div className="search-results">
                          <h6>Search Results ({filteredMedicines.length} found):</h6>
                          <div className="medicine-grid">
                            {filteredMedicines.slice(0, 6).map((medicine) => (
                              <div 
                                key={medicine.id} 
                                className={`medicine-card ${
                                  medicine.quantity <= medicine.minStock ? 'low-stock' : ''
                                }`}
                                onClick={() => {
                                  const newItem = {
                                    id: Date.now(),
                                    medicineId: medicine.id,
                                    medicineName: medicine.name,
                                    dosage: medicine.dosage,
                                    frequency: '',
                                    duration: '',
                                    quantity: '',
                                    instructions: '',
                                    availableStock: medicine.quantity
                                  };
                                  setPrescriptionItems([...prescriptionItems, newItem]);
                                  setMedicineSearch('');
                                }}
                              >
                                <div className="medicine-card-header">
                                  <span className="medicine-name">{medicine.name}</span>
                                  <span className="medicine-dosage">{medicine.dosage}</span>
                                </div>
                                <div className="medicine-card-details">
                                  <span className="medicine-category">{medicine.category}</span>
                                  <span className={`stock-badge ${
                                    medicine.quantity <= medicine.minStock ? 'low' : 'normal'
                                  }`}>
                                    Stock: {medicine.quantity}
                                  </span>
                                </div>
                                {medicine.addedBy && medicine.addedBy !== 'System' && (
                                  <div className="added-by-badge">
                                    Added by {medicine.addedBy}
                                  </div>
                                )}
                              </div>
                            ))}
                            {filteredMedicines.length > 6 && (
                              <div className="more-results">
                                +{filteredMedicines.length - 6} more medicines. 
                                Use "Add Medicine" button to search individually.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {prescriptionItems.length === 0 ? (
                      <div className="empty-prescription">
                        <p>No medicines added yet. Click "Add Medicine" or use quick-add buttons below.</p>
                      </div>
                    ) : (
                      <div className="prescription-items">
                        {prescriptionItems.map((item) => (
                          <div key={item.id} className="prescription-item-card">
                            <div className="prescription-item-header">
                              <span className="medicine-indicator">💊</span>
                              <button 
                                type="button" 
                                className="remove-item-btn"
                                onClick={() => removePrescriptionItem(item.id)}
                                title="Remove this medicine"
                              >
                                ×
                              </button>
                            </div>
                            
                            <div className="prescription-item-grid">
                              <div className="item-field medicine-search-field">
                                <label>Medicine Name *</label>
                                <div className="medicine-search-container">
                                  <input
                                    type="text"
                                    placeholder="Search medicine..."
                                    value={item.medicineName}
                                    onChange={(e) => {
                                      updatePrescriptionItem(item.id, 'medicineName', e.target.value);
                                      setMedicineSearch(e.target.value);
                                      setShowMedicineDropdown(e.target.value.length > 0);
                                      setCurrentSearchItemId(item.id);
                                    }}
                                    onFocus={() => {
                                      setCurrentSearchItemId(item.id);
                                      if (item.medicineName) {
                                        setMedicineSearch(item.medicineName);
                                        setShowMedicineDropdown(true);
                                      }
                                    }}
                                    onBlur={() => {
                                      // Delay hiding to allow for clicks on dropdown items
                                      setTimeout(() => {
                                        if (currentSearchItemId === item.id) {
                                          setShowMedicineDropdown(false);
                                          setCurrentSearchItemId(null);
                                        }
                                      }, 200);
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                                    className="medicine-search-input"
                                    autoComplete="off"
                                  />
                                  
                                  {showMedicineDropdown && medicineSearch && currentSearchItemId === item.id && (
                                    <div className="medicine-dropdown">
                                      {filteredMedicines.length > 0 ? (
                                        filteredMedicines.map((medicine, index) => (
                                          <div 
                                            key={medicine.id} 
                                            className={`medicine-option ${
                                              index === selectedMedicineIndex ? 'selected' : ''
                                            } ${
                                              medicine.quantity <= medicine.minStock ? 'low-stock' : ''
                                            }`}
                                            onClick={() => handleMedicineSelect(medicine, item.id)}
                                            onMouseDown={(e) => e.preventDefault()} // Prevent blur from firing
                                          >
                                            <div className="medicine-option-main">
                                              <span className="medicine-name">{medicine.name}</span>
                                              <span className="medicine-dosage">{medicine.dosage}</span>
                                            </div>
                                            <div className="medicine-option-details">
                                              <span className="medicine-category">{medicine.category}</span>
                                              <span className={`medicine-stock ${
                                                medicine.quantity <= medicine.minStock ? 'low' : 'normal'
                                              }`}>
                                                Stock: {medicine.quantity}
                                                {medicine.quantity <= medicine.minStock && ' ⚠️'}
                                              </span>
                                              {medicine.addedBy && medicine.addedBy !== 'System' && (
                                                <span className="medicine-added-by">
                                                  Added by: {medicine.addedBy}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="medicine-option no-results">
                                          No medicines found. Contact pharmacy to add new medicine.
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {item.availableStock > 0 && (
                                  <div className={`stock-info ${
                                    item.availableStock <= 20 ? 'low-stock' : 'normal-stock'
                                  }`}>
                                    Available: {item.availableStock} units
                                    {item.availableStock <= 20 && ' ⚠️ Low Stock'}
                                  </div>
                                )}
                              </div>
                              
                              <div className="item-field">
                                <label>Dosage</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 500mg"
                                  value={item.dosage}
                                  onChange={(e) => updatePrescriptionItem(item.id, 'dosage', e.target.value)}
                                  className="dosage-input"
                                />
                              </div>
                              
                              <div className="item-field">
                                <label>Frequency *</label>
                                <select
                                  value={item.frequency}
                                  onChange={(e) => {
                                    updatePrescriptionItem(item.id, 'frequency', e.target.value);
                                    // Auto-calculate quantity when frequency changes
                                    if (e.target.value && item.duration) {
                                      const newQuantity = calculateQuantity(e.target.value, item.duration);
                                      updatePrescriptionItem(item.id, 'quantity', newQuantity.toString());
                                    }
                                  }}
                                  className="frequency-select"
                                >
                                  <option value="">Select frequency</option>
                                  <option value="Once daily">Once daily</option>
                                  <option value="Twice daily">Twice daily</option>
                                  <option value="Three times daily">Three times daily</option>
                                  <option value="Four times daily">Four times daily</option>
                                  <option value="Every 4 hours">Every 4 hours</option>
                                  <option value="Every 6 hours">Every 6 hours</option>
                                  <option value="Every 8 hours">Every 8 hours</option>
                                  <option value="Every 12 hours">Every 12 hours</option>
                                  <option value="As needed">As needed (PRN)</option>
                                  <option value="Before meals">Before meals</option>
                                  <option value="After meals">After meals</option>
                                  <option value="At bedtime">At bedtime</option>
                                </select>
                              </div>
                              
                              <div className="item-field">
                                <label>Duration *</label>
                                <select
                                  value={item.duration}
                                  onChange={(e) => {
                                    updatePrescriptionItem(item.id, 'duration', e.target.value);
                                    // Auto-calculate quantity when duration changes
                                    if (e.target.value && item.frequency) {
                                      const newQuantity = calculateQuantity(item.frequency, e.target.value);
                                      updatePrescriptionItem(item.id, 'quantity', newQuantity.toString());
                                    }
                                  }}
                                  className="duration-select"
                                >
                                  <option value="">Select duration</option>
                                  <option value="3 days">3 days</option>
                                  <option value="5 days">5 days</option>
                                  <option value="7 days">1 week</option>
                                  <option value="10 days">10 days</option>
                                  <option value="14 days">2 weeks</option>
                                  <option value="21 days">3 weeks</option>
                                  <option value="30 days">1 month</option>
                                  <option value="60 days">2 months</option>
                                  <option value="90 days">3 months</option>
                                </select>
                              </div>
                              
                              <div className="item-field">
                                <label>Quantity *</label>
                                <input
                                  type="number"
                                  placeholder="Auto-calculated"
                                  value={item.quantity}
                                  onChange={(e) => updatePrescriptionItem(item.id, 'quantity', e.target.value)}
                                  min="1"
                                  className="quantity-input"
                                />
                                {item.quantity && item.availableStock && parseInt(item.quantity) > item.availableStock && (
                                  <div className="quantity-warning">
                                    ⚠️ Requested quantity exceeds available stock!
                                  </div>
                                )}
                              </div>
                              
                              <div className="item-field full-width">
                                <label>Instructions</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Take with food, avoid alcohol"
                                  value={item.instructions}
                                  onChange={(e) => updatePrescriptionItem(item.id, 'instructions', e.target.value)}
                                  className="instructions-input"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Add Common Medicines */}
                    <div className="quick-prescription">
                      <h4 className="quick-title">Quick Add Common Medicines:</h4>
                      <div className="quick-buttons">
                        {commonPrescriptions.map((prescription, index) => (
                          <button
                            key={index}
                            className="quick-btn"
                            onClick={() => addQuickMedicine(prescription)}
                            disabled={!selectedPatient}
                            title={`${prescription.name} ${prescription.dosage} - ${prescription.frequency} for ${prescription.duration}`}
                          >
                            + {prescription.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Structured Medication Entry */}
                  <div className="medication-section">
                    <div className="medication-header">
                      <h4 className="medication-title">Medications</h4>
                      <button 
                        type="button" 
                        className="add-medication-btn"
                        onClick={addMedication}
                        disabled={!selectedPatient}
                      >
                        + Add Medication
                      </button>
                    </div>
                    
                    {medications.map((medication) => (
                      <div key={medication.id} className="medication-item">
                        <div className="medication-grid">
                          <div className="med-field">
                            <label>Medicine Name</label>
                            <input
                              type="text"
                              placeholder="e.g., Paracetamol"
                              value={medication.name}
                              onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="med-field">
                            <label>Dosage</label>
                            <input
                              type="text"
                              placeholder="e.g., 500mg"
                              value={medication.dosage}
                              onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                            />
                          </div>
                          <div className="med-field">
                            <label>Frequency</label>
                            <select
                              value={medication.frequency}
                              onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                            >
                              <option value="">Select frequency</option>
                              <option value="Once daily">Once daily</option>
                              <option value="Twice daily">Twice daily</option>
                              <option value="Three times daily">Three times daily</option>
                              <option value="Four times daily">Four times daily</option>
                              <option value="As needed">As needed</option>
                            </select>
                          </div>
                          <div className="med-field">
                            <label>Duration</label>
                            <input
                              type="text"
                              placeholder="e.g., 7 days"
                              value={medication.duration}
                              onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                            />
                          </div>
                          <div className="med-field full-width">
                            <label>Instructions</label>
                            <input
                              type="text"
                              placeholder="e.g., Take after meals"
                              value={medication.instructions}
                              onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                            />
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="remove-medication-btn"
                          onClick={() => removeMedication(medication.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="prescription-actions">
                    {prescriptionItems.length > 0 && (
                      <div className="prescription-summary">
                        <h4>Prescription Summary:</h4>
                        <ul className="summary-list">
                          {prescriptionItems.map((item, index) => (
                            <li key={item.id} className="summary-item">
                              <span className="summary-medicine">{item.medicineName || 'Unnamed medicine'}</span>
                              <span className="summary-details">
                                {item.dosage} - {item.frequency} for {item.duration} 
                                {item.quantity && ` (${item.quantity} units)`}
                              </span>
                              {item.instructions && (
                                <span className="summary-instructions">• {item.instructions}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="action-buttons">
                      <button 
                        className="action-btn secondary"
                        disabled={!selectedPatient}
                      >
                        <span className="btn-icon">💾</span>
                        Save Draft
                      </button>
                      <button 
                        className="action-btn primary" 
                        onClick={handleSign}
                        disabled={!selectedPatient || isLoading || (prescriptionItems.length === 0 && medications.length === 0 && !prescriptionText.trim())}
                      >
                        <span className="btn-icon">✍️</span>
                        {isLoading ? 'Sending...' : 'Send to Pharmacy'}
                      </button>
                    </div>
                  </div>

                  {!selectedPatient && (
                    <div className="no-patient-warning">
                      <p>⚠️ Please select a patient from the queue to write a prescription.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="history-section">
              <h3 className="section-title">Medical History</h3>
              <div className="history-list">
                {medicalHistory.map((record, index) => (
                  <div key={index} className="history-item">
                    <div className="history-date">
                      <span className="date">{record.date}</span>
                    </div>
                    <div className="history-details">
                      <h4 className="history-condition">{record.condition}</h4>
                      <p className="history-doctor">Treated by: {record.doctor}</p>
                      {record.details && (
                        <p className="history-notes" style={{fontSize: '0.9rem', color: '#666', marginTop: '0.5rem'}}>
                          {record.details}
                        </p>
                      )}
                    </div>
                    <button className="history-view-btn">View Details</button>
                  </div>
                ))}
              </div>
              
              <button className="action-btn secondary full-width">
                <span className="btn-icon">📄</span>
                View Complete Medical Records
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPatient;