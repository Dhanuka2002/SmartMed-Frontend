import React, { useState } from "react";

function InventoryManagement() {
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "Paracetamol",
      quantity: 15,
      expiry: "2025-08-10",
      category: "Analgesic",
      minStock: 20,
    },
    {
      id: 2,
      name: "Amoxicillin",
      quantity: 50,
      expiry: "2025-12-15",
      category: "Antibiotic",
      minStock: 30,
    },
    {
      id: 3,
      name: "Aspirin",
      quantity: 5,
      expiry: "2024-06-20",
      category: "Analgesic",
      minStock: 25,
    },
    {
      id: 4,
      name: "Ibuprofen",
      quantity: 75,
      expiry: "2026-03-10",
      category: "Anti-inflammatory",
      minStock: 20,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    expiry: "",
    category: "",
    minStock: "",
  });

  const getStatus = (medicine) => {
    const today = new Date();
    const expiryDate = new Date(medicine.expiry);
    
    if (expiryDate < today) {
      return "Expired";
    } else if (medicine.quantity <= medicine.minStock) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Stock":
        return "status in-stock";
      case "Low Stock":
        return "status low-stock";
      case "Expired":
        return "status expired";
      default:
        return "status";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.quantity || !formData.expiry || !formData.category || !formData.minStock) {
      alert("Please fill in all fields");
      return;
    }

    const medicineData = {
      name: formData.name,
      quantity: parseInt(formData.quantity),
      expiry: formData.expiry,
      category: formData.category,
      minStock: parseInt(formData.minStock),
    };

    if (editingMedicine) {
      // Edit existing medicine
      setMedicines(prev => prev.map(med => 
        med.id === editingMedicine.id 
          ? { ...medicineData, id: editingMedicine.id }
          : med
      ));
    } else {
      // Add new medicine
      const newMedicine = {
        ...medicineData,
        id: Date.now(), // Simple ID generation
      };
      setMedicines(prev => [...prev, newMedicine]);
    }

    closeModal();
  };

  const deleteMedicine = (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      setMedicines(prev => prev.filter(med => med.id !== id));
    }
  };

  const lowStockMedicines = medicines.filter(med => getStatus(med) === "Low Stock");
  const expiredMedicines = medicines.filter(med => getStatus(med) === "Expired");

  return (
    <div className="inventory-container">
      {/* Alerts Section */}
      {(lowStockMedicines.length > 0 || expiredMedicines.length > 0) && (
        <div className="alerts-section">
          {lowStockMedicines.length > 0 && (
            <div className="alert low-stock-alert">
              <h4>⚠️ Low Stock Alert</h4>
              <p>{lowStockMedicines.length} medicine(s) are running low: {lowStockMedicines.map(med => med.name).join(", ")}</p>
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
            <th>Quantity</th>
            <th>Min Stock</th>
            <th>Expiry Date</th>
            <th>Category</th>
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
                <td>{item.quantity}</td>
                <td>{item.minStock}</td>
                <td>{item.expiry}</td>
                <td>{item.category}</td>
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
                    onClick={() => deleteMedicine(item.id)}
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