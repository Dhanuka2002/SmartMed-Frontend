import React, { useState, useEffect } from "react";
import "./InventoryManagement.css";
import AlertMessage from '../../Common/AlertMessage';
import useAlert from '../../../hooks/useAlert';
import { useMedicineInventory } from "../../../contexts/MedicineInventoryContext";

function InventoryManagement() {
  // Prescriptions tab removed; prescription context not needed here

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

  // Prescription dispensing removed from this view. Use a dedicated prescription component if needed.

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
      {/* Navigation Tabs (only Inventory) */}
      <div className="tab-navigation">
        <button 
          className="tab-button active"
        >
          Inventory Management
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