// Unified API Service - Single source of truth for all backend communication
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get auth token
  getAuthToken() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.token || null;
  }

  // Get headers with auth
  getHeaders(includeAuth = true) {
    const headers = { ...this.defaultHeaders };
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    const { method = 'GET', data, requireAuth = true, fallbackData } = options;

    try {
      const config = {
        method,
        headers: this.getHeaders(requireAuth),
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`API call failed for ${endpoint}:`, error.message);

      // Return fallback data if provided
      if (fallbackData !== undefined) {
        return fallbackData;
      }

      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    return this.apiCall('/auth/login', {
      method: 'POST',
      data: credentials,
      requireAuth: false
    });
  }

  async register(userData) {
    return this.apiCall('/auth/register', {
      method: 'POST',
      data: userData,
      requireAuth: false
    });
  }

  async logout() {
    return this.apiCall('/auth/logout', { method: 'POST' });
  }

  // Queue management
  async getQueue(queueType) {
    return this.apiCall(`/queue/${queueType}`, {
      fallbackData: []
    });
  }

  async addToQueue(queueType, data) {
    return this.apiCall(`/queue/${queueType}`, {
      method: 'POST',
      data,
      fallbackData: { success: true, queueNo: Date.now().toString().slice(-3) }
    });
  }

  async updateQueueStatus(queueNo, updates) {
    return this.apiCall(`/queue/update/${queueNo}`, {
      method: 'PUT',
      data: updates,
      fallbackData: { success: true }
    });
  }

  async moveInQueue(queueNo, fromQueue, toQueue, additionalData = {}) {
    return this.apiCall(`/queue/move/${queueNo}`, {
      method: 'POST',
      data: { fromQueue, toQueue, ...additionalData },
      fallbackData: { success: true }
    });
  }

  // Medical records
  async getMedicalRecord(recordId) {
    return this.apiCall(`/medical-records/${recordId}`, {
      fallbackData: null
    });
  }

  async saveMedicalRecord(recordData) {
    return this.apiCall('/medical-records', {
      method: 'POST',
      data: recordData,
      fallbackData: { success: true, id: recordData.id }
    });
  }

  // Prescriptions
  async submitPrescription(prescriptionData) {
    return this.apiCall('/prescriptions', {
      method: 'POST',
      data: prescriptionData,
      fallbackData: {
        success: true,
        id: `RX-${Date.now()}`,
        queueNumber: `Q${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`
      }
    });
  }

  async getPrescriptions(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return this.apiCall(`/prescriptions${queryString ? `?${queryString}` : ''}`, {
      fallbackData: []
    });
  }

  async updatePrescriptionStatus(prescriptionId, status) {
    return this.apiCall(`/prescriptions/${prescriptionId}/status`, {
      method: 'PUT',
      data: { status },
      fallbackData: { success: true }
    });
  }

  // User management
  async getUsers(role = null) {
    const endpoint = role ? `/users?role=${role}` : '/users';
    return this.apiCall(endpoint, {
      fallbackData: []
    });
  }

  async createUser(userData) {
    return this.apiCall('/users', {
      method: 'POST',
      data: userData,
      fallbackData: { success: true, id: Date.now() }
    });
  }

  // Inventory management
  async getInventory() {
    return this.apiCall('/inventory', {
      fallbackData: []
    });
  }

  async updateInventory(itemId, updates) {
    return this.apiCall(`/inventory/${itemId}`, {
      method: 'PUT',
      data: updates,
      fallbackData: { success: true }
    });
  }

  // Statistics and reports
  async getStats(type = 'general') {
    return this.apiCall(`/stats/${type}`, {
      fallbackData: {}
    });
  }

  // Notifications
  async sendNotification(notificationData) {
    return this.apiCall('/notifications', {
      method: 'POST',
      data: notificationData,
      fallbackData: { success: true }
    });
  }

  // File upload
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('File upload failed:', error.message);
      return {
        success: false,
        error: error.message,
        url: URL.createObjectURL(file) // Temporary fallback
      };
    }
  }

  // Telemedicine Video Call endpoints
  async sendVideoCallRequest(requestData) {
    return this.apiCall('/telemed/video-call-request', {
      method: 'POST',
      data: requestData,
      fallbackData: {
        success: true,
        requestId: Date.now(),
        message: 'Video call request sent (fallback mode)'
      }
    });
  }

  async getVideoCallStatus(requestId) {
    return this.apiCall(`/telemed/video-call-status/${requestId}`, {
      fallbackData: {
        success: false,
        status: 'pending'
      }
    });
  }

  async getPendingVideoCallRequests() {
    return this.apiCall('/telemed/pending-requests', {
      fallbackData: {
        success: true,
        requests: []
      }
    });
  }

  async acceptVideoCallRequest(requestId, doctorInfo) {
    return this.apiCall(`/telemed/accept-request/${requestId}`, {
      method: 'POST',
      data: { doctorInfo },
      fallbackData: {
        success: true,
        roomName: `SmartMed-${Date.now()}`,
        studentInfo: { name: 'Student', id: 'STU001' }
      }
    });
  }

  async declineVideoCallRequest(requestId) {
    return this.apiCall(`/telemed/decline-request/${requestId}`, {
      method: 'POST',
      fallbackData: {
        success: true
      }
    });
  }

  async cleanupOldVideoCallRequests(maxAge) {
    return this.apiCall('/telemed/cleanup-old-requests', {
      method: 'POST',
      data: { maxAge },
      fallbackData: {
        success: true
      }
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;