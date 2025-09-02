// Twilio SMS Service for Emergency Ambulance Alerts

class TwilioService {
  constructor() {
    // Twilio configuration - these should be set in environment variables
    this.accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
    this.authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.REACT_APP_TWILIO_PHONE_NUMBER; // Your Twilio phone number
    
    // For security, we'll make requests through our backend API
    this.apiEndpoint = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  /**
   * Send emergency SMS alert to ambulance drivers
   * @param {Array} drivers - Array of driver objects with phone numbers
   * @param {Object} emergencyData - Emergency details
   * @returns {Promise} - Promise with SMS sending results
   */
  async sendEmergencyAlert(drivers, emergencyData) {
    const { location, patientDetails, emergencyType } = emergencyData;
    
    // Create the emergency message
    const message = this.formatEmergencyMessage({
      location,
      patientDetails,
      emergencyType,
      timestamp: new Date().toLocaleString()
    });

    const results = [];
    
    // Send SMS to each available driver
    for (const driver of drivers) {
      try {
        const result = await this.sendSMS(driver.phone, message, {
          driverName: driver.name,
          vehicleId: driver.vehicle
        });
        
        results.push({
          driver: driver.name,
          phone: driver.phone,
          status: 'sent',
          messageId: result.messageId,
          error: null
        });
        
        console.log(`✅ SMS sent to ${driver.name} (${driver.phone})`);
        
      } catch (error) {
        results.push({
          driver: driver.name,
          phone: driver.phone,
          status: 'failed',
          messageId: null,
          error: error.message
        });
        
        console.error(`❌ Failed to send SMS to ${driver.name}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Send individual SMS message
   * @param {string} to - Recipient phone number
   * @param {string} message - SMS message content
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} - Promise with message result
   */
  async sendSMS(to, message, metadata = {}) {
    try {
      // In production, this should go through your backend API for security
      // Frontend should never expose Twilio credentials directly
      
      const response = await fetch(`${this.apiEndpoint}/send-emergency-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Use your auth system
        },
        body: JSON.stringify({
          to: to,
          message: message,
          metadata: metadata,
          emergencyAlert: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      // Fallback for development - direct Twilio call
      // REMOVE THIS IN PRODUCTION - USE BACKEND API ONLY
      if (process.env.NODE_ENV === 'development') {
        return await this.sendSMSDirect(to, message);
      }
      throw error;
    }
  }

  /**
   * Direct Twilio SMS sending (DEVELOPMENT ONLY)
   * In production, always use backend API
   */
  async sendSMSDirect(to, message) {
    // Browser simulation for development
    // In production, this should be handled by your backend API
    
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // Simulate Twilio API call for development
    // In a real implementation, this would go through your backend
    try {
      console.log('🚨 SIMULATED SMS SEND 🚨');
      console.log('To:', to);
      console.log('From:', this.fromNumber);
      console.log('Message:', message);
      console.log('Account SID:', this.accountSid);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return simulated success response
      const messageId = 'SM' + Math.random().toString(36).substr(2, 32);
      
      return {
        messageId: messageId,
        status: 'sent',
        to: to,
        from: this.fromNumber
      };
      
    } catch (error) {
      throw new Error(`Simulated Twilio error: ${error.message}`);
    }
  }

  /**
   * Format emergency message for SMS
   * @param {Object} data - Emergency data
   * @returns {string} - Formatted SMS message
   */
  formatEmergencyMessage(data) {
    const { location, patientDetails, emergencyType, timestamp } = data;
    
    return `🚨 EMERGENCY AMBULANCE REQUEST 🚨

Patient: ${patientDetails}
Location: ${location}
Type: ${emergencyType.toUpperCase()}
Time: ${timestamp}

Please respond immediately if available.

SmartMed Hospital
Emergency Hotline: +94 11 234 5678

Reply ACCEPT to confirm or call back immediately.`;
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - Whether phone number is valid
   */
  validatePhoneNumber(phoneNumber) {
    // Support multiple country formats
    const patterns = {
      sriLanka: /^(\+94|0)[0-9]{9}$/,          // Sri Lankan numbers
      usa: /^(\+1|1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/,  // US numbers
      international: /^\+[1-9]\d{1,14}$/        // General international format
    };
    
    return Object.values(patterns).some(pattern => pattern.test(phoneNumber));
  }

  /**
   * Format phone number for Twilio (E.164 format)
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all spaces and special characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Handle different country formats
    if (cleaned.startsWith('0')) {
      // Sri Lankan local format (0771234567 -> +94771234567)
      cleaned = '+94' + cleaned.substring(1);
    } else if (cleaned.startsWith('1') && cleaned.length === 11) {
      // US format without country code (15315415091 -> +15315415091)
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('94') && !cleaned.startsWith('+94')) {
      // Sri Lankan without + (94771234567 -> +94771234567)
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      // Default to international format
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Get SMS delivery status
   * @param {string} messageId - Twilio message SID
   * @returns {Promise} - Promise with delivery status
   */
  async getMessageStatus(messageId) {
    try {
      const response = await fetch(`${this.apiEndpoint}/sms-status/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get message status:', error);
      throw error;
    }
  }
}

// Create singleton instance
const twilioService = new TwilioService();

export default twilioService;