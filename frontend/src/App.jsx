import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

// Pharmacy
import PharmacyTopBar from "./components/Pharmacy/PharmacyTopBar/TopBar";
import PharmacySidebar from "./components/Pharmacy/PharmacySidebar/PharmacySidebar";
import PrescriptionQueue from "./components/pharmacy/PrescriptionQueue/PrescriptionQueue";
import InventoryManagement from "./components/pharmacy/Inventory/InventoryManagement";
import MedicineRequests from "./components/pharmacy/MedicineRequests/MedicineRequests";
import Reports from "./components/pharmacy/Reports/Reports";

// Student
import StudentTopBar from "./components/Student/StudentTopBar/StudentTopBar";
import StudentSidebar from "./components/Student/StudentSidebar/StudentSidebar";
import StudentDashboard from "./components/Student/Dashboard/StudentDashboard";
import StudentProfile from "./components/Student/StudentProfile/StudentProfile";
import StudentHistory from "./components/Student/StudentHistory/StudentHistory";
import StudentReports from "./components/Student/StudentReports/StudentReports";
import StudentTelemed from './components/Student/StudentTelemed/StudentTelemed';
import StudentTelemedCall from './components/Student/StudentTelemedCall/StudentTelemedCall';
import StudentQRcode from './components/Student/StudentQRcode/StudentQRcode';
import StudentEnteringDetails from './components/Student/StudentEnteringDetails/StudentEnteringDetails';

// Doctor
import DoctorTopBar from './components/Doctor/DoctorTopBar/DoctorTopBar';
import DoctorSidebar from './components/Doctor/DoctorSidebar/DoctorSidebar';
import DoctorDashboard from './components/Doctor/DoctorDashboard/DoctorDashboard';
import DoctorQueue from './components/Doctor/DoctorQueue/DoctorQueue';
import DoctorPatient from './components/Doctor/DoctorPatient/DoctorPatient';
import DoctorPharmacy from './components/Doctor/DoctorPharmacy/DoctorPharmacy';
import DoctorTelemed from './components/Doctor/DoctorTelemed/DoctorTelemed';
import DoctorTelemedCall from './components/Doctor/DoctorTelemedCall/DoctorTelemedCall';

// Receptionist
import ReceptionistTopBar from './components/Receptionist/ReceptionistTopBar/ReceptionistTopBar';
import ReceptionistSidebar from './components/Receptionist/ReceptionistSidebar/ReceptionistSidebar';
import ReceptionistDashboard from './components/Receptionist/ReceptionistDashboard/ReceptionistDashboard';
import ReceptionistQueue from './components/Receptionist/ReceptionistQueue/ReceptionistQueue';
import ReceptionistNotifications from './components/Receptionist/ReceptionistNotifications/ReceptionistNotifications';

// Auth
import Register from './components/Register/Register';
import Login from './components/Login/Login';

// Users page
import Users from './pages/Users';

// ✅ Hospital Staff
import HospitalStaff from './components/Hospital_Staff/Hospital_Staff';

// ✅ Intro Page
import Intro from './components/Intro/Intro';

function App() {
  const location = useLocation();
  const pathname = location.pathname;

  const isStudent = pathname.startsWith("/student");
  const isDoctor = pathname.startsWith("/doctor");
  const isReceptionist = pathname.startsWith("/receptionist");
  const isRegister = pathname === "/register";
  const isLogin = pathname === "/login";
  const isUsers = pathname === "/users";
  const isHospitalStaff = pathname === "/hospital-staff";
  const isIntro = pathname === "/intro" || pathname === "/"; // Optional: treat root as intro

  const isPharmacy = !isStudent && !isDoctor && !isReceptionist && !isRegister && !isLogin && !isHospitalStaff && !isIntro;

  return (
    <div className="app-container">
      {/* Top Bars */}
      {!isRegister && !isLogin && !isHospitalStaff && !isIntro && isStudent && <StudentTopBar />}
      {!isRegister && !isLogin && !isHospitalStaff && !isIntro && isDoctor && <DoctorTopBar />}
      {!isRegister && !isLogin && !isHospitalStaff && !isIntro && isReceptionist && <ReceptionistTopBar />}
      {!isRegister && !isLogin && !isHospitalStaff && !isIntro && isPharmacy && <PharmacyTopBar />}

      <div className="main-content">
        {/* Sidebars */}
        {!isRegister && !isLogin && !isHospitalStaff && !isIntro && isStudent && <StudentSidebar />}
        {!isRegister && !isLogin && !isHospitalStaff && !isIntro && isDoctor && <DoctorSidebar />}
        {!isRegister && !isLogin && !isHospitalStaff && !isIntro && isReceptionist && <ReceptionistSidebar />}
        {!isRegister && !isLogin && !isHospitalStaff && !isIntro && isPharmacy && <PharmacySidebar />}

        <div className="content-area">
          <Routes>

            {/* ✅ Intro Landing Page */}
            <Route path="/" element={<Intro />} />
            <Route path="/intro" element={<Intro />} />

            {/* Pharmacy Routes */}
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/medicine-requests" element={<MedicineRequests />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/pharmacy/queue" element={<PrescriptionQueue />} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/history" element={<StudentHistory />} />
            <Route path="/student/reports" element={<StudentReports />} />
            <Route path="/student/telemed" element={<StudentTelemed />} />
            <Route path="/student/telemed-call" element={<StudentTelemedCall />} />
            <Route path="/student/qrcode" element={<StudentQRcode />} />
            <Route path="/student/entering-details" element={<StudentEnteringDetails />} />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/queue" element={<DoctorQueue />} />
            <Route path="/doctor/patient" element={<DoctorPatient />} />
            <Route path="/doctor/pharmacy" element={<DoctorPharmacy />} />
            <Route path="/doctor/telemed" element={<DoctorTelemed />} />
            <Route path="/doctor/telemed-call" element={<DoctorTelemedCall />} />

            {/* Receptionist Routes */}
            <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/queue" element={<ReceptionistQueue />} />
            <Route path="/receptionist/notifications" element={<ReceptionistNotifications />} />

            {/* Auth Pages */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Users Page */}
            <Route path="/users" element={<Users />} />

            {/* Hospital Staff Page */}
            <Route path="/hospital-staff" element={<HospitalStaff />} />

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
