import React from "react";
import "./InventoryManagement.css";

function InventoryManagement() {
  const medicines = [
    {
      name: "Paracetamol",
      quantity: 100,
      expiry: "2025/08/10",
      category: "Analgesic",
      status: "Low Stock",
    },
    {
      name: "Paracetamol",
      quantity: 100,
      expiry: "2025/08/10",
      category: "Analgesic",
      status: "In Stock",
    },
    {
      name: "Paracetamol",
      quantity: 100,
      expiry: "2025/08/10",
      category: "Analgesic",
      status: "Expired",
    },
    {
      name: "Paracetamol",
      quantity: 100,
      expiry: "2025/08/10",
      category: "Analgesic",
      status: "In Stock",
    },
    {
      name: "Paracetamol",
      quantity: 100,
      expiry: "2025/08/10",
      category: "Analgesic",
      status: "Expired",
    },
    {
      name: "Paracetamol",
      quantity: 100,
      expiry: "2025/08/10",
      category: "Analgesic",
      status: "Low Stock",
    
    },
    {
      name: "Paracetamol",
      quantity: 100,
      expiry: "2025/08/10",
      category: "Analgesic",
      status: "Expired",
    },
    {
      name: "Paracetamol",
      quantity: 100,
      expiry: "2025/08/10",
      category: "Analgesic",
      status: "In Stock",
    }
    // Add more rows if needed
  ];

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

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <button className="add-medicine-btn">+ Add Medicine</button>
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
          {medicines.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.expiry}</td>
              <td>{item.category}</td>
              <td className={getStatusClass(item.status)}>{item.status}</td>
              <td>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryManagement;
