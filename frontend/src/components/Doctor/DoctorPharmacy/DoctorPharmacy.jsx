import React, { useState, useEffect, useMemo } from "react";
import { useMedicineInventory } from "../../../contexts/MedicineInventoryContext";
import { usePrescription } from "../../../contexts/PrescriptionContext";
import "./DoctorPharmacy.css";

function DoctorPharmacy() {
  // Context hooks for real-time data with error handling
  const medicineContext = useMedicineInventory();
  const prescriptionContext = usePrescription();
  
  // Safely extract data with fallbacks
  const {
    medicines = [],
    searchMedicines = () => [],
    getCategories = () => [],
    getLowStockMedicines = () => [],
    getExpiredMedicines = () => [],
    getNearExpiryMedicines = () => []
  } = medicineContext || {};
  
  const {
    prescriptions = [],
    dispensedPrescriptions = []
  } = prescriptionContext || {};

  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [prescriptionSearch, setPrescriptionSearch] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(Date.now());

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshInterval(Date.now());
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Transform medicine inventory data to match component format
  const medications = useMemo(() => {
    if (!medicines || !Array.isArray(medicines)) {
      console.log('DoctorPharmacy: No medicines data available');
      return [];
    }
    
    return medicines.map(medicine => ({
      id: medicine.id,
      name: medicine.name || 'Unknown Medicine',
      strength: medicine.dosage || 'N/A',
      category: (medicine.category || 'other').toLowerCase(),
      stockLevel: medicine.quantity || 0,
      minStock: medicine.minStock || 0,
      price: Math.random() * 20 + 5, // Mock price - you can add this to inventory context
      manufacturer: medicine.addedBy === 'System' ? 'PharmaCorp' : `Added by ${medicine.addedBy || 'Unknown'}`,
      expiryDate: medicine.expiry || 'No expiry date',
      batchNo: medicine.batchNumber || 'No batch',
      status: medicine.quantity === 0 ? 'out_of_stock' : 
               (medicine.quantity || 0) <= (medicine.minStock || 0) ? 'low_stock' : 'available'
    }));
  }, [medicines, refreshInterval]);

  // Combine both active and dispensed prescriptions for complete view
  const allPrescriptions = useMemo(() => {
    const activePrescriptions = (prescriptions || []).map(prescription => ({
      id: `RX${prescription.id}`,
      patientName: prescription.patientName,
      patientId: prescription.patientId,
      doctorName: prescription.doctorName,
      date: new Date(prescription.createdAt || Date.now()).toLocaleDateString(),
      status: prescription.status === 'pending' ? 'pending' : 'ready',
      medications: (prescription.medicines || []).map(med => ({
        name: `${med.medicineName} ${med.dosage}`,
        quantity: med.quantity,
        instructions: med.instructions
      })),
      totalAmount: (prescription.medicines || []).reduce((total, med) => {
        const medicine = medicines.find(m => m.id === med.medicineId);
        const price = medicine ? (Math.random() * 20 + 5) : 10; // Mock pricing
        return total + (price * med.quantity);
      }, 0)
    }));
    
    const dispensed = (dispensedPrescriptions || []).map(prescription => ({
      id: `RX${prescription.id}`,
      patientName: prescription.patientName,
      patientId: prescription.patientId,
      doctorName: prescription.doctorName,
      date: new Date(prescription.dispensedDate || prescription.createdAt || Date.now()).toLocaleDateString(),
      status: 'completed',
      medications: (prescription.medicines || []).map(med => ({
        name: `${med.medicineName} ${med.dosage}`,
        quantity: med.quantity,
        instructions: med.instructions
      })),
      totalAmount: (prescription.medicines || []).reduce((total, med) => {
        const medicine = medicines.find(m => m.id === med.medicineId);
        const price = medicine ? (Math.random() * 20 + 5) : 10;
        return total + (price * med.quantity);
      }, 0)
    }));
    
    return [...activePrescriptions, ...dispensed];
  }, [prescriptions, dispensedPrescriptions, medicines, refreshInterval]);

  // Dynamic categories from real inventory data
  const categories = useMemo(() => {
    const realCategories = getCategories().map(cat => ({
      value: cat.toLowerCase(),
      label: cat
    }));
    return [
      { value: "all", label: "All Categories" },
      ...realCategories
    ];
  }, [getCategories, refreshInterval]);

  // Filter medications
  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter prescriptions
  const filteredPrescriptions = allPrescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(prescriptionSearch.toLowerCase()) ||
    prescription.patientId.toLowerCase().includes(prescriptionSearch.toLowerCase()) ||
    prescription.id.toLowerCase().includes(prescriptionSearch.toLowerCase())
  );

  // Real-time analytics and statistics
  const stockStats = useMemo(() => ({
    total: medications.length,
    available: medications.filter(m => m.status === "available").length,
    lowStock: medications.filter(m => m.status === "low_stock").length,
    outOfStock: medications.filter(m => m.status === "out_of_stock").length,
    nearExpiry: getNearExpiryMedicines().length,
    expired: getExpiredMedicines().length,
    totalValue: medications.reduce((total, med) => total + (med.price * med.stockLevel), 0)
  }), [medications, getNearExpiryMedicines, getExpiredMedicines, refreshInterval]);

  const prescriptionStats = useMemo(() => ({
    pending: allPrescriptions.filter(p => p.status === "pending").length,
    ready: allPrescriptions.filter(p => p.status === "ready").length,
    completed: allPrescriptions.filter(p => p.status === "completed").length,
    totalRevenue: allPrescriptions
      .filter(p => p.status === "completed")
      .reduce((total, p) => total + p.totalAmount, 0),
    todaysPrescriptions: allPrescriptions
      .filter(p => p.date === new Date().toLocaleDateString()).length
  }), [allPrescriptions, refreshInterval]);

  // Additional analytics
  const analyticsData = useMemo(() => {
    const topMedicines = medications
      .sort((a, b) => (b.stockLevel * b.price) - (a.stockLevel * a.price))
      .slice(0, 5);
    
    const categoryDistribution = categories.slice(1).map(cat => ({
      category: cat.label,
      count: medications.filter(med => med.category === cat.value).length,
      value: medications
        .filter(med => med.category === cat.value)
        .reduce((total, med) => total + (med.price * med.stockLevel), 0)
    }));
    
    return {
      topMedicines,
      categoryDistribution,
      lowStockMedicines: getLowStockMedicines(),
      expiredMedicines: getExpiredMedicines(),
      nearExpiryMedicines: getNearExpiryMedicines()
    };
  }, [medications, categories, getLowStockMedicines, getExpiredMedicines, getNearExpiryMedicines, refreshInterval]);

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "#22c55e";
      case "low_stock": return "#f59e0b";
      case "out_of_stock": return "#ef4444";
      case "pending": return "#3b82f6";
      case "ready": return "#22c55e";
      case "completed": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "available": return "Available";
      case "low_stock": return "Low Stock";
      case "out_of_stock": return "Out of Stock";
      case "pending": return "Pending";
      case "ready": return "Ready";
      case "completed": return "Completed";
      default: return status;
    }
  };

  // Error handling for context availability
  if (!medicineContext || !prescriptionContext) {
    return (
      <div className="doctor-pharmacy-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading Pharmacy Data...</h2>
        <p>Please make sure the Medicine Inventory and Prescription contexts are properly configured.</p>
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
          <p><strong>Debug Info:</strong></p>
          <p>Medicine Context: {medicineContext ? '✅ Available' : '❌ Not Available'}</p>
          <p>Prescription Context: {prescriptionContext ? '✅ Available' : '❌ Not Available'}</p>
          <p>Medicines Count: {medicines?.length || 0}</p>
          <p>Prescriptions Count: {prescriptions?.length || 0}</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="doctor-pharmacy-container">
        {/* Header Section */}
        <div className="pharmacy-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">💊</span>
            Pharmacy Management
          </h1>
          <p className="page-subtitle">Manage medications and prescriptions</p>
        </div>
        
        <div className="stats-overview">
          <div className="stat-card">
            
            <div className="stat-content">
              <span className="stat-value">{stockStats.total}</span>
              <span className="stat-label">Total Medications</span>
              <div className="stat-icon">📦</div>
              <span className="stat-sublabel">${stockStats.totalValue.toFixed(2)} value</span>
              
            </div>
          </div>
          <div className="stat-card warning">
            
            <div className="stat-content">
              <span className="stat-value">{stockStats.lowStock}</span>
              <span className="stat-label">Low Stock</span>
              <div className="stat-icon">⚠️</div>
              <span className="stat-sublabel">{stockStats.outOfStock} out of stock</span>
            </div>
          </div>
          <div className="stat-card">
           
            <div className="stat-content">
              <span className="stat-value">{prescriptionStats.pending}</span>
              <span className="stat-label">Pending Scripts</span>
               <div className="stat-icon">📋</div>
              <span className="stat-sublabel">{prescriptionStats.todaysPrescriptions} today</span>
            </div>
            
          </div>
          <div className="stat-card success">
            
            <div className="stat-content">
              <span className="stat-value">${prescriptionStats.totalRevenue.toFixed(0)}</span>
              <span className="stat-label">Total Revenue</span>
              <div className="stat-icon">💰</div>
              <span className="stat-sublabel">{prescriptionStats.completed} completed</span>
            </div>
          </div>
          <div className="stat-card info">
           
            <div className="stat-content">
              <span className="stat-value">{stockStats.nearExpiry}</span>
              <span className="stat-label">Near Expiry</span>
               <div className="stat-icon">⏰</div>
              <span className="stat-sublabel">{stockStats.expired} expired</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="content-tabs">
        <div className="tab-header">
          <button 
            className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            📦 Inventory
          </button>
          <button 
            className={`tab-btn ${activeTab === "prescriptions" ? "active" : ""}`}
            onClick={() => setActiveTab("prescriptions")}
          >
            📋 Prescriptions
          </button>
          <button 
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            📊 Analytics
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "inventory" && (
            <div className="inventory-section">
              <div className="section-header">
                <h3 className="section-title">Medication Inventory</h3>
                <div className="section-controls">
                  <div className="search-group">
                    <div className="search-input-container">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search"
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="category-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="action-btn primary">
                    <span className="btn-icon">➕</span>
                    Add Medication
                  </button>
                </div>
              </div>

              <div className="inventory-grid">
                {filteredMedications.map(medication => (
                  <div key={medication.id} className={`medication-card ${medication.status}`}>
                    <div className="medication-header">
                      <div className="medication-info">
                        <h4 className="medication-name">{medication.name}</h4>
                        <span className="medication-strength">{medication.strength}</span>
                      </div>
                      <div 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(medication.status) }}
                      >
                        {getStatusLabel(medication.status)}
                      </div>
                    </div>

                    <div className="medication-details">
                      <div className="detail-row">
                        <span className="detail-label">Stock Level:</span>
                        <span className={`detail-value ${medication.stockLevel <= medication.minStock ? 'warning' : ''}`}>
                          {medication.stockLevel} units
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Min Stock:</span>
                        <span className="detail-value">{medication.minStock} units</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value">${medication.price.toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Expiry:</span>
                        <span className="detail-value">{medication.expiryDate}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Batch:</span>
                        <span className="detail-value">{medication.batchNo}</span>
                      </div>
                    </div>

                    
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="prescriptions-section">
              <div className="section-header">
                <h3 className="section-title">Prescription Management</h3>
                <div className="section-controls">
                  <div className="search-input-container">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search prescriptions..."
                      className="search-input"
                      value={prescriptionSearch}
                      onChange={(e) => setPrescriptionSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="prescriptions-list">
                {filteredPrescriptions.map(prescription => (
                  <div key={prescription.id} className="prescription-card">
                    <div className="prescription-header">
                      <div className="prescription-info">
                        <h4 className="prescription-id">#{prescription.id}</h4>
                        <div className="patient-info">
                          <span className="patient-name">{prescription.patientName}</span>
                          <span className="patient-id">ID: {prescription.patientId}</span>
                        </div>
                      </div>
                      <div 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(prescription.status) }}
                      >
                        {getStatusLabel(prescription.status)}
                      </div>
                    </div>

                    <div className="prescription-details">
                      <div className="detail-row">
                        <span className="detail-label">Doctor:</span>
                        <span className="detail-value">{prescription.doctorName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{prescription.date}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Total Amount:</span>
                        <span className="detail-value price">${prescription.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="medications-list">
                      <h5 className="medications-title">Medications:</h5>
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="medication-item">
                          <span className="med-name">{med.name}</span>
                          <span className="med-quantity">Qty: {med.quantity}</span>
                          <span className="med-instructions">{med.instructions}</span>
                        </div>
                      ))}
                    </div>

                    <div className="prescription-actions">
                      <button className="action-btn-small secondary">
                        <span className="btn-icon">👁️</span>
                        View Details
                      </button>
                      {prescription.status === "pending" && (
                        <button className="action-btn-small primary">
                          <span className="btn-icon">✅</span>
                          Process
                        </button>
                      )}
                      {prescription.status === "ready" && (
                        <button className="action-btn-small success">
                          <span className="btn-icon">🎯</span>
                          Dispense
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="analytics-section">
              <h3 className="section-title">Pharmacy Analytics</h3>
              
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4 className="analytics-title">Stock Status Distribution</h4>
                  <div className="chart-placeholder">
                    <div className="stock-breakdown">
                      <div className="stock-item">
                        <div className="stock-color available"></div>
                        <span>Available: {stockStats.available}</span>
                      </div>
                      <div className="stock-item">
                        <div className="stock-color low-stock"></div>
                        <span>Low Stock: {stockStats.lowStock}</span>
                      </div>
                      <div className="stock-item">
                        <div className="stock-color out-of-stock"></div>
                        <span>Out of Stock: {stockStats.outOfStock}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h4 className="analytics-title">Prescription Status</h4>
                  <div className="chart-placeholder">
                    <div className="prescription-breakdown">
                      <div className="prescription-item">
                        <div className="prescription-color pending"></div>
                        <span>Pending: {prescriptionStats.pending}</span>
                      </div>
                      <div className="prescription-item">
                        <div className="prescription-color ready"></div>
                        <span>Ready: {prescriptionStats.ready}</span>
                      </div>
                      <div className="prescription-item">
                        <div className="prescription-color completed"></div>
                        <span>Completed: {prescriptionStats.completed}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analytics-card full-width">
                  <h4 className="analytics-title">Quick Actions</h4>
                  <div className="quick-actions">
                    <button className="quick-action-btn">
                      <span className="quick-icon">📊</span>
                      <span>Generate Stock Report</span>
                    </button>
                    <button className="quick-action-btn">
                      <span className="quick-icon">📋</span>
                      <span>Export Prescriptions</span>
                    </button>
                    <button className="quick-action-btn">
                      <span className="quick-icon">⚠️</span>
                      <span>Low Stock Alert</span>
                    </button>
                    <button className="quick-action-btn">
                      <span className="quick-icon">📅</span>
                      <span>Expiry Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('DoctorPharmacy Error:', error);
    return (
      <div className="doctor-pharmacy-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Error Loading Pharmacy Interface</h2>
        <p>There was an error loading the pharmacy data. Please refresh the page or check the console for details.</p>
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
          <p><strong>Error Details:</strong></p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }
}

export default DoctorPharmacy;