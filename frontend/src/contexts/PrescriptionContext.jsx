import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PrescriptionContext = createContext();

export const usePrescription = () => {
  const context = useContext(PrescriptionContext);
  if (!context) {
    throw new Error('usePrescription must be used within a PrescriptionProvider');
  }
  return context;
};

export const PrescriptionProvider = ({ children }) => {
  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('contextPrescriptions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [queueCounter, setQueueCounter] = useState(() => {
    try {
      const saved = localStorage.getItem('prescriptionQueueCounter');
      return saved ? parseInt(saved) : 1000;
    } catch {
      return 1000;
    }
  });
  
  const [dispensedPrescriptions, setDispensedPrescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('contextDispensedPrescriptions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist prescriptions to localStorage
  useEffect(() => {
    localStorage.setItem('contextPrescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  // Persist dispensed prescriptions to localStorage
  useEffect(() => {
    localStorage.setItem('contextDispensedPrescriptions', JSON.stringify(dispensedPrescriptions));
  }, [dispensedPrescriptions]);

  // Persist queue counter to localStorage
  useEffect(() => {
    localStorage.setItem('prescriptionQueueCounter', queueCounter.toString());
  }, [queueCounter]);

  const addPrescription = useCallback((prescriptionData) => {
    const currentCounter = queueCounter;
    const newQueueNumber = `P${currentCounter.toString().padStart(4, '0')}`;
    
    const newPrescription = {
      id: `RX${Date.now()}`, // Keep unique ID for internal use
      queueNumber: newQueueNumber, // User-friendly queue number
      ...prescriptionData,
      status: 'pending',
      pharmacyStatus: 'Pending',
      prescriptionDate: new Date().toISOString().split('T')[0],
      prescriptionTime: new Date().toLocaleTimeString(),
      createdAt: new Date().toISOString()
    };

    setPrescriptions(prev => [newPrescription, ...prev]);
    setQueueCounter(prev => prev + 1);
    return newPrescription.id;
  }, [queueCounter]);

  const updatePrescriptionStatus = useCallback((prescriptionId, newStatus) => {
    setPrescriptions(prev => 
      prev.map(prescription => 
        prescription.id === prescriptionId 
          ? { ...prescription, status: newStatus, pharmacyStatus: newStatus }
          : prescription
      )
    );
  }, []);

  const dispensePrescription = useCallback((prescriptionId) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return false;

    const dispensedPrescription = {
      ...prescription,
      status: 'dispensed',
      dispensedDate: new Date().toISOString().split('T')[0],
      dispensedTime: new Date().toLocaleTimeString()
    };

    setDispensedPrescriptions(prev => [dispensedPrescription, ...prev]);
    setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
    
    return true;
  }, [prescriptions]);

  const getPendingPrescriptions = useCallback(() => {
    return prescriptions.filter(p => p.status === 'pending');
  }, [prescriptions]);

  const getDispensedPrescriptions = useCallback(() => {
    return dispensedPrescriptions;
  }, [dispensedPrescriptions]);

  const getPrescriptionById = useCallback((id) => {
    return prescriptions.find(p => p.id === id) || 
           dispensedPrescriptions.find(p => p.id === id);
  }, [prescriptions, dispensedPrescriptions]);

  const deletePrescription = useCallback((prescriptionId) => {
    setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
  }, []);

  const clearAllPrescriptions = useCallback(() => {
    setPrescriptions([]);
    setDispensedPrescriptions([]);
    setQueueCounter(1000);
    localStorage.removeItem('contextPrescriptions');
    localStorage.removeItem('contextDispensedPrescriptions');
    localStorage.removeItem('prescriptionQueueCounter');
  }, []);

  const value = {
    prescriptions,
    dispensedPrescriptions,
    addPrescription,
    updatePrescriptionStatus,
    dispensePrescription,
    getPendingPrescriptions,
    getDispensedPrescriptions,
    getPrescriptionById,
    deletePrescription,
    clearAllPrescriptions
  };

  return (
    <PrescriptionContext.Provider value={value}>
      {children}
    </PrescriptionContext.Provider>
  );
};

export default PrescriptionContext;