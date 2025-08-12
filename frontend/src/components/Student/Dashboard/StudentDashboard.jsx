import React from "react";
import "./StudentDashboard.css";
import qrCode from "../../../assets/qr.png";
import studentAvatar from "../../../assets/student.jpg";
import doctorImage from "../../../assets/doctors.png";

function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back to your health portal</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="greeting">Hello, Franklin!</span>
              <div className="user-status">
                <span className="status-dot"></span>
                <span className="status-text">Active</span>
              </div>
            </div>
            <div className="avatar-container">
              <img src={studentAvatar} alt="Student Avatar" className="avatar" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Student Information Card */}
        <section className="info-card">
          <div className="card-header">
            <h2 className="card-title">Student Information</h2>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="student-details">
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">John Franklin</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Student ID</span>
              <span className="detail-value">22IT0999</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Batch</span>
              <span className="detail-value">83</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Department</span>
              <span className="detail-value">Information Technology</span>
            </div>
          </div>
        </section>

        {/* QR Code Card */}
        <section className="qr-card">
          <div className="card-header">
            <h2 className="card-title">Quick Access QR</h2>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="5" y="5" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="15" y="5" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="5" y="15" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="13" y="13" width="2" height="2" fill="currentColor"/>
                <rect x="17" y="13" width="2" height="2" fill="currentColor"/>
                <rect x="19" y="13" width="2" height="2" fill="currentColor"/>
                <rect x="13" y="17" width="2" height="2" fill="currentColor"/>
                <rect x="19" y="17" width="2" height="2" fill="currentColor"/>
                <rect x="17" y="19" width="2" height="2" fill="currentColor"/>
                <rect x="19" y="19" width="2" height="2" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div className="qr-content">
            <div className="qr-code-container">
              <img src={qrCode} alt="Student QR Code" className="qr-image" />
            </div>
            <p className="qr-description">Scan this code for quick check-in at medical appointments</p>
          </div>
        </section>

        {/* Health Services Card */}
        <section className="services-card">
          <div className="card-header">
            <h2 className="card-title">Available Health Services</h2>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
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
              <img src={doctorImage} alt="Available Doctors" className="doctors-image" />
            </div>
            <button className="appointment-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Book Appointment
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;