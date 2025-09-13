// Simplified Prescription Service
import apiService from './apiService.js';
import errorHandler from './errorHandler.js';

class PrescriptionService {
  constructor() {
    this.statuses = ['pending', 'processing', 'ready', 'dispensed', 'cancelled'];
  }

  // Submit prescription to pharmacy
  async submitPrescription(prescriptionData) {
    try {
      // Validate prescription data
      this.validatePrescription(prescriptionData);

      // Prepare submission data
      const submissionData = {
        ...prescriptionData,
        id: this.generatePrescriptionId(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      const result = await apiService.submitPrescription(submissionData);

      if (result.success) {
        // Store locally for offline access
        this.storeLocalPrescription(submissionData);

        return {
          success: true,
          prescriptionId: result.id,
          queueNumber: result.queueNumber,
          estimatedTime: this.calculateEstimatedTime(submissionData),
          message: 'Prescription submitted successfully'
        };
      }

      throw new Error(result.error || 'Submission failed');

    } catch (error) {
      return errorHandler.handleApiError(error, 'PRESCRIPTION_SUBMIT', () => {
        // Fallback: store locally and return mock response
        const mockId = this.generatePrescriptionId();
        this.storeLocalPrescription({ ...prescriptionData, id: mockId });

        return {
          success: true,
          prescriptionId: mockId,
          queueNumber: this.generateQueueNumber(),
          estimatedTime: 20,
          message: 'Prescription queued (offline mode)',
          offline: true
        };
      });
    }
  }

  // Get prescriptions with filters
  async getPrescriptions(filters = {}) {
    try {
      return await apiService.getPrescriptions(filters);
    } catch (error) {
      return errorHandler.handleApiError(error, 'GET_PRESCRIPTIONS', () => {
        return this.getLocalPrescriptions(filters);
      });
    }
  }

  // Update prescription status
  async updatePrescriptionStatus(prescriptionId, status, notes = '') {
    try {
      if (!this.statuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const result = await apiService.updatePrescriptionStatus(prescriptionId, status);

      if (result.success) {
        this.updateLocalPrescriptionStatus(prescriptionId, status, notes);
        return { success: true, message: 'Status updated successfully' };
      }

      throw new Error(result.error || 'Update failed');

    } catch (error) {
      return errorHandler.handleApiError(error, 'UPDATE_PRESCRIPTION_STATUS', () => {
        this.updateLocalPrescriptionStatus(prescriptionId, status, notes);
        return { success: true, message: 'Status updated (offline)', offline: true };
      });
    }
  }

  // Get prescription by ID
  async getPrescriptionById(prescriptionId) {
    try {
      const result = await apiService.apiCall(`/prescriptions/${prescriptionId}`);
      return result;
    } catch (error) {
      return errorHandler.handleApiError(error, 'GET_PRESCRIPTION', () => {
        return this.getLocalPrescription(prescriptionId);
      });
    }
  }

  // Get pharmacy prescription queue
  async getPharmacyQueue() {
    try {
      return await this.getPrescriptions({ status: ['pending', 'processing'] });
    } catch (error) {
      return errorHandler.handleApiError(error, 'GET_PHARMACY_QUEUE', () => {
        return this.getLocalPrescriptions({ status: ['pending', 'processing'] });
      });
    }
  }

  // Get prescription statistics
  async getStats() {
    try {
      return await apiService.getStats('prescriptions');
    } catch (error) {
      return errorHandler.handleApiError(error, 'GET_PRESCRIPTION_STATS', () => {
        return this.calculateLocalStats();
      });
    }
  }

  // Validation methods
  validatePrescription(prescriptionData) {
    const requiredFields = [
      'patientId', 'patientName', 'diagnosis',
      'medicines', 'signature', 'doctorId', 'doctorName'
    ];

    for (const field of requiredFields) {
      if (!prescriptionData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(prescriptionData.medicines) || prescriptionData.medicines.length === 0) {
      throw new Error('At least one medicine must be prescribed');
    }

    // Validate medicines
    prescriptionData.medicines.forEach((medicine, index) => {
      this.validateMedicine(medicine, index);
    });

    // Validate signature
    if (!this.isValidSignature(prescriptionData.signature)) {
      throw new Error('Invalid digital signature format');
    }
  }

  validateMedicine(medicine, index) {
    const requiredFields = ['name', 'dosage', 'frequency', 'duration'];

    for (const field of requiredFields) {
      if (!medicine[field]) {
        throw new Error(`Medicine ${index + 1}: Missing ${field}`);
      }
    }
  }

  isValidSignature(signature) {
    return signature && signature.startsWith('data:image/');
  }

  // Helper methods
  generatePrescriptionId() {
    return `RX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  generateQueueNumber() {
    const count = this.getLocalPrescriptions().length;
    return `Q${String(count + 1).padStart(3, '0')}`;
  }

  calculateEstimatedTime(prescription) {
    const baseTime = 15;
    const medicineTime = prescription.medicines.length * 5;
    const queueTime = this.getLocalPrescriptions({ status: 'pending' }).length * 10;
    return baseTime + medicineTime + queueTime;
  }

  // Local storage methods
  storeLocalPrescription(prescription) {
    try {
      const prescriptions = this.getLocalPrescriptions();
      prescriptions.push(prescription);
      localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    } catch (error) {
      console.error('Failed to store prescription locally:', error);
    }
  }

  getLocalPrescriptions(filters = {}) {
    try {
      const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      return this.applyFilters(prescriptions, filters);
    } catch (error) {
      console.error('Failed to get local prescriptions:', error);
      return [];
    }
  }

  getLocalPrescription(prescriptionId) {
    const prescriptions = this.getLocalPrescriptions();
    return prescriptions.find(p => p.id === prescriptionId) || null;
  }

  updateLocalPrescriptionStatus(prescriptionId, status, notes = '') {
    try {
      const prescriptions = this.getLocalPrescriptions();
      const index = prescriptions.findIndex(p => p.id === prescriptionId);

      if (index !== -1) {
        prescriptions[index] = {
          ...prescriptions[index],
          status,
          notes,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
      }
    } catch (error) {
      console.error('Failed to update local prescription:', error);
    }
  }

  applyFilters(prescriptions, filters) {
    let filtered = [...prescriptions];

    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      filtered = filtered.filter(p => statusArray.includes(p.status));
    }

    if (filters.doctorId) {
      filtered = filtered.filter(p => p.doctorId === filters.doctorId);
    }

    if (filters.patientId) {
      filtered = filtered.filter(p => p.patientId === filters.patientId);
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      filtered = filtered.filter(p => {
        const date = new Date(p.timestamp);
        return date >= start && date <= end;
      });
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  calculateLocalStats() {
    const prescriptions = this.getLocalPrescriptions();
    const stats = {
      total: prescriptions.length,
      pending: 0,
      processing: 0,
      ready: 0,
      dispensed: 0,
      cancelled: 0
    };

    prescriptions.forEach(p => {
      if (stats.hasOwnProperty(p.status)) {
        stats[p.status]++;
      }
    });

    return stats;
  }

  // Clear all local prescriptions (for testing)
  clearLocalPrescriptions() {
    localStorage.removeItem('prescriptions');
  }
}

// Create singleton instance
const prescriptionService = new PrescriptionService();

export default prescriptionService;