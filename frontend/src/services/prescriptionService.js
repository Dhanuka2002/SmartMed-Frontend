// Prescription Service - Handles prescription submission to pharmacy
class PrescriptionService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.prescriptions = []; // In-memory storage for demo
  }

  /**
   * Submit prescription to pharmacy
   * @param {Object} prescriptionData - The prescription data
   * @returns {Promise} - API response
   */
  async submitPrescription(prescriptionData) {
    try {
      // Validate prescription data
      this.validatePrescription(prescriptionData);

      // Create prescription object with additional metadata
      const prescription = {
        ...prescriptionData,
        id: this.generatePrescriptionId(),
        timestamp: new Date().toISOString(),
        status: 'pending',
        pharmacyNotified: false,
        queueNumber: null
      };

      // In a real app, this would be an API call
      // const response = await fetch(`${this.baseURL}/api/prescriptions`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.getAuthToken()}`
      //   },
      //   body: JSON.stringify(prescription)
      // });

      // Mock API response
      await this.simulateAPICall(2000);
      
      // Store prescription in memory (for demo)
      this.prescriptions.push(prescription);
      
      // Simulate pharmacy notification
      await this.notifyPharmacy(prescription);
      
      return {
        success: true,
        prescriptionId: prescription.id,
        queueNumber: prescription.queueNumber,
        estimatedTime: this.calculateEstimatedTime(prescription),
        message: 'Prescription sent to pharmacy successfully'
      };

    } catch (error) {
      console.error('Error submitting prescription:', error);
      throw new Error(error.message || 'Failed to submit prescription');
    }
  }

  /**
   * Notify pharmacy about new prescription
   * @param {Object} prescription - The prescription object
   */
  async notifyPharmacy(prescription) {
    try {
      // Generate queue number
      const queueNumber = this.generateQueueNumber();
      prescription.queueNumber = queueNumber;
      prescription.pharmacyNotified = true;
      
      // In real app, this would send notification to pharmacy system
      // await fetch(`${this.baseURL}/api/pharmacy/notifications`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     type: 'new_prescription',
      //     prescriptionId: prescription.id,
      //     doctorName: prescription.doctorName,
      //     patientName: prescription.patientName,
      //     medicineCount: prescription.medicines.length,
      //     priority: this.calculatePriority(prescription),
      //     timestamp: prescription.timestamp
      //   })
      // });

      console.log('Pharmacy notified:', {
        prescriptionId: prescription.id,
        queueNumber: queueNumber,
        patient: prescription.patientName
      });

    } catch (error) {
      console.error('Error notifying pharmacy:', error);
      // Don't throw error - prescription is still valid even if notification fails
    }
  }

  /**
   * Get prescription status
   * @param {string} prescriptionId - The prescription ID
   * @returns {Object} - Prescription status
   */
  async getPrescriptionStatus(prescriptionId) {
    try {
      const prescription = this.prescriptions.find(p => p.id === prescriptionId);
      
      if (!prescription) {
        throw new Error('Prescription not found');
      }

      return {
        id: prescription.id,
        status: prescription.status,
        queueNumber: prescription.queueNumber,
        estimatedTime: this.calculateEstimatedTime(prescription),
        lastUpdated: prescription.timestamp
      };

    } catch (error) {
      console.error('Error getting prescription status:', error);
      throw error;
    }
  }

  /**
   * Get all prescriptions for pharmacy
   * @returns {Array} - List of prescriptions
   */
  async getPharmacyPrescriptions() {
    try {
      // Sort by timestamp (newest first)
      return this.prescriptions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(prescription => ({
          id: prescription.id,
          prescriptionId: prescription.prescriptionId,
          patientName: prescription.patientName,
          doctorName: prescription.doctorName,
          medicineCount: prescription.medicines.length,
          status: prescription.status,
          queueNumber: prescription.queueNumber,
          timestamp: prescription.timestamp,
          estimatedTime: this.calculateEstimatedTime(prescription)
        }));

    } catch (error) {
      console.error('Error getting pharmacy prescriptions:', error);
      throw error;
    }
  }

  /**
   * Update prescription status (for pharmacy use)
   * @param {string} prescriptionId - The prescription ID
   * @param {string} status - New status
   */
  async updatePrescriptionStatus(prescriptionId, status) {
    try {
      const prescription = this.prescriptions.find(p => p.id === prescriptionId);
      
      if (!prescription) {
        throw new Error('Prescription not found');
      }

      prescription.status = status;
      prescription.lastUpdated = new Date().toISOString();

      return {
        success: true,
        message: 'Prescription status updated successfully'
      };

    } catch (error) {
      console.error('Error updating prescription status:', error);
      throw error;
    }
  }

  /**
   * Validate prescription data
   * @param {Object} prescriptionData - The prescription data to validate
   */
  validatePrescription(prescriptionData) {
    const requiredFields = ['patientId', 'patientName', 'diagnosis', 'medicines', 'signature', 'doctorId', 'doctorName'];
    
    for (const field of requiredFields) {
      if (!prescriptionData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(prescriptionData.medicines) || prescriptionData.medicines.length === 0) {
      throw new Error('At least one medicine must be prescribed');
    }

    // Validate each medicine
    prescriptionData.medicines.forEach((medicine, index) => {
      const requiredMedicineFields = ['name', 'dosage', 'frequency', 'duration'];
      
      for (const field of requiredMedicineFields) {
        if (!medicine[field]) {
          throw new Error(`Medicine ${index + 1}: Missing required field: ${field}`);
        }
      }
    });

    // Validate signature (should be a base64 image)
    if (!prescriptionData.signature.startsWith('data:image/')) {
      throw new Error('Invalid digital signature format');
    }
  }

  /**
   * Generate unique prescription ID
   * @returns {string} - Unique prescription ID
   */
  generatePrescriptionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RX-${timestamp}-${random}`;
  }

  /**
   * Generate queue number
   * @returns {string} - Queue number
   */
  generateQueueNumber() {
    const currentQueue = this.prescriptions.filter(p => p.status === 'pending').length;
    return `Q${(currentQueue + 1).toString().padStart(3, '0')}`;
  }

  /**
   * Calculate estimated preparation time
   * @param {Object} prescription - The prescription object
   * @returns {number} - Estimated time in minutes
   */
  calculateEstimatedTime(prescription) {
    const baseTime = 15; // Base time for simple prescriptions
    const medicineTime = prescription.medicines.length * 5; // 5 minutes per medicine
    const queueTime = this.prescriptions.filter(p => p.status === 'pending').length * 10; // Queue delay
    
    return baseTime + medicineTime + queueTime;
  }

  /**
   * Calculate prescription priority
   * @param {Object} prescription - The prescription object
   * @returns {string} - Priority level
   */
  calculatePriority(prescription) {
    // Simple priority calculation based on medicine types
    const urgentMedicines = ['insulin', 'epinephrine', 'nitroglycerin', 'albuterol'];
    const hasUrgentMedicine = prescription.medicines.some(med => 
      urgentMedicines.some(urgent => med.name.toLowerCase().includes(urgent))
    );
    
    return hasUrgentMedicine ? 'high' : 'normal';
  }

  /**
   * Simulate API call delay
   * @param {number} delay - Delay in milliseconds
   */
  async simulateAPICall(delay = 1000) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get authentication token (mock implementation)
   * @returns {string} - Auth token
   */
  getAuthToken() {
    // In real app, get from localStorage or context
    return 'mock-jwt-token';
  }

  /**
   * Get prescription by ID
   * @param {string} prescriptionId - The prescription ID
   * @returns {Object|null} - Prescription object or null
   */
  getPrescriptionById(prescriptionId) {
    return this.prescriptions.find(p => p.id === prescriptionId) || null;
  }

  /**
   * Clear all prescriptions (for testing)
   */
  clearPrescriptions() {
    this.prescriptions = [];
  }

  /**
   * Get prescription statistics
   * @returns {Object} - Statistics object
   */
  getStatistics() {
    const total = this.prescriptions.length;
    const pending = this.prescriptions.filter(p => p.status === 'pending').length;
    const completed = this.prescriptions.filter(p => p.status === 'completed').length;
    const cancelled = this.prescriptions.filter(p => p.status === 'cancelled').length;

    return {
      total,
      pending,
      completed,
      cancelled,
      averageProcessingTime: this.calculateAverageProcessingTime()
    };
  }

  /**
   * Calculate average processing time
   * @returns {number} - Average time in minutes
   */
  calculateAverageProcessingTime() {
    const completedPrescriptions = this.prescriptions.filter(p => p.status === 'completed');
    
    if (completedPrescriptions.length === 0) return 0;
    
    const totalTime = completedPrescriptions.reduce((sum, p) => {
      return sum + this.calculateEstimatedTime(p);
    }, 0);
    
    return Math.round(totalTime / completedPrescriptions.length);
  }
}

// Create singleton instance
const prescriptionService = new PrescriptionService();

export default prescriptionService;