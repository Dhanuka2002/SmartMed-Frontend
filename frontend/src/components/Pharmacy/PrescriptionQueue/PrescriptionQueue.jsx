import React from "react";
import "./PrescriptionQueue.css";
import { FiCalendar } from "react-icons/fi";

const prescriptions = Array(5).fill({
  name: "Franklin Jhon",
  id: "22IT0999",
  date: "2025/04/20",
});

function PrescriptionQueue() {
  return (
    <div className="queue-container">
      <h1 className="title">Prescription Queue</h1>
      <div className="cards">
        {prescriptions.map((p, index) => (
          <div className="card" key={index}>
            <div className="left">
              <div className="name">{p.name}</div>
              <div className="info">
                <span>{p.id}</span>
                <span className="date">
                  <FiCalendar size={16} style={{ marginRight: "4px" }} />
                  {p.date}
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
