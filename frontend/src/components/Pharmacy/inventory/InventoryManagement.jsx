import React, { useState, useEffect } from "react";
import "./InventoryManagement.css";
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';
import { usePrescription } from "../../../contexts/PrescriptionContext";
import { useMedicineInventory } from "../../../contexts/MedicineInventoryContext";

function InventoryManagement() {
  const { 
    prescriptions, 
    dispensedPrescriptions, 
    dispensePrescription: contextDispensePrescription,
    addPrescription 
  } = usePrescription();

  const {
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    dispenseMedicines,
    getLowStockMedicines,
    getExpiredMedicines,
    getNearExpiryMedicines
  } = useMedicineInventory();

  const { alertState, showError, showSuccess, hideAlert } = useAlert();

  const [activeTab, setActiveTab] = useState("inventory");

  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    expiry: "",
    category: "",
    minStock: "",
    dosage: "",
    batchNumber: "",
  });

  const getStatus = (medicine) => {
    const today = new Date();
    const expiryDate = new Date(medicine.expiry);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (expiryDate < today) {
      return "Expired";
    } else if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      return "Near Expiry";
    } else if (medicine.quantity <= medicine.minStock) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  const dispensePrescription = (prescriptionId) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return;

    let canDispense = true;
    const insufficientMedicines = [];

    prescription.medicines.forEach(prescMed => {
      const medicine = medicines.find(m => m.id === prescMed.medicineId);
      if (!medicine || medicine.quantity < prescMed.quantity) {
        canDispense = false;
        insufficientMedicines.push(prescMed.medicineName);
      }
    });

    if (!canDispense) {
      showError(`Cannot dispense prescription. Insufficient stock for: ${insufficientMedicines.join(", ")}`, 'Insufficient Stock');
      return;
    }

    // Use the context function to update medicine quantities
    dispenseMedicines(prescription.medicines);
    contextDispensePrescription(prescriptionId);

    // Show success message
    showSuccess(`Prescription #${prescriptionId} has been successfully dispensed for ${prescription.patientName}!`, 'Prescription Dispensed');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Stock":
        return "status in-stock";
      case "Low Stock":
        return "status low-stock";
      case "Near Expiry":
        return "status near-expiry";
      case "Expired":
        return "status expired";
      default:
        return "status";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent negative values for quantity and minStock fields
    if ((name === 'quantity' || name === 'minStock') && value < 0) {
      return; // Don't update the state if the value is negative
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      name: "",
      quantity: "",
      expiry: "",
      category: "",
      minStock: "",
      dosage: "",
      batchNumber: "",
    });
    setShowModal(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      quantity: medicine.quantity.toString(),
      expiry: medicine.expiry,
      category: medicine.category,
      minStock: medicine.minStock.toString(),
      dosage: medicine.dosage || "",
      batchNumber: medicine.batchNumber || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMedicine(null);
    setFormData({
      name: "",
      quantity: "",
      expiry: "",
      category: "",
      minStock: "",
      dosage: "",
      batchNumber: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.quantity || !formData.expiry || !formData.category || !formData.minStock || !formData.dosage || !formData.batchNumber) {
      showError('Please fill in all fields', 'Form Validation Error');
      return;
    }

    // Validate quantity is not negative and is a valid number
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 0) {
      showError('Quantity cannot be negative. Medicine not added.', 'Validation Error');
      return;
    }

    // Validate minimum stock level is not negative and is a valid number
    const minStock = parseInt(formData.minStock);
    if (isNaN(minStock) || minStock < 0) {
      showError('Minimum Stock Level cannot be negative. Medicine not added.', 'Validation Error');
      return;
    }

    const medicineData = {
      name: formData.name,
      quantity: quantity,
      expiry: formData.expiry,
      category: formData.category,
      minStock: minStock,
      dosage: formData.dosage,
      batchNumber: formData.batchNumber,
    };

    if (editingMedicine) {
      // Edit existing medicine using context
      updateMedicine(editingMedicine.id, medicineData);
      showSuccess(`${medicineData.name} has been successfully updated!`, 'Medicine Updated');
    } else {
      // Add new medicine using context
      addMedicine(medicineData);
      showSuccess(`${medicineData.name} has been successfully added to inventory!`, 'Medicine Added');
    }

    closeModal();
  };

  const handleDeleteMedicine = (id) => {
    // Find the medicine name before deletion for the success message
    const medicineToDelete = medicines.find(med => med.id === id);
    const medicineName = medicineToDelete ? medicineToDelete.name : 'Medicine';

    if (window.confirm("Are you sure you want to delete this medicine?")) {
      deleteMedicine(id);
      showSuccess(`${medicineName} has been successfully deleted from inventory!`, 'Medicine Deleted');
    }
  };

  const lowStockMedicines = getLowStockMedicines();
  const expiredMedicines = getExpiredMedicines();
  const nearExpiryMedicines = getNearExpiryMedicines();


  return (
    <div className="inventory-container">
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
      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button 
          className={activeTab === "inventory" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("inventory")}
        >
          Inventory Management
        </button>
        <button 
          className={activeTab === "prescriptions" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("prescriptions")}
        >
          Prescription Queue ({prescriptions.length})
        </button>
        <button 
          className={activeTab === "dispensed" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("dispensed")}
        >
          Dispensed History
        </button>
      </div>

      {/* Alerts Section */}
      {(lowStockMedicines.length > 0 || expiredMedicines.length > 0 || nearExpiryMedicines.length > 0) && (
        <div className="alerts-section">
          {lowStockMedicines.length > 0 && (
            <div className="alert low-stock-alert">
              <h4>⚠️ Low Stock Alert</h4>
              <p>{lowStockMedicines.length} medicine(s) are running low: {lowStockMedicines.map(med => med.name).join(", ")}</p>
            </div>
          )}
          {nearExpiryMedicines.length > 0 && (
            <div className="alert near-expiry-alert">
              <h4>⏰ Near Expiry Alert</h4>
              <p>{nearExpiryMedicines.length} medicine(s) expire within 30 days: {nearExpiryMedicines.map(med => med.name).join(", ")}</p>
            </div>
          )}
          {expiredMedicines.length > 0 && (
            <div className="alert expired-alert">
              <h4>🚨 Expired Medicines</h4>
              <p>{expiredMedicines.length} medicine(s) have expired: {expiredMedicines.map(med => med.name).join(", ")}</p>
            </div>
          )}
        </div>
      )}

      {/* Inventory Tab Content */}
      {activeTab === "inventory" && (
        <>
          <div className="inventory-header">
            <h2>Inventory Management</h2>
            <button className="add-medicine-btn" onClick={openAddModal}>
              + Add Medicine
            </button>
          </div>

          <table className="inventory-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Quantity</th>
                <th>Min Stock</th>
                <th>Expiry Date</th>
                <th>Category</th>
                <th>Batch No.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((item) => {
                const status = getStatus(item);
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.dosage}</td>
                    <td>{item.quantity}</td>
                    <td>{item.minStock}</td>
                    <td>{item.expiry}</td>
                    <td>{item.category}</td>
                    <td>{item.batchNumber}</td>
                    <td className={getStatusClass(status)}>{status}</td>
                    <td>
                      <button 
                        className="edit-btn" 
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteMedicine(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {medicines.length === 0 && (
            <div className="empty-state">
              <p>No medicines in inventory. Click "Add Medicine" to get started.</p>
            </div>
          )}
        </>
      )}

      {/* Prescription Queue Tab Content */}
      {activeTab === "prescriptions" && (
        <div className="prescriptions-section">
          <div className="section-header">
            <h2>Prescription Queue</h2>
            <p>Prescriptions waiting to be dispensed</p>
          </div>
          
          {prescriptions.length === 0 ? (
            <div className="empty-state">
              <p>No pending prescriptions.</p>
            </div>
          ) : (
            <div className="prescriptions-grid">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-card">
                  <div className="prescription-header">
                    <h3>Prescription #{prescription.id}</h3>
                    <span className="prescription-date">{prescription.prescriptionDate}</span>
                  </div>
                  
                  <div className="patient-info">
                    <p><strong>Patient:</strong> {prescription.patientName} (ID: {prescription.patientId})</p>
                    <p><strong>Doctor:</strong> {prescription.doctorName}</p>
                  </div>
                  
                  <div className="medicines-list">
                    <h4>Prescribed Medicines:</h4>
                    {prescription.medicines.map((med, index) => {
                      const availableMedicine = medicines.find(m => m.id === med.medicineId);
                      const isAvailable = availableMedicine && availableMedicine.quantity >= med.quantity;
                      
                      return (
                        <div key={index} className={`medicine-item ${!isAvailable ? 'insufficient' : ''}`}>
                          <div className="medicine-details">
                            <span className="medicine-name">{med.medicineName} ({med.dosage})</span>
                            <span className="medicine-quantity">Qty: {med.quantity}</span>
                            {!isAvailable && (
                              <span className="availability-warning">
                                ⚠️ Available: {availableMedicine ? availableMedicine.quantity : 0}
                              </span>
                            )}
                          </div>
                          <p className="instructions">{med.instructions}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="prescription-actions">
                    <button 
                      className="dispense-btn"
                      onClick={() => dispensePrescription(prescription.id)}
                    >
                      Dispense Prescription
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dispensed History Tab Content */}
      {activeTab === "dispensed" && (
        <div className="dispensed-section">
          <div className="section-header">
            <h2>Dispensed Prescriptions History</h2>
            <p>Previously dispensed prescriptions</p>
          </div>
          
          {dispensedPrescriptions.length === 0 ? (
            <div className="empty-state">
              <p>No prescriptions have been dispensed yet.</p>
            </div>
          ) : (
            <div className="dispensed-grid">
              {dispensedPrescriptions.map((prescription) => (
                <div key={prescription.id} className="dispensed-card">
                  <div className="prescription-header">
                    <h3>Prescription #{prescription.id}</h3>
                    <div className="dates">
                      <span className="prescription-date">Prescribed: {prescription.prescriptionDate}</span>
                      <span className="dispensed-date">Dispensed: {prescription.dispensedDate} at {prescription.dispensedTime}</span>
                    </div>
                  </div>
                  
                  <div className="patient-info">
                    <p><strong>Patient:</strong> {prescription.patientName} (ID: {prescription.patientId})</p>
                    <p><strong>Doctor:</strong> {prescription.doctorName}</p>
                  </div>
                  
                  <div className="medicines-list">
                    <h4>Dispensed Medicines:</h4>
                    {prescription.medicines.map((med, index) => (
                      <div key={index} className="medicine-item dispensed">
                        <div className="medicine-details">
                          <span className="medicine-name">{med.medicineName} ({med.dosage})</span>
                          <span className="medicine-quantity">Qty: {med.quantity}</span>
                        </div>
                        <p className="instructions">{med.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMedicine ? "Edit Medicine" : "Add New Medicine"}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Medicine Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter medicine name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="minStock">Minimum Stock Level *</label>
                <input
                  type="number"
                  id="minStock"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  placeholder="Enter minimum stock level"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="expiry">Expiry Date *</label>
                <input
                  type="date"
                  id="expiry"
                  name="expiry"
                  value={formData.expiry}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dosage">Dosage *</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g., 500mg, 250mg"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="batchNumber">Batch Number *</label>
                <input
                  type="text"
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  placeholder="Enter batch number"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Analgesic">Analgesic</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Anti-inflammatory">Anti-inflammatory</option>
                  <option value="Antacid">Antacid</option>
                  <option value="Vitamin">Vitamin</option>
                  <option value="Antiseptic">Antiseptic</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="button" className="save-btn" onClick={handleSubmit}>
                  {editingMedicine ? "Update Medicine" : "Add Medicine"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryManagement;