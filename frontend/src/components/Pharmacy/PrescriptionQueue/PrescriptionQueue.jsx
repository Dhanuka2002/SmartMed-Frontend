import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PrescriptionQueue.css";
import { FiCalendar } from "react-icons/fi";

function PrescriptionQueue() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch prescriptions when component mounts
  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/prescriptions/all"); 
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Error fetching prescription queue:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="queue-container">
        <h2>Loading prescription queue...</h2>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="queue-container">
        <h2>No prescriptions in the queue.</h2>
      </div>
    );
  }

  return (
    <div className="queue-container">
      <h1 className="title">Prescription Queue</h1>
      <div className="cards">
        {prescriptions.map((p) => (
          <div className="card" key={p.id}>
            <div className="left">
              <div className="name">{p.studentName || "Unknown Patient"}</div>
              <div className="info">
                <span>ID: {p.studentId || "N/A"}</span>
                <span className="status">Status: {p.status}</span>
                <span className="medicines">
                  Medicines: {p.medicines || "No medicines"}
                </span>
                <span className="date">
                  <FiCalendar size={16} style={{ marginRight: "4px" }} />
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <button className="details-btn">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrescriptionQueue;
