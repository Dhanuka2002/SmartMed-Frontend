import React, { useState, useEffect } from "react";
import "./StudentDashboard.css";
import qrCode from "../../../assets/qr.png";
import studentAvatar from "../../../assets/student.jpg";
import doctorImage from "../../../assets/doctors.png";

function Dashboard() {
  const [showQRForm, setShowQRForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    batch: "",
    department: "",
    email: "",
    password: "",
  });
  const [studentData, setStudentData] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/api/students/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to save student data");
      }

      const savedStudent = await response.json();
      localStorage.setItem("studentId", savedStudent.id);
      setStudentData(savedStudent);
      setShowQRForm(false);
      alert("Student info saved successfully!");
    } catch (error) {
      console.error("Error saving student data:", error);
      alert("Error saving student data.");
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem("studentName");
    if (storedName && !studentData) {
      setStudentData((prev) => ({ ...prev, fullName: storedName }));
    }
  }, [studentData]);
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back to your health portal
            </p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="greeting">
                Hello, {studentData?.fullName || "Student"}!
              </span>
              <div className="user-status">
                <span className="status-dot"></span>
                <span className="status-text">Active</span>
              </div>
            </div>
            <div className="avatar-container">
              <img
                src={studentAvatar}
                alt="Student Avatar"
                className="avatar"
              />
            </div>
          </div>
        </div>
      </header>

      {!showQRForm ? (
        <section className="generate-qr-card">
          <div className="generate-qr-content">
            <h2 className="generate-qr-title">Generate New QR Code</h2>
            <p className="generate-qr-desc">
              Click the button to generate a new QR code for your student
              profile or appointments.
            </p>
          </div>
          <button
            className="generate-qr-btn"
            onClick={() => setShowQRForm(true)}
          >
            Generate QR
          </button>
        </section>
      ) : (
        <section className="qr-form-card">
          <h2 className="qr-form-title">Student Information</h2>
          <form className="qr-form-fields" onSubmit={handleSubmit}>
            <div className="qr-form-row">
              <label>Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="qr-form-row">
              <label>Student ID</label>
              <input
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="qr-form-row">
              <label>Batch</label>
              <input
                name="batch"
                value={form.batch}
                onChange={handleChange}
                required
              />
            </div>
            <div className="qr-form-row">
              <label>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              />
            </div>
            <div className="qr-form-row">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="qr-form-actions">
              <button
                type="button"
                className="qr-form-cancel"
                onClick={() => setShowQRForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="qr-form-submit">
                Generate QR
              </button>
            </div>
          </form>
        </section>
      )}

      {!showQRForm && (
        <main className="dashboard-main">
          <section className="info-card">
            <div className="card-header">
              <h2 className="card-title">Student Information</h2>
            </div>
            <div className="student-details">
              <div className="detail-row">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">
                  {studentData?.fullName || "Not Available"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Student ID</span>
                <span className="detail-value">
                  {studentData?.studentId || "Not Available"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Batch</span>
                <span className="detail-value">
                  {studentData?.batch || "Not Available"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Department</span>
                <span className="detail-value">
                  {studentData?.department || "Not Available"}
                </span>
              </div>
            </div>
          </section>

          <section className="qr-card">
            <div className="card-header">
              <h2 className="card-title">Quick Access QR</h2>
            </div>
            <div className="qr-content">
              <div className="qr-code-container">
                <img
                  src={qrCode}
                  alt="Student QR Code"
                  className="qr-image"
                />
              </div>
              <p className="qr-description">
                Scan this code for quick check-in at medical appointments
              </p>
            </div>
          </section>

          <section className="services-card">
            <div className="card-header">
              <h2 className="card-title">Available Health Services</h2>
            </div>
            <div className="services-content">
              <div className="service-stats">
                <div className="stat-item">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Emergency Care</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">15+</span>
                  <span className="stat-label">Specialists</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Coverage</span>
                </div>
              </div>
              <div className="doctors-image-container">
                <img
                  src={doctorImage}
                  alt="Available Doctors"
                  className="doctors-image"
                />
              </div>
              <button className="appointment-btn">Book Appointment</button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default Dashboard;