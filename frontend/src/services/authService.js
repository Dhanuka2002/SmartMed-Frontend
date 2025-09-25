// Simplified Authentication Service
import apiService from './apiService.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.loadCurrentUser();
  }

  // Load user from localStorage
  loadCurrentUser() {
    try {
      const userData = localStorage.getItem('currentUser');
      this.currentUser = userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error loading current user:', error);
      this.currentUser = null;
    }
  }

  // Save user to localStorage
  saveCurrentUser(userData) {
    this.currentUser = userData;
    localStorage.setItem('currentUser', JSON.stringify(userData));

    // Store role-specific data for backward compatibility
    if (userData.role === 'Student') {
      localStorage.setItem('studentName', userData.name);
      localStorage.setItem('studentEmail', userData.email);
    }
  }

  // Clear user session
  clearCurrentUser() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentEmail');
  }

  // Login user
  async login(credentials) {
    try {
      const result = await apiService.login(credentials);

      if (result.status === 'success') {
        const userInfo = {
          role: result.role,
          name: result.name,
          email: result.email,
          userId: result.userId,
          token: result.token,
          loginTime: new Date().toISOString()
        };

        this.saveCurrentUser(userInfo);
        return { success: true, user: userInfo };
      } else {
        return { success: false, error: result.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  }

  // Register user
  async register(userData) {
    try {
      const result = await apiService.register(userData);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Logout user
  async logout() {
    try {
      await apiService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      this.clearCurrentUser();
      return { success: true };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null && this.currentUser.token !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check user role
  hasRole(role) {
    return this.currentUser?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.currentUser?.role);
  }

  // Get user's dashboard route based on role
  getDashboardRoute() {
    if (!this.currentUser) return '/login';

    const roleRoutes = {
      'Student': '/student/dashboard',
      'Doctor': '/doctor/dashboard',
      'Pharmacy': '/inventory',
      'Hospital Staff': '/hospital-staff',
      'Receptionist': '/receptionist/dashboard',
      'Admin': '/admin/dashboard'
    };

    return roleRoutes[this.currentUser.role] || '/login';
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const result = await apiService.apiCall('/auth/change-password', {
        method: 'POST',
        data: { currentPassword, newPassword }
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Refresh token if needed
  async refreshToken() {
    try {
      const result = await apiService.apiCall('/auth/refresh', {
        method: 'POST'
      });

      if (result.token) {
        this.currentUser.token = result.token;
        this.saveCurrentUser(this.currentUser);
        return { success: true };
      }

      return { success: false, error: 'Token refresh failed' };
    } catch (error) {
      this.clearCurrentUser();
      return { success: false, error: 'Session expired' };
    }
  }

  // Check if session is valid (simple check)
  isSessionValid() {
    if (!this.currentUser || !this.currentUser.loginTime) {
      return false;
    }

    const loginTime = new Date(this.currentUser.loginTime);
    const now = new Date();
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

    return (now - loginTime) < sessionDuration;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;