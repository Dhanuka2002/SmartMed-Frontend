import React, { useState } from "react";
import "./DoctorPharmacy.css";

function DoctorPharmacy() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [prescriptionSearch, setPrescriptionSearch] = useState("");

  // Mock pharmacy data
  const [medications] = useState([
    {
      id: 1,
      name: "Paracetamol",
      strength: "500mg",
      category: "analgesic",
      stockLevel: 150,
      minStock: 50,
      price: 2.50,
      manufacturer: "PharmaCorp",
      expiryDate: "2026-08-15",
      batchNo: "PCM001",
      status: "available"
    },
    {
      id: 2,
      name: "Amoxicillin",
      strength: "250mg",
      category: "antibiotic",
      stockLevel: 25,
      minStock: 30,
      price: 8.75,
      manufacturer: "MediLab",
      expiryDate: "2025-12-10",
      batchNo: "AMX002",
      status: "low_stock"
    },
    {
      id: 3,
      name: "Ibuprofen",
      strength: "400mg",
      category: "analgesic",
      stockLevel: 0,
      minStock: 40,
      price: 3.25,
      manufacturer: "HealthCorp",
      expiryDate: "2025-09-22",
      batchNo: "IBU003",
      status: "out_of_stock"
    },
    {
      id: 4,
      name: "Vitamin D3",
      strength: "1000IU",
      category: "vitamin",
      stockLevel: 200,
      minStock: 60,
      price: 12.00,
      manufacturer: "VitaHealth",
      expiryDate: "2027-03-18",
      batchNo: "VD3004",
      status: "available"
    },
    {
      id: 5,
      name: "Aspirin",
      strength: "75mg",
      category: "analgesic",
      stockLevel: 80,
      minStock: 50,
      price: 1.50,
      manufacturer: "CardioMed",
      expiryDate: "2026-01-30",
      batchNo: "ASP005",
      status: "available"
    },
    {
      id: 6,
      name: "Omeprazole",
      strength: "20mg",
      category: "antacid",
      stockLevel: 15,
      minStock: 25,
      price: 15.50,
      manufacturer: "GastroPharm",
      expiryDate: "2025-11-05",
      batchNo: "OME006",
      status: "low_stock"
    }
  ]);

  const [prescriptions] = useState([
    {
      id: "RX001",
      patientName: "Franklin Jhon",
      patientId: "22IT099",
      doctorName: "Dr. Smith",
      date: "2025-07-21",
      status: "pending",
      medications: [
        { name: "Paracetamol 500mg", quantity: 30, instructions: "Take 1 tablet twice daily" },
        { name: "Vitamin D3 1000IU", quantity: 60, instructions: "Take 1 tablet daily" }
      ],
      totalAmount: 87.00
    },
    {
      id: "RX002",
      patientName: "Sarah Wilson",
      patientId: "22IT045",
      doctorName: "Dr. Johnson",
      date: "2025-07-21",
      status: "completed",
      medications: [
        { name: "Amoxicillin 250mg", quantity: 21, instructions: "Take 1 capsule three times daily" }
      ],
      totalAmount: 183.75
    },
    {
      id: "RX003",
      patientName: "Michael Brown",
      patientId: "22IT078",
      doctorName: "Dr. Davis",
      date: "2025-07-20",
      status: "ready",
      medications: [
        { name: "Ibuprofen 400mg", quantity: 20, instructions: "Take as needed for pain" },
        { name: "Omeprazole 20mg", quantity: 30, instructions: "Take once daily before meals" }
      ],
      totalAmount: 530.00
    }
  ]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "analgesic", label: "Analgesics" },
    { value: "antibiotic", label: "Antibiotics" },
    { value: "vitamin", label: "Vitamins" },
    { value: "antacid", label: "Antacids" }
  ];

  // Filter medications
  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(prescriptionSearch.toLowerCase()) ||
    prescription.patientId.toLowerCase().includes(prescriptionSearch.toLowerCase()) ||
    prescription.id.toLowerCase().includes(prescriptionSearch.toLowerCase())
  );

  // Get status stats
  const stockStats = {
    total: medications.length,
    available: medications.filter(m => m.status === "available").length,
    lowStock: medications.filter(m => m.status === "low_stock").length,
    outOfStock: medications.filter(m => m.status === "out_of_stock").length
  };

  const prescriptionStats = {
    pending: prescriptions.filter(p => p.status === "pending").length,
    ready: prescriptions.filter(p => p.status === "ready").length,
    completed: prescriptions.filter(p => p.status === "completed").length
  };

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
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <span className="stat-value">{stockStats.total}</span>
              <span className="stat-label">Total Medications</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <span className="stat-value">{stockStats.lowStock}</span>
              <span className="stat-label">Low Stock</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <span className="stat-value">{prescriptionStats.pending}</span>
              <span className="stat-label">Pending Scripts</span>
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
                        placeholder="Search medications..."
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

                    <div className="medication-actions">
                      <button className="action-btn-small secondary">
                        <span className="btn-icon">✏️</span>
                        Edit
                      </button>
                      <button className="action-btn-small primary">
                        <span className="btn-icon">📈</span>
                        Restock
                      </button>
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
}

export default DoctorPharmacy;