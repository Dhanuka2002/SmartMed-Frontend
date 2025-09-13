// Simplified Medical Record Service
import QRCode from 'qrcode';
import apiService from './apiService.js';
import errorHandler from './errorHandler.js';

class MedicalRecordService {
  constructor() {
    this.recordCache = new Map();
  }

  // Generate unique medical record ID
  generateRecordId() {
    return `MED-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // Create complete medical record from student and hospital data
  createMedicalRecord(studentData, hospitalData) {
    const recordId = this.generateRecordId();

    return {
      id: recordId,
      timestamp: new Date().toISOString(),
      student: this.processStudentData(studentData),
      examination: this.processExaminationData(hospitalData),
      status: 'active',
      version: 1
    };
  }

  // Process student data into standardized format
  processStudentData(studentData) {
    return {
      // Basic Information
      fullName: studentData.fullName,
      nic: studentData.nic,
      studentRegistrationNumber: studentData.studentRegistrationNumber,
      email: studentData.email,
      telephone: studentData.telephoneNumber,
      dateOfBirth: studentData.dateOfBirth,
      age: studentData.age,
      gender: studentData.gender,

      // Academic Information
      academicDivision: studentData.academicDivision,

      // Contact Information
      homeAddress: studentData.homeAddress,
      emergencyContact: {
        name: studentData.emergencyName,
        telephone: studentData.emergencyTelephone,
        relationship: studentData.emergencyRelationship,
        address: studentData.emergencyAddress
      },

      // Medical History
      medicalHistory: studentData.medicalHistory || {},
      familyHistory: studentData.familyHistory || {},
      vaccinations: studentData.vaccinations || [],

      // Certification
      certification: {
        date: studentData.certificationDate,
        signature: studentData.signature
      }
    };
  }

  // Process examination data into standardized format
  processExaminationData(hospitalData) {
    return {
      examiner: hospitalData.studentName,

      physicalMeasurements: {
        weight: hospitalData.weight,
        height: hospitalData.height,
        chestInspiration: hospitalData.chestInspiration,
        chestExpiration: hospitalData.chestExpiration
      },

      clinicalTests: {
        bloodGroup: hospitalData.bloodGroup,
        hemoglobin: hospitalData.hemoglobin,
        vaccinationStatus: hospitalData.vaccinated
      },

      systemicExamination: this.processSystemicExamination(hospitalData),

      allergies: {
        hasAllergies: hospitalData.hasAllergies,
        categories: hospitalData.allergies || {},
        details: hospitalData.allergyDetails || ''
      },

      assessment: {
        specialistReferral: hospitalData.specialistReferral,
        medicalCondition: hospitalData.medicalCondition,
        fitForStudies: hospitalData.fitForStudies,
        reason: hospitalData.reason
      },

      certification: {
        date: hospitalData.date1,
        signature: hospitalData.medicalOfficerSignature
      }
    };
  }

  // Process systemic examination data
  processSystemicExamination(hospitalData) {
    return {
      cardiovascular: {
        heartDisease: hospitalData.heartDisease,
        heartSound: hospitalData.heartSound,
        bloodPressure: hospitalData.bloodPressure,
        pulse: hospitalData.pulse,
        murmurs: hospitalData.murmurs
      },

      respiratory: {
        tuberculosis: hospitalData.tuberculosis,
        tuberculosisTest: hospitalData.tuberculosisTest,
        xray: {
          chest: hospitalData.xrayChest,
          number: hospitalData.xrayNo,
          findings: hospitalData.xrayFindings,
          date: hospitalData.xrayDate
        }
      },

      neurological: {
        convulsion: hospitalData.convulsion,
        kneeJerks: hospitalData.kneeJerks
      },

      gastrointestinal: {
        liverSpleen: hospitalData.liverSpleen,
        hemorrhoids: hospitalData.hemorrhoids,
        hernialOrifices: hospitalData.hernialOrifices
      },

      vision: {
        rightEye: {
          withoutGlasses: hospitalData.visionRightWithout,
          withGlasses: hospitalData.visionRightWith
        },
        leftEye: {
          withoutGlasses: hospitalData.visionLeftWithout,
          withGlasses: hospitalData.visionLeftWith
        },
        colorVision: {
          normal: hospitalData.colorVisionNormal,
          red: hospitalData.colorVisionRed,
          green: hospitalData.colorVisionGreen
        }
      },

      hearing: {
        rightEar: hospitalData.hearingRight,
        leftEar: hospitalData.hearingLeft,
        speech: hospitalData.speech
      },

      dental: {
        decayed: hospitalData.teethDecayed,
        missing: hospitalData.teethMissing,
        dentures: hospitalData.teethDentures,
        gingivitis: hospitalData.teethGingivitis
      },

      musculoskeletal: {
        scarsOperations: hospitalData.scarsOperations,
        varicoseVeins: hospitalData.varicoseVeins,
        boneJoint: hospitalData.boneJoint
      }
    };
  }

  // Generate QR code for medical record
  async generateQRCode(medicalRecord) {
    try {
      const qrData = {
        id: medicalRecord.id,
        name: medicalRecord.student.fullName,
        nic: medicalRecord.student.nic,
        regNumber: medicalRecord.student.studentRegistrationNumber,
        timestamp: medicalRecord.timestamp,
        checksum: this.generateChecksum(medicalRecord)
      };

      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });

      return {
        qrCodeDataUrl,
        qrData,
        success: true
      };
    } catch (error) {
      throw new Error(`QR code generation failed: ${error.message}`);
    }
  }

  // Generate checksum for data integrity
  generateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Save medical record
  async saveMedicalRecord(medicalRecord) {
    try {
      const result = await apiService.saveMedicalRecord(medicalRecord);

      if (result.success) {
        this.cacheRecord(medicalRecord);
        this.storeLocalRecord(medicalRecord);
        return { success: true, recordId: medicalRecord.id };
      }

      throw new Error(result.error || 'Save failed');

    } catch (error) {
      return errorHandler.handleApiError(error, 'SAVE_MEDICAL_RECORD', () => {
        this.storeLocalRecord(medicalRecord);
        return { success: true, recordId: medicalRecord.id, offline: true };
      });
    }
  }

  // Get medical record by ID
  async getMedicalRecord(recordId) {
    try {
      // Check cache first
      if (this.recordCache.has(recordId)) {
        return { success: true, record: this.recordCache.get(recordId) };
      }

      const record = await apiService.getMedicalRecord(recordId);

      if (record) {
        this.cacheRecord(record);
        return { success: true, record };
      }

      throw new Error('Record not found');

    } catch (error) {
      return errorHandler.handleApiError(error, 'GET_MEDICAL_RECORD', () => {
        const localRecord = this.getLocalRecord(recordId);
        if (localRecord) {
          return { success: true, record: localRecord, offline: true };
        }
        return { success: false, error: 'Record not found' };
      });
    }
  }

  // Process complete medical record workflow
  async processCompleteRecord(studentData, hospitalData) {
    try {
      // 1. Create medical record
      const medicalRecord = this.createMedicalRecord(studentData, hospitalData);

      // 2. Generate QR code
      const qrResult = await this.generateQRCode(medicalRecord);

      // 3. Save record
      const saveResult = await this.saveMedicalRecord(medicalRecord);

      if (saveResult.success) {
        // 4. Store user-specific data
        this.storeUserQRData(medicalRecord, qrResult.qrCodeDataUrl);

        return {
          success: true,
          recordId: medicalRecord.id,
          qrCode: qrResult.qrCodeDataUrl,
          message: 'Medical record processed successfully',
          studentName: medicalRecord.student.fullName,
          studentEmail: medicalRecord.student.email
        };
      }

      throw new Error(saveResult.error || 'Processing failed');

    } catch (error) {
      return errorHandler.handleApiError(error, 'PROCESS_MEDICAL_RECORD');
    }
  }

  // Check if forms are complete for a user
  checkFormsCompletion(email) {
    try {
      const studentData = this.getStoredData(`studentData_${email}`);
      const hospitalData = this.getStoredData(`hospitalData_${email}`);

      const hasStudentData = studentData && studentData.email === email && studentData.fullName;
      const hasHospitalData = hospitalData && hospitalData.studentEmail === email && hospitalData.weight;

      return {
        hasStudentData,
        hasHospitalData,
        bothComplete: hasStudentData && hasHospitalData
      };
    } catch (error) {
      console.error('Error checking form completion:', error);
      return { hasStudentData: false, hasHospitalData: false, bothComplete: false };
    }
  }

  // Auto-generate QR when forms are complete
  async autoGenerateQR(email) {
    try {
      const { bothComplete } = this.checkFormsCompletion(email);

      if (!bothComplete) {
        return { success: false, error: 'Both forms not complete' };
      }

      // Check if QR already exists
      if (this.getStoredData(`qrCodeData_${email}`)) {
        return { success: true, alreadyExists: true };
      }

      const studentData = this.getStoredData(`studentData_${email}`);
      const hospitalData = this.getStoredData(`hospitalData_${email}`);

      const result = await this.processCompleteRecord(studentData, hospitalData);

      if (result.success) {
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('qrCodeGenerated', {
          detail: { email, recordId: result.recordId }
        }));
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  cacheRecord(record) {
    this.recordCache.set(record.id, record);

    // Limit cache size
    if (this.recordCache.size > 100) {
      const firstKey = this.recordCache.keys().next().value;
      this.recordCache.delete(firstKey);
    }
  }

  storeLocalRecord(record) {
    try {
      localStorage.setItem(`medicalRecord_${record.id}`, JSON.stringify(record));
      localStorage.setItem('latestMedicalRecord', JSON.stringify(record));
    } catch (error) {
      console.error('Failed to store local record:', error);
    }
  }

  getLocalRecord(recordId) {
    try {
      const recordData = localStorage.getItem(`medicalRecord_${recordId}`);
      return recordData ? JSON.parse(recordData) : null;
    } catch (error) {
      console.error('Failed to get local record:', error);
      return null;
    }
  }

  storeUserQRData(medicalRecord, qrCodeDataUrl) {
    const email = medicalRecord.student.email;

    try {
      localStorage.setItem(`qrCodeData_${email}`, qrCodeDataUrl);
      localStorage.setItem(`medicalRecordId_${email}`, medicalRecord.id);
      localStorage.setItem('studentName', medicalRecord.student.fullName);
      localStorage.setItem('studentEmail', email);

      // Backward compatibility
      localStorage.setItem('qrCodeData', qrCodeDataUrl);
      localStorage.setItem('medicalRecordId', medicalRecord.id);
    } catch (error) {
      console.error('Failed to store user QR data:', error);
    }
  }

  getStoredData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to get stored data for ${key}:`, error);
      return null;
    }
  }

  // Clear cache and local storage
  clearCache() {
    this.recordCache.clear();
  }

  clearLocalStorage() {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith('medicalRecord_') ||
      key.startsWith('qrCodeData_') ||
      key.startsWith('studentData_') ||
      key.startsWith('hospitalData_')
    );

    keys.forEach(key => localStorage.removeItem(key));
  }
}

// Create singleton instance
const medicalRecordService = new MedicalRecordService();

export default medicalRecordService;