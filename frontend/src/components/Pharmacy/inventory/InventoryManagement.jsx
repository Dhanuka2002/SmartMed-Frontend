import React, { useState, useEffect } from "react";
import "./InventoryManagement.css";

function InventoryManagement() {
  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Track the medicine we want to edit; null means "add new"
  const [editMedicine, setEditMedicine] = useState(null);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    quantity: "",
    expiry: "",
    category: "",
    status: "In Stock",
  });

  // Fetch medicines on component load
  useEffect(() => {
    fetchMedicines();
  }, []);

  // If editMedicine changes, update the form fields
  useEffect(() => {
    if (editMedicine) {
      setNewMedicine({
        name: editMedicine.name,
        quantity: editMedicine.quantity,
        expiry: editMedicine.expiry,
        category: editMedicine.category,
        status: editMedicine.status,
        id: editMedicine.id,
      });
      setShowForm(true);
    } else {
      setNewMedicine({
        name: "",
        quantity: "",
        expiry: "",
        category: "",
        status: "In Stock",
      });
    }
  }, [editMedicine]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/medicines");
      if (!response.ok) throw new Error("Failed to fetch medicines");
      const data = await response.json();
      setMedicines(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching medicines");
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
    setNewMedicine({ ...newMedicine, [name]: value });
  };

  // Handle form submit for add or edit
  const handleSaveMedicine = async (e) => {
    e.preventDefault();

    if (!newMedicine.name || !newMedicine.quantity || !newMedicine.expiry) {
      alert("Please fill in all required fields!");
      return;
    }

    // Automatically set status based on quantity
    let status = "In Stock";
    if (Number(newMedicine.quantity) < 20) {
      status = "Low Stock";
    }

    const medicineToSave = { ...newMedicine, status };

    try {
      let response;
      if (editMedicine) {
        // Editing existing medicine - PUT request
        response = await fetch(
          `http://localhost:8081/api/medicines/${newMedicine.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(medicineToSave),
          }
        );
      } else {
        // Adding new medicine - POST request
        response = await fetch("http://localhost:8081/api/medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(medicineToSave),
        });
      }

      if (!response.ok) throw new Error("Failed to save medicine");

      await fetchMedicines();

      setNewMedicine({
        name: "",
        quantity: "",
        expiry: "",
        category: "",
        status: "In Stock",
      });
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Error saving medicine");
    }
  };

  // Delete medicine by id
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;

    try {
      const response = await fetch(
        `http://localhost:8081/api/medicines/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete medicine");

      setMedicines(medicines.filter((med) => med.id !== id));
    } catch (error) {
      console.error(error);
      alert("Error deleting medicine");
    }
  };

  // Open modal to edit existing medicine
  const openEditModal = (medicine) => {
    setEditMedicine(medicine);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowForm(false);
      setIsClosing(false);
      setEditMedicine(null);
    }, 300);
  };

  return (
    <div className={`inventory-container ${showForm ? "modal-open" : ""}`}>
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <button
          className="add-medicine-btn"
          onClick={() => {
            setEditMedicine(null); // new medicine mode
            setShowForm(true);
          }}
        >
          + Add Medicine
        </button>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Quantity</th>
            <th>Expiry Date</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.expiry}</td>
              <td>{item.category}</td>
              <td className={getStatusClass(item.status)}>{item.status}</td>
              <td>
                <button className="edit-btn" onClick={() => openEditModal(item)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className={`modal ${isClosing ? "closing" : ""}`}>
          <div className="modal-content">
            <h3>{editMedicine ? "Edit Medicine" : "Add Medicine"}</h3>
            <form onSubmit={handleSaveMedicine}>
              <input
                type="text"
                name="name"
                placeholder="Medicine Name"
                value={newMedicine.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={newMedicine.quantity}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="expiry"
                value={newMedicine.expiry}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={newMedicine.category}
                onChange={handleInputChange}
              />


              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {editMedicine ? "Update" : "Save"}
                </button>
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryManagement;
