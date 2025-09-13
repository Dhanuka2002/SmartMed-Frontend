// Real-time Video Call Service for Cross-Device Communication
import apiService from './apiService.js';

class VideoCallService {
  constructor() {
    this.activePolling = null;
    this.currentUser = null;
    this.callbackHandlers = new Map();
  }

  // Initialize service with current user info
  init(userInfo) {
    this.currentUser = userInfo;
  }

  // Student: Send video call request to backend
  async sendVideoCallRequest(doctorId = null) {
    try {
      const roomName = `SmartMed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const requestData = {
        type: 'video_call_request',
        studentId: this.currentUser?.id || 'STU001',
        studentName: this.currentUser?.name || 'Student User',
        studentEmail: this.currentUser?.email || 'student@example.com',
        doctorId: doctorId, // null means any available doctor
        roomName: roomName,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      // Send request to backend
      const response = await apiService.apiCall('/telemed/video-call-request', {
        method: 'POST',
        data: requestData,
        requireAuth: true
      });

      if (response.success) {
        console.log('Video call request sent successfully:', response);
        return {
          success: true,
          requestId: response.requestId,
          roomName: roomName,
          message: 'Video call request sent to doctor'
        };
      } else {
        throw new Error(response.error || 'Failed to send video call request');
      }

    } catch (error) {
      console.error('Error sending video call request:', error);

      // Fallback to localStorage for offline functionality
      const fallbackData = {
        id: Date.now(),
        type: 'video_call_request',
        studentId: this.currentUser?.id || 'STU001',
        studentName: this.currentUser?.name || 'Student User',
        roomName: `SmartMed-${Date.now()}`,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      const existingRequests = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
      existingRequests.push(fallbackData);
      localStorage.setItem('telemed_notifications', JSON.stringify(existingRequests));

      return {
        success: true,
        requestId: fallbackData.id,
        roomName: fallbackData.roomName,
        message: 'Video call request sent (offline mode)',
        isOffline: true
      };
    }
  }

  // Student: Wait for doctor response
  async waitForDoctorResponse(requestId, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = 2000; // Check every 2 seconds

      const checkForResponse = async () => {
        try {
          // First try to get response from backend
          const response = await apiService.apiCall(`/telemed/video-call-status/${requestId}`, {
            method: 'GET',
            requireAuth: true
          });

          if (response.success && response.status === 'accepted') {
            clearInterval(this.activePolling);
            resolve({
              success: true,
              status: 'accepted',
              roomName: response.roomName,
              doctorInfo: response.doctorInfo
            });
            return;
          } else if (response.success && response.status === 'declined') {
            clearInterval(this.activePolling);
            resolve({
              success: false,
              status: 'declined',
              message: 'Doctor declined the call'
            });
            return;
          }

        } catch (error) {
          console.log('Backend unavailable, checking localStorage fallback');

          // Fallback to localStorage
          try {
            const notifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
            const myRequest = notifications.find(n =>
              n.id === requestId && n.status === 'accepted'
            );

            if (myRequest) {
              clearInterval(this.activePolling);
              resolve({
                success: true,
                status: 'accepted',
                roomName: myRequest.roomName,
                isOffline: true
              });
              return;
            }
          } catch (localError) {
            console.error('Error checking localStorage:', localError);
          }
        }

        // Check timeout
        if (Date.now() - startTime >= timeout) {
          clearInterval(this.activePolling);
          resolve({
            success: false,
            status: 'timeout',
            message: 'No response from doctor within timeout period'
          });
        }
      };

      // Start polling
      this.activePolling = setInterval(checkForResponse, checkInterval);
      checkForResponse(); // Check immediately
    });
  }

  // Doctor: Get pending video call requests
  async getPendingVideoCallRequests() {
    try {
      const response = await apiService.apiCall('/telemed/pending-requests', {
        method: 'GET',
        requireAuth: true
      });

      if (response.success) {
        return {
          success: true,
          requests: response.requests || []
        };
      } else {
        throw new Error(response.error || 'Failed to get pending requests');
      }

    } catch (error) {
      console.log('Backend unavailable, using localStorage fallback');

      // Fallback to localStorage
      try {
        const notifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
        const pendingRequests = notifications.filter(n =>
          n.type === 'video_call_request' && n.status === 'pending'
        );

        return {
          success: true,
          requests: pendingRequests,
          isOffline: true
        };
      } catch (localError) {
        console.error('Error reading localStorage:', localError);
        return {
          success: false,
          error: 'Failed to get pending requests',
          requests: []
        };
      }
    }
  }

  // Doctor: Accept video call request
  async acceptVideoCallRequest(requestId) {
    try {
      const doctorInfo = {
        id: this.currentUser?.id || 'DOC001',
        name: this.currentUser?.name || 'Dr. SmartMed',
        email: this.currentUser?.email || 'doctor@smartmed.com'
      };

      const response = await apiService.apiCall(`/telemed/accept-request/${requestId}`, {
        method: 'POST',
        data: { doctorInfo },
        requireAuth: true
      });

      if (response.success) {
        return {
          success: true,
          roomName: response.roomName,
          studentInfo: response.studentInfo
        };
      } else {
        throw new Error(response.error || 'Failed to accept video call');
      }

    } catch (error) {
      console.log('Backend unavailable, using localStorage fallback');

      // Fallback to localStorage
      try {
        const notifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
        const updatedNotifications = notifications.map(n =>
          n.id === requestId ? { ...n, status: 'accepted', doctorInfo: this.currentUser } : n
        );
        localStorage.setItem('telemed_notifications', JSON.stringify(updatedNotifications));

        const acceptedRequest = updatedNotifications.find(n => n.id === requestId);

        return {
          success: true,
          roomName: acceptedRequest?.roomName || `SmartMed-${Date.now()}`,
          studentInfo: {
            name: acceptedRequest?.studentName,
            id: acceptedRequest?.studentId
          },
          isOffline: true
        };
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
        return {
          success: false,
          error: 'Failed to accept video call'
        };
      }
    }
  }

  // Doctor: Decline video call request
  async declineVideoCallRequest(requestId) {
    try {
      const response = await apiService.apiCall(`/telemed/decline-request/${requestId}`, {
        method: 'POST',
        requireAuth: true
      });

      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to decline video call');
      }

    } catch (error) {
      console.log('Backend unavailable, using localStorage fallback');

      // Fallback to localStorage
      try {
        const notifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
        const updatedNotifications = notifications.map(n =>
          n.id === requestId ? { ...n, status: 'declined' } : n
        );
        localStorage.setItem('telemed_notifications', JSON.stringify(updatedNotifications));

        return { success: true, isOffline: true };
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
        return {
          success: false,
          error: 'Failed to decline video call'
        };
      }
    }
  }

  // Start polling for pending requests (for doctors)
  startPollingForRequests(callback, interval = 3000) {
    if (this.activePolling) {
      clearInterval(this.activePolling);
    }

    const pollForRequests = async () => {
      const result = await this.getPendingVideoCallRequests();
      if (result.success && callback) {
        callback(result.requests, result.isOffline);
      }
    };

    // Poll immediately and then at intervals
    pollForRequests();
    this.activePolling = setInterval(pollForRequests, interval);

    return () => {
      if (this.activePolling) {
        clearInterval(this.activePolling);
        this.activePolling = null;
      }
    };
  }

  // Stop all active polling
  stopPolling() {
    if (this.activePolling) {
      clearInterval(this.activePolling);
      this.activePolling = null;
    }
  }

  // Clean up old requests (call periodically to prevent storage bloat)
  async cleanupOldRequests(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      await apiService.apiCall('/telemed/cleanup-old-requests', {
        method: 'POST',
        data: { maxAge },
        requireAuth: true
      });
    } catch (error) {
      console.log('Backend cleanup unavailable, cleaning localStorage');

      // Fallback localStorage cleanup
      try {
        const notifications = JSON.parse(localStorage.getItem('telemed_notifications') || '[]');
        const cutoffTime = Date.now() - maxAge;

        const recentNotifications = notifications.filter(n => {
          const notificationTime = new Date(n.timestamp).getTime();
          return notificationTime > cutoffTime;
        });

        localStorage.setItem('telemed_notifications', JSON.stringify(recentNotifications));
      } catch (localError) {
        console.error('Error cleaning localStorage:', localError);
      }
    }
  }
}

// Create singleton instance
const videoCallService = new VideoCallService();

export default videoCallService;