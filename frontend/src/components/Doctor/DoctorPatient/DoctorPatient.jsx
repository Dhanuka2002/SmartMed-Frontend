import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DoctorPatient.css";
import qr from "../../../assets/qr.png";
import patientAvatar from "../../../assets/student.jpg";

function DoctorPatient() {
  const [activeTab, setActiveTab] = useState("prescription");
  const [vitals, setVitals] = useState({
    bloodPressure: "120/80",
    heartRate: "72 bpm",
    temperature: "98.6°F",
    weight: "70 kg",
    height: "175 cm",
  });

  const [medicines, setMedicines] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/medicines")
      .then((response) => {
        setMedicines(response.data);
      })
      .catch((error) => {
        console.error("Error fetching medicines:", error);
        setMedicines([]);
      });
  }, []);

  const patientInfo = {
    name: "Franklin Jhon",
    id: "22IT099",
    age: 24,
    gender: "Male",
    division: "IT Department",
    phone: "+94 77 123 4567",
    email: "franklin.jhon@company.com",
    allergies: ["Penicillin", "Shellfish"],
    bloodType: "O+",
    lastVisit: "2025-06-15",
    emergencyContact: "+94 71 987 6543",
  };

  const medicalHistory = [
    { date: "2025-06-15", condition: "Annual Check-up", doctor: "Dr. Smith" },
    { date: "2025-03-22", condition: "Common Cold", doctor: "Dr. Johnson" },
    { date: "2024-11-10", condition: "Vaccination", doctor: "Dr. Brown" },
  ];

  const handlePrescriptionAdd = (medicine) => {
    const existing = prescriptionItems.find((item) => item.id === medicine.id);
    if (existing) {
      setPrescriptionItems(
        prescriptionItems.map((item) =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setPrescriptionItems([
        ...prescriptionItems,
        { id: medicine.id, name: medicine.name, quantity: 1 },
      ]);
    }
  };

  const handleSign = () => {
    if (prescriptionItems.length === 0) {
      alert("Please add at least one medicine before completing the prescription.");
      return;
    }

    const payload = {
      patientId: patientInfo.id,
      medicines: prescriptionItems.map(({ id, quantity }) => ({
        medicineId: id,
        quantity: quantity,
      })),
      date: new Date().toISOString(),
    };

    console.log("Sending prescription payload:", payload);

    axios
      .post("http://localhost:8081/api/prescriptions/complete", payload)
      .then(() => {
        alert("Prescription signed and inventory updated!");

        return axios.post("http://localhost:8081/api/prescriptions/queue", {
          patientId: patientInfo.id,
          prescriptionDate: payload.date,
          medicines: payload.medicines,
        });
      })
      .then(() => {
        alert("Prescription added to queue successfully!");
        setPrescriptionItems([]); // Clear the form
      })
      .catch((err) => {
        console.error("Error:", err);
        if (err.response) {
          alert(`Failed: ${err.response.data}`);
        } else {
          alert("Failed to complete the process.");
        }
      });
  };

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="doctor-patient-container">
      {/* Patient Header */}
      <div className="patient-header-section">
        <div className="patient-card">
          <div className="patient-avatar-section">
            <div className="avatar-container">
              <img src={patientAvatar} alt="Patient Avatar" className="patient-avatar-img" />
              <div className="status-indicator online"></div>
            </div>
            <div className="patient-basic-info">
              <h2 className="patient-name">{patientInfo.name}</h2>
              <p className="patient-id">Patient ID: {patientInfo.id}</p>
              <div className="patient-tags">
                <span className="tag priority">Priority</span>
                <span className="tag division">{patientInfo.division}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="content-tabs">
        <div className="tab-header">
          <button
            className={`tab-btn ${activeTab === "prescription" ? "active" : ""}`}
            onClick={() => setActiveTab("prescription")}
          >
            📝 Prescription
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📚 Medical History
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "prescription" && (
            <div className="prescription-section">
              <div className="prescription-header">
                <h3 className="section-title">Write Prescription</h3>
                <div className="prescription-date">
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="prescription-content">
                <div className="prescription-form">
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: "8px",
                      width: "100%",
                      marginBottom: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />

                  <div className="quick-prescription">
                    <h4 className="quick-title">Quick Add Medicines:</h4>
                    <div className="quick-buttons">
                      {filteredMedicines.length > 0 ? (
                        filteredMedicines.map((med) => (
                          <button
                            key={med.id}
                            className="quick-btn"
                            type="button"
                            onClick={() => handlePrescriptionAdd(med)}
                          >
                            + {med.name}
                          </button>
                        ))
                      ) : (
                        <p>No medicines found</p>
                      )}
                    </div>
                  </div>

                  <div className="selected-medicines">
                    <h4 className="quick-title">Selected Medicines:</h4>
                    {prescriptionItems.length === 0 && <p>No medicines selected</p>}
                    <ul>
                      {prescriptionItems.map((item) => (
                        <li key={item.id}>
                          {item.name} -
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            style={{ width: "50px", marginLeft: "5px" }}
                            onChange={(e) =>
                              setPrescriptionItems(
                                prescriptionItems.map((med) =>
                                  med.id === item.id
                                    ? { ...med, quantity: parseInt(e.target.value) || 1 }
                                    : med
                                )
                              )
                            }
                          />
                          <button
                            style={{ marginLeft: "10px" }}
                            onClick={() =>
                              setPrescriptionItems(
                                prescriptionItems.filter((med) => med.id !== item.id)
                              )
                            }
                          >
                            ❌
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="prescription-actions">
                    <button className="action-btn secondary" disabled>
                      <span className="btn-icon">💾</span>
                      Save Draft
                    </button>
                    <button className="action-btn primary" onClick={handleSign}>
                      <span className="btn-icon">✍️</span>
                      e-Sign & Complete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="history-section">
              <h3 className="section-title">Medical History</h3>
              {medicalHistory.map((record, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    <span className="date">{record.date}</span>
                  </div>
                  <div className="history-details">
                    <h4 className="history-condition">{record.condition}</h4>
                    <p className="history-doctor">Treated by: {record.doctor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPatient;
