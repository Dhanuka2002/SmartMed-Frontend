import React, { createContext, useContext, useState, useEffect } from 'react';

const MedicineInventoryContext = createContext();

export const useMedicineInventory = () => {
  const context = useContext(MedicineInventoryContext);
  if (!context) {
    throw new Error('useMedicineInventory must be used within a MedicineInventoryProvider');
  }
  return context;
};

export const MedicineInventoryProvider = ({ children }) => {
  // Default medicines that come with the system
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
      expiry: "2024-06-20",
      category: "Analgesic",
      minStock: 25,
      dosage: "75mg",
      batchNumber: "ASP003",
      addedBy: "System",
      addedDate: "2024-01-01"
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

  // Load medicines from localStorage or use defaults
  const [medicines, setMedicines] = useState(() => {
    const savedMedicines = localStorage.getItem('medicineInventory');
    if (savedMedicines) {
      try {
        return JSON.parse(savedMedicines);
      } catch (error) {
        console.error('Error parsing saved medicines:', error);
        return defaultMedicines;
      }
    }
    return defaultMedicines;
  });

  // Save medicines to localStorage whenever medicines change
  useEffect(() => {
    localStorage.setItem('medicineInventory', JSON.stringify(medicines));
  }, [medicines]);

  // Add new medicine
  const addMedicine = (medicineData) => {
    const newMedicine = {
      ...medicineData,
      id: Date.now(), // Simple ID generation
      addedBy: "Pharmacist", // You can get this from user context
      addedDate: new Date().toISOString()
    };
    setMedicines(prevMedicines => [...prevMedicines, newMedicine]);
    return newMedicine.id;
  };

  // Update existing medicine
  const updateMedicine = (id, updates) => {
    setMedicines(prevMedicines => 
      prevMedicines.map(medicine => 
        medicine.id === id 
          ? { ...medicine, ...updates, lastUpdated: new Date().toISOString() }
          : medicine
      )
    );
  };

  // Delete medicine
  const deleteMedicine = (id) => {
    setMedicines(prevMedicines => 
      prevMedicines.filter(medicine => medicine.id !== id)
    );
  };

  // Update medicine quantity (used when dispensing)
  const updateMedicineQuantity = (id, newQuantity) => {
    setMedicines(prevMedicines => 
      prevMedicines.map(medicine => 
        medicine.id === id 
          ? { ...medicine, quantity: newQuantity, lastUpdated: new Date().toISOString() }
          : medicine
      )
    );
  };

  // Reduce medicine quantities when dispensing prescriptions
  const dispenseMedicines = (prescribedMedicines) => {
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
    resetToDefaults
  };

  return (
    <MedicineInventoryContext.Provider value={value}>
      {children}
    </MedicineInventoryContext.Provider>
  );
};

export default MedicineInventoryContext;