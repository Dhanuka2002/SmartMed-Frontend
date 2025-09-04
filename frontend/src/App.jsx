import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { PrescriptionProvider } from "./contexts/PrescriptionContext";
import { MedicineInventoryProvider } from "./contexts/MedicineInventoryContext";

// Shared Components
import TopBar from "./components/shared/TopBar/TopBar";

// Pharmacy
import PharmacySidebar from "./components/Pharmacy/PharmacySidebar/PharmacySidebar";
import PrescriptionQueue from "./components/Pharmacy/PrescriptionQueue/PrescriptionQueue";
import InventoryManagement from "./components/Pharmacy/inventory/InventoryManagement";
import MedicineRequests from "./components/Pharmacy/MedicineRequests/MedicineRequests";
import Reports from "./components/Pharmacy/Reports/Reports";

// Student
import StudentSidebar from "./components/Student/StudentSidebar/StudentSidebar";
import StudentDashboard from "./components/Student/Dashboard/StudentDashboard";
import StudentProfile from "./components/Student/StudentProfile/StudentProfile";
import StudentReports from "./components/Student/StudentReports/StudentReports";
import StudentTelemed from './components/Student/StudentTelemed/StudentTelemed';
import StudentTelemedCall from './components/Student/StudentTelemedCall/StudentTelemedCall';
import StudentQRcode from './components/Student/StudentQRcode/StudentQRcode';
import StudentEnteringDetails from './components/Student/StudentEnteringDetails/StudentEnteringDetails';

// Doctor
import DoctorSidebar from './components/Doctor/DoctorSidebar/DoctorSidebar';
import DoctorDashboard from './components/Doctor/DoctorDashboard/DoctorDashboard';
import DoctorQueue from './components/Doctor/DoctorQueue/DoctorQueue';
import DoctorPatient from './components/Doctor/DoctorPatient/DoctorPatient';
import DoctorPharmacy from './components/Doctor/DoctorPharmacy/DoctorPharmacy';
import DoctorTelemed from './components/Doctor/DoctorTelemed/DoctorTelemed';
import DoctorTelemedCall from './components/Doctor/DoctorTelemedCall/DoctorTelemedCall';
import DoctorReport from './components/Doctor/DoctorReport/DoctorReport';

// Receptionist
import ReceptionistSidebar from './components/Receptionist/ReceptionistSidebar/ReceptionistSidebar';
import ReceptionistDashboard from './components/Receptionist/ReceptionistDashboard/ReceptionistDashboard';
import ReceptionistQueue from './components/Receptionist/ReceptionistQueue/ReceptionistQueue';
import ReceptionistNotifications from './components/Receptionist/ReceptionistNotifications/ReceptionistNotifications';

// Auth
import Register from './components/Register/Register';
import Login from './components/Login/login';

// Admin
import AdminDashboard from './components/Admin/AdminDashboard/AdminDashboard';

// Users page
import Users from './pages/Users';

// ✅ Hospital Staff
import HospitalStaff from './components/Hospital_Staff/Hospital_Staff';

// ✅ Intro Page
import Intro from './components/Intro/Intro';

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';

function App() {
  const location = useLocation();
  const pathname = location.pathname;
  const [currentUser, setCurrentUser] = useState(null);

  const isStudent = pathname.startsWith("/student");
  const isDoctor = pathname.startsWith("/doctor");
  const isReceptionist = pathname.startsWith("/receptionist");
  const isAdmin = pathname.startsWith("/admin");
  const isRegister = pathname === "/register";
  const isLogin = pathname === "/login";
  const isUsers = pathname === "/users";
  const isHospitalStaff = pathname === "/hospital-staff";
  const isIntro = pathname === "/intro" || pathname === "/";

  const isPharmacy = !isStudent && !isDoctor && !isReceptionist && !isAdmin && !isRegister && !isLogin && !isHospitalStaff && !isIntro;

  // Load current user data from localStorage
  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
        setCurrentUser(null);
      }
    };

    loadCurrentUser();

    // Listen for localStorage changes (useful if user logs out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        loadCurrentUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]); // Re-run when pathname changes

  // Helper function to get user role
  const getUserRole = () => {
    if (isStudent) return "Student";
    if (isDoctor) return "Doctor";
    if (isReceptionist) return "Receptionist";
    if (isAdmin) return "Admin";
    if (isPharmacy) return "Pharmacy";
    return "User";
  };

  // TopBar event handlers
  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout clicked");
  };

  const handleNotifications = () => {
    // Add notifications logic here
    console.log("Notifications clicked");
  };

  const handleProfile = () => {
    // Add profile logic here
    console.log("Profile clicked");
  };

  return (
    <MedicineInventoryProvider>
      <PrescriptionProvider>
        <div className="app-container">
        {/* TopBar - Show for all authenticated users except admin, register, login, hospital staff, and intro */}
        {!isRegister && !isLogin && !isHospitalStaff && !isIntro && !isAdmin && (
          <TopBar 
            userRole={getUserRole()}
            userName={currentUser?.name || 'User'}
            onLogout={handleLogout}
            onNotifications={handleNotifications}
            onProfile={handleProfile}
          />
        )}

        <div className={isAdmin ? "admin-content-wrapper" : "main-content"}>
          {/* Sidebars - not shown for admin, register, login, hospital staff, and intro */}
          {!isRegister && !isLogin && !isHospitalStaff && !isIntro && !isAdmin && isStudent && <StudentSidebar />}
          {!isRegister && !isLogin && !isHospitalStaff && !isIntro && !isAdmin && isDoctor && <DoctorSidebar />}
          {!isRegister && !isLogin && !isHospitalStaff && !isIntro && !isAdmin && isReceptionist && <ReceptionistSidebar />}
          {!isRegister && !isLogin && !isHospitalStaff && !isIntro && !isAdmin && isPharmacy && <PharmacySidebar />}

          <div className="content-area">
            <Routes>

            {/* ✅ Intro Landing Page */}
            <Route path="/" element={<Intro />} />
            <Route path="/intro" element={<Intro />} />

            {/* Pharmacy Routes */}
            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={['Pharmacy']}>
                <InventoryManagement />
              </ProtectedRoute>
            } />
            <Route path="/medicine-requests" element={
              <ProtectedRoute allowedRoles={['Pharmacy']}>
                <MedicineRequests />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['Pharmacy']}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/pharmacy/queue" element={
              <ProtectedRoute allowedRoles={['Pharmacy']}>
                <PrescriptionQueue />
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentProfile />
              </ProtectedRoute>
            } />
           
            <Route path="/student/reports" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentReports />
              </ProtectedRoute>
            } />
            <Route path="/student/telemed" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentTelemed />
              </ProtectedRoute>
            } />
            <Route path="/student/telemed-call" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentTelemedCall />
              </ProtectedRoute>
            } />
            <Route path="/student/qrcode" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentQRcode />
              </ProtectedRoute>
            } />
            <Route path="/student/entering-details" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentEnteringDetails />
              </ProtectedRoute>
            } />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/queue" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorQueue />
              </ProtectedRoute>
            } />
            <Route path="/doctor/patient" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorPatient />
              </ProtectedRoute>
            } />
            <Route path="/doctor/pharmacy" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorPharmacy />
              </ProtectedRoute>
            } />
            <Route path="/doctor/telemed" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorTelemed />
              </ProtectedRoute>
            } />
            <Route path="/doctor/telemed-call" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorTelemedCall />
              </ProtectedRoute>
            } />
            <Route path="/doctor/report" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorReport />
              </ProtectedRoute>
            } />

            {/* Receptionist Routes */}
            <Route path="/receptionist/dashboard" element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            } />
            <Route path="/receptionist/queue" element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <ReceptionistQueue />
              </ProtectedRoute>
            } />
            <Route path="/receptionist/notifications" element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <ReceptionistNotifications />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Auth Pages */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Users Page */}
            <Route path="/users" element={<Users />} />

            {/* Hospital Staff Page */}
            <Route path="/hospital-staff" element={
              <ProtectedRoute allowedRoles={['Hospital Staff']}>
                <HospitalStaff />
              </ProtectedRoute>
            } />

          </Routes>
        </div>
        </div>
        </div>
      </PrescriptionProvider>
    </MedicineInventoryProvider>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
