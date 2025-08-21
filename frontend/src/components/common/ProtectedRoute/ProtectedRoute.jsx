import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  console.log('🔐 ProtectedRoute check:', {
    currentUser,
    allowedRoles,
    requireAuth,
    userRole: currentUser?.role
  });
  
  // If authentication is required but user is not logged in
  if (requireAuth && !currentUser) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If specific roles are required, check if user has the required role
  if (allowedRoles.length > 0 && currentUser) {
    if (!allowedRoles.includes(currentUser.role)) {
      console.log(`❌ Role mismatch: user has '${currentUser.role}', but route requires:`, allowedRoles);
      // Redirect based on user's actual role
      switch (currentUser.role) {
        case 'Student':
          return <Navigate to="/student/dashboard" replace />;
        case 'Doctor':
          return <Navigate to="/doctor/dashboard" replace />;
        case 'Pharmacy':
          return <Navigate to="/inventory" replace />;
        case 'Hospital Staff':
          return <Navigate to="/hospital-staff" replace />;
        case 'Receptionist':
          return <Navigate to="/receptionist/dashboard" replace />;
        case 'Admin':
          return <Navigate to="/admin/dashboard" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }
  
  console.log('✅ ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;