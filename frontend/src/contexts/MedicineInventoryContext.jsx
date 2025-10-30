import React, { createContext, useContext, useState, useEffect } from 'react';

const MedicineInventoryContext = createContext();

const BASE_URL = 'http://localhost:8081/api/medicines';

export const useMedicineInventory = () => {
  const context = useContext(MedicineInventoryContext);
  if (!context) {
    throw new Error('useMedicineInventory must be used within a MedicineInventoryProvider');
  }
  return context;
};

export const MedicineInventoryProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default medicines that come with the system (fallback only)
  const defaultMedicines = [
    {
      id: 1,
      name: "Paracetamol",
      quantity: 150,
      expiry: "2025-08-10",
      category: "Analgesic",
      minStock: 20,
      dosage: "500mg",
      batchNumber: "PCT001",
      addedBy: "System",
      addedDate: "2024-01-01"
    },
    {
      id: 2,
      name: "Amoxicillin",
      quantity: 85,
      expiry: "2025-12-15",
      category: "Antibiotic",
      minStock: 30,
      dosage: "250mg",
      batchNumber: "AMX002",
      addedBy: "System",
      addedDate: "2024-01-01"
    },
    {
      id: 3,
      name: "Aspirin",
      quantity: 200,
      expiry: "2026-06-20",
      category: "Analgesic",
      minStock: 25,
      dosage: "75mg",
      batchNumber: "ASP003",
      addedBy: "System",
      addedDate: "2026-01-01"
    },
    {
      id: 4,
      name: "Ibuprofen",
      quantity: 120,
      expiry: "2026-03-10",
      category: "Anti-inflammatory",
      minStock: 20,
      dosage: "400mg",
      batchNumber: "IBU004",
      addedBy: "System",
      addedDate: "2024-01-01"
    },
    {
      id: 5,
      name: "Ciprofloxacin",
      quantity: 60,
      expiry: "2025-09-20",
      category: "Antibiotic",
      minStock: 15,
      dosage: "500mg",
      batchNumber: "CIP005",
      addedBy: "System",
      addedDate: "2024-01-01"
    },
    {
      id: 6,
      name: "Omeprazole",
      quantity: 75,
      expiry: "2025-11-30",
      category: "Antacid",
      minStock: 25,
      dosage: "20mg",
      batchNumber: "OMP006",
      addedBy: "System",
      addedDate: "2024-01-01"
    },
    {
      id: 7,
      name: "Metformin",
      quantity: 90,
      expiry: "2025-10-15",
      category: "Antidiabetic",
      minStock: 30,
      dosage: "500mg",
      batchNumber: "MET007",
      addedBy: "System",
      addedDate: "2024-01-01"
    },
    {
      id: 8,
      name: "Vitamin D3",
      quantity: 180,
      expiry: "2026-01-25",
      category: "Vitamin",
      minStock: 50,
      dosage: "1000IU",
      batchNumber: "VTD008",
      addedBy: "System",
      addedDate: "2024-01-01"
    },
    {
      id: 9,
      name: "Loratadine",
      quantity: 45,
      expiry: "2025-07-10",
      category: "Antihistamine",
      minStock: 20,
      dosage: "10mg",
      batchNumber: "LOR009",
      addedBy: "System",
      addedDate: "2024-01-01"
    },
    {
      id: 10,
      name: "Amlodipine",
      quantity: 65,
      expiry: "2025-12-05",
      category: "Antihypertensive",
      minStock: 25,
      dosage: "5mg",
      batchNumber: "AML010",
      addedBy: "System",
      addedDate: "2024-01-01"
    }
  ];

  // Load medicines from backend on component mount
  useEffect(() => {
    loadMedicinesFromBackend();
  }, []);

  const loadMedicinesFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(BASE_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const medicinesData = await response.json();
      console.log('✅ Medicines loaded from backend:', medicinesData);
      
      if (medicinesData.length === 0) {
        // Initialize default medicines if none exist
        await initializeDefaultMedicines();
      } else {
        setMedicines(medicinesData);
        // Also save to localStorage as fallback
        localStorage.setItem('medicineInventory', JSON.stringify(medicinesData));
      }
    } catch (error) {
      console.error('❌ Error loading medicines from backend:', error);
      setError('Failed to load medicines from server');
      
      // Fallback to localStorage
      const savedMedicines = localStorage.getItem('medicineInventory');
      if (savedMedicines) {
        try {
          const localMedicines = JSON.parse(savedMedicines);
          setMedicines(localMedicines);
          console.log('✅ Loaded medicines from localStorage as fallback');
        } catch (parseError) {
          console.error('Error parsing saved medicines:', parseError);
          setMedicines(defaultMedicines);
        }
      } else {
        setMedicines(defaultMedicines);
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultMedicines = async () => {
    try {
      const response = await fetch(`${BASE_URL}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Default medicines initialized:', result);
        // Reload medicines after initialization
        await loadMedicinesFromBackend();
      }
    } catch (error) {
      console.error('❌ Error initializing default medicines:', error);
      setMedicines(defaultMedicines);
    }
  };

  // Add new medicine
  const addMedicine = async (medicineData) => {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...medicineData,
          addedBy: "Pharmacist", // You can get this from user context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Add to local state
        setMedicines(prevMedicines => [...prevMedicines, result.medicine]);
        
        // Update localStorage fallback
        const updatedMedicines = [...medicines, result.medicine];
        localStorage.setItem('medicineInventory', JSON.stringify(updatedMedicines));
        
        console.log('✅ Medicine added successfully:', result.medicine);
        return result.medicine.id;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error adding medicine:', error);
      
      // Fallback to localStorage
      const newMedicine = {
        ...medicineData,
        id: Date.now(),
        addedBy: "Pharmacist",
        addedDate: new Date().toISOString()
      };
      setMedicines(prevMedicines => [...prevMedicines, newMedicine]);
      localStorage.setItem('medicineInventory', JSON.stringify([...medicines, newMedicine]));
      
      return newMedicine.id;
    }
  };

  // Update existing medicine
  const updateMedicine = async (id, updates) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setMedicines(prevMedicines => 
          prevMedicines.map(medicine => 
            medicine.id === id ? result.medicine : medicine
          )
        );
        
        // Update localStorage fallback
        const updatedMedicines = medicines.map(medicine => 
          medicine.id === id ? result.medicine : medicine
        );
        localStorage.setItem('medicineInventory', JSON.stringify(updatedMedicines));
        
        console.log('✅ Medicine updated successfully:', result.medicine);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error updating medicine:', error);
      
      // Fallback to localStorage
      setMedicines(prevMedicines => 
        prevMedicines.map(medicine => 
          medicine.id === id 
            ? { ...medicine, ...updates, lastUpdated: new Date().toISOString() }
            : medicine
        )
      );
      
      const updatedMedicines = medicines.map(medicine => 
        medicine.id === id 
          ? { ...medicine, ...updates, lastUpdated: new Date().toISOString() }
          : medicine
      );
      localStorage.setItem('medicineInventory', JSON.stringify(updatedMedicines));
    }
  };

  // Delete medicine
  const deleteMedicine = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        setMedicines(prevMedicines => 
          prevMedicines.filter(medicine => medicine.id !== id)
        );
        
        // Update localStorage fallback
        const updatedMedicines = medicines.filter(medicine => medicine.id !== id);
        localStorage.setItem('medicineInventory', JSON.stringify(updatedMedicines));
        
        console.log('✅ Medicine deleted successfully');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error deleting medicine:', error);
      
      // Fallback to localStorage
      setMedicines(prevMedicines => 
        prevMedicines.filter(medicine => medicine.id !== id)
      );
      
      const updatedMedicines = medicines.filter(medicine => medicine.id !== id);
      localStorage.setItem('medicineInventory', JSON.stringify(updatedMedicines));
    }
  };

  // Update medicine quantity (used when dispensing)
  const updateMedicineQuantity = async (id, newQuantity) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setMedicines(prevMedicines => 
          prevMedicines.map(medicine => 
            medicine.id === id ? result.medicine : medicine
          )
        );
        
        // Update localStorage fallback
        const updatedMedicines = medicines.map(medicine => 
          medicine.id === id ? result.medicine : medicine
        );
        localStorage.setItem('medicineInventory', JSON.stringify(updatedMedicines));
        
        console.log('✅ Medicine quantity updated successfully:', result.medicine);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error updating medicine quantity:', error);
      
      // Fallback to localStorage
      setMedicines(prevMedicines => 
        prevMedicines.map(medicine => 
          medicine.id === id 
            ? { ...medicine, quantity: newQuantity, lastUpdated: new Date().toISOString() }
            : medicine
        )
      );
      
      const updatedMedicines = medicines.map(medicine => 
        medicine.id === id 
          ? { ...medicine, quantity: newQuantity, lastUpdated: new Date().toISOString() }
          : medicine
      );
      localStorage.setItem('medicineInventory', JSON.stringify(updatedMedicines));
    }
  };

  // Reduce medicine quantities when dispensing prescriptions
  const dispenseMedicines = async (prescribedMedicines) => {
    try {
      const response = await fetch(`${BASE_URL}/dispense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescribedMedicines),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Reload medicines to get updated quantities
        await loadMedicinesFromBackend();
        console.log('✅ Medicines dispensed successfully');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error dispensing medicines:', error);
      
      // Fallback to localStorage
      setMedicines(prevMedicines => 
        prevMedicines.map(medicine => {
          const prescribedMed = prescribedMedicines.find(pm => pm.medicineId === medicine.id);
          if (prescribedMed) {
            const newQuantity = Math.max(0, medicine.quantity - prescribedMed.quantity);
            return { 
              ...medicine, 
              quantity: newQuantity,
              lastUpdated: new Date().toISOString()
            };
          }
          return medicine;
        })
      );
      
      // Update localStorage
      const updatedMedicines = medicines.map(medicine => {
        const prescribedMed = prescribedMedicines.find(pm => pm.medicineId === medicine.id);
        if (prescribedMed) {
          const newQuantity = Math.max(0, medicine.quantity - prescribedMed.quantity);
          return { 
            ...medicine, 
            quantity: newQuantity,
            lastUpdated: new Date().toISOString()
          };
        }
        return medicine;
      });
      localStorage.setItem('medicineInventory', JSON.stringify(updatedMedicines));
    }
  };

  // Get medicine by ID
  const getMedicineById = (id) => {
    return medicines.find(medicine => medicine.id === id);
  };

  // Search medicines
  const searchMedicines = (searchTerm) => {
    if (!searchTerm) return medicines;
    
    const term = searchTerm.toLowerCase();
    return medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(term) ||
      medicine.category.toLowerCase().includes(term) ||
      medicine.dosage.toLowerCase().includes(term)
    );
  };

  // Get medicines by category
  const getMedicinesByCategory = (category) => {
    return medicines.filter(medicine => medicine.category === category);
  };

  // Get low stock medicines
  const getLowStockMedicines = () => {
    return medicines.filter(medicine => medicine.quantity <= medicine.minStock);
  };

  // Get expired medicines
  const getExpiredMedicines = () => {
    const today = new Date();
    return medicines.filter(medicine => new Date(medicine.expiry) < today);
  };

  // Get near expiry medicines (within 30 days)
  const getNearExpiryMedicines = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return medicines.filter(medicine => {
      const expiryDate = new Date(medicine.expiry);
      return expiryDate > today && expiryDate <= thirtyDaysFromNow;
    });
  };

  // Get all categories
  const getCategories = () => {
    const categories = [...new Set(medicines.map(medicine => medicine.category))];
    return categories.sort();
  };

  // Clear all medicines (for testing/reset)
  const clearAllMedicines = () => {
    setMedicines([]);
  };

  // Reset to default medicines
  const resetToDefaults = () => {
    setMedicines(defaultMedicines);
  };

  const value = {
    medicines,
    loading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    updateMedicineQuantity,
    dispenseMedicines,
    getMedicineById,
    searchMedicines,
    getMedicinesByCategory,
    getLowStockMedicines,
    getExpiredMedicines,
    getNearExpiryMedicines,
    getCategories,
    clearAllMedicines,
    resetToDefaults,
    loadMedicinesFromBackend,
    initializeDefaultMedicines
  };

  return (
    <MedicineInventoryContext.Provider value={value}>
      {children}
    </MedicineInventoryContext.Provider>
  );
};

export default MedicineInventoryContext;