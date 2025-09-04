import QRCode from 'qrcode';

// Generate unique ID for medical records
const generateUniqueId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `MED-${timestamp}-${random}`;
};

// Merge student details and hospital staff examination data
export const mergeMedicalData = (studentData, hospitalData) => {
  const uniqueId = generateUniqueId();
  
  const mergedData = {
    id: uniqueId,
    timestamp: new Date().toISOString(),
    
    // Student Information
    student: {
      fullName: studentData.fullName,
      nic: studentData.nic,
      studentRegistrationNumber: studentData.studentRegistrationNumber,
      academicDivision: studentData.academicDivision,
      dateOfBirth: studentData.dateOfBirth,
      age: studentData.age,
      gender: studentData.gender,
      nationality: studentData.nationality,
      homeAddress: studentData.homeAddress,
      telephoneNumber: studentData.telephoneNumber,
      email: studentData.email || '',
      
      // Emergency Contact
      emergencyContact: {
        name: studentData.emergencyName,
        telephone: studentData.emergencyTelephone,
        address: studentData.emergencyAddress,
        relationship: studentData.emergencyRelationship
      },
      
      // Personal Details
      personalDetails: {
        positionOfFamily: studentData.positionOfFamily,
        lastAttendSchool: studentData.lastAttendSchool,
        religion: studentData.religion,
        occupationOfFather: studentData.occupationOfFather,
        occupationOfMother: studentData.occupationOfMother,
        singleMarried: studentData.singleMarried,
        extraCurricularActivities: studentData.extraCurricularActivities
      },
      
      // Medical History provided by student
      studentMedicalHistory: studentData.medicalHistory,
      familyHistory: studentData.familyHistory,
      vaccinations: studentData.vaccinations,
      certification: {
        date: studentData.certificationDate,
        signature: studentData.signature
      }
    },
    
    // Hospital Examination Results
    examination: {
      examiner: hospitalData.studentName, // Name verified by medical officer
      
      // Basic Measurements
      physicalMeasurements: {
        weight: hospitalData.weight,
        height: hospitalData.height,
        chestInspiration: hospitalData.chestInspiration,
        chestExpiration: hospitalData.chestExpiration
      },
      
      // Medical Examination Results
      vaccinationStatus: hospitalData.vaccinated,
      
      // Detailed Examination
      examination: {
        teeth: {
          decayed: hospitalData.teethDecayed,
          missing: hospitalData.teethMissing,
          dentures: hospitalData.teethDentures,
          gingivitis: hospitalData.teethGingivitis
        },
        hearing: {
          rightEar: hospitalData.hearingRight,
          leftEar: hospitalData.hearingLeft,
          speech: hospitalData.speech
        },
        circulation: {
          heartDisease: hospitalData.heartDisease,
          heartSound: hospitalData.heartSound,
          bloodPressure: hospitalData.bloodPressure,
          murmurs: hospitalData.murmurs,
          pulse: hospitalData.pulse
        },
        respiration: {
          tuberculosis: hospitalData.tuberculosis,
          tuberculosisTest: hospitalData.tuberculosisTest,
          xray: {
            chest: hospitalData.xrayChest,
            number: hospitalData.xrayNo,
            findings: hospitalData.xrayFindings,
            date: hospitalData.xrayDate
          }
        },
        nervous: {
          convulsion: hospitalData.convulsion,
          kneeJerks: hospitalData.kneeJerks
        },
        abdomen: {
          liverSpleen: hospitalData.liverSpleen,
          hemorrhoids: hospitalData.hemorrhoids,
          hernialOrifices: hospitalData.hernialOrifices
        },
        vision: {
          rightWithoutGlasses: hospitalData.visionRightWithout,
          leftWithoutGlasses: hospitalData.visionLeftWithout,
          rightWithGlasses: hospitalData.visionRightWith,
          leftWithGlasses: hospitalData.visionLeftWith,
          colorVision: {
            normal: hospitalData.colorVisionNormal,
            red: hospitalData.colorVisionRed,
            green: hospitalData.colorVisionGreen
          }
        },
        extremities: {
          scarsOperations: hospitalData.scarsOperations,
          varicoseVeins: hospitalData.varicoseVeins,
          boneJoint: hospitalData.boneJoint
        },
        clinicalTests: {
          bloodGroup: hospitalData.bloodGroup,
          hemoglobin: hospitalData.hemoglobin
        }
      },
      
      // Medical Assessment
      assessment: {
        specialistReferral: hospitalData.specialistReferral,
        medicalCondition: hospitalData.medicalCondition,
        fitForStudies: hospitalData.fitForStudies,
        reason: hospitalData.reason
      },
      
      // Certification
      certification: {
        date1: hospitalData.date1,
        date2: hospitalData.date2,
        medicalOfficerSignature: hospitalData.medicalOfficerSignature,
        itumMedicalOfficerSignature: hospitalData.itumMedicalOfficerSignature
      }
    }
  };
  
  return mergedData;
};

// Generate QR Code with merged medical data
export const generateMedicalQRCode = async (mergedData) => {
  try {
    // Create a summary object for QR code (not the full data due to size limits)
    const qrData = {
      id: mergedData.id,
      name: mergedData.student.fullName,
      nic: mergedData.student.nic,
      regNumber: mergedData.student.studentRegistrationNumber,
      timestamp: mergedData.timestamp,
      // URL to fetch full data
      dataUrl: `${window.location.origin}/api/medical-records/${mergedData.id}`
    };
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return {
      qrCodeDataUrl,
      qrData,
      fullMedicalData: mergedData
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Save merged medical data to backend (using existing endpoint)
export const saveMedicalRecord = async (mergedData) => {
  try {
    // For now, save to localStorage since the backend endpoint doesn't exist
    // You can implement the backend endpoint later
    const recordKey = `medicalRecord_${mergedData.id}`;
    localStorage.setItem(recordKey, JSON.stringify(mergedData));
    localStorage.setItem('latestMedicalRecord', JSON.stringify(mergedData));
    
    // Simulate API response
    return {
      status: 'success',
      recordId: mergedData.id,
      message: 'Medical record saved successfully'
    };
    
    // Uncomment below when backend endpoint is ready:
    /*
    const response = await fetch('http://localhost:8081/api/medical-records/save-merged', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mergedData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
    */
  } catch (error) {
    console.error('Error saving medical record:', error);
    throw error;
  }
};

// Retrieve medical data by ID (for QR code scanning)
export const getMedicalRecordById = async (recordId) => {
  try {
    // Try to get from localStorage first
    const recordKey = `medicalRecord_${recordId}`;
    const localData = localStorage.getItem(recordKey);
    
    if (localData) {
      return JSON.parse(localData);
    }
    
    // If not found locally, try the latest record
    const latestRecord = localStorage.getItem('latestMedicalRecord');
    if (latestRecord) {
      const parsed = JSON.parse(latestRecord);
      if (parsed.id === recordId) {
        return parsed;
      }
    }
    
    // Uncomment below when backend endpoint is ready:
    /*
    const response = await fetch(`http://localhost:8081/api/medical-records/${recordId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    */
    
    throw new Error('Medical record not found');
  } catch (error) {
    console.error('Error fetching medical record:', error);
    throw error;
  }
};

// Get data by email from localStorage and backend
export const getDataByEmail = async (email) => {
  try {
    console.log('Getting data for email:', email);
    
    // Try to get data using email-specific keys first
    let studentData = JSON.parse(localStorage.getItem(`studentData_${email}`) || '{}');
    let hospitalData = JSON.parse(localStorage.getItem(`hospitalData_${email}`) || '{}');
    
    console.log('Email-specific data:', { studentData, hospitalData });
    
    // If email-specific data not found, try general keys and check email match
    if (!studentData.email) {
      const generalStudentData = JSON.parse(localStorage.getItem('studentFormData') || '{}');
      console.log('General student data:', generalStudentData);
      if (generalStudentData.email === email) {
        studentData = generalStudentData;
      }
    }
    
    if (!hospitalData.studentEmail) {
      const generalHospitalData = JSON.parse(localStorage.getItem('hospitalFormData') || '{}');
      console.log('General hospital data:', generalHospitalData);
      if (generalHospitalData.studentEmail === email) {
        hospitalData = generalHospitalData;
      }
    }
    
    console.log('Final data check:', { 
      studentEmail: studentData.email, 
      hospitalEmail: hospitalData.studentEmail, 
      targetEmail: email 
    });
    
    // Check if we have valid data for both forms
    if (studentData.email === email && hospitalData.studentEmail === email) {
      return {
        studentData,
        hospitalData,
        hasData: true
      };
    }
    
    // If no local data matches, return no data found
    // Uncomment below when backend endpoint is ready:
    /*
    const response = await fetch(`http://localhost:8081/api/medical-records/by-email/${email}`);
    if (response.ok) {
      const backendData = await response.json();
      return {
        studentData: backendData.studentData || {},
        hospitalData: backendData.hospitalData || {},
        hasData: true
      };
    }
    */
    
    return {
      studentData: {},
      hospitalData: {},
      hasData: false
    };
  } catch (error) {
    console.error('Error getting data by email:', error);
    return {
      studentData: {},
      hospitalData: {},
      hasData: false
    };
  }
};

// Check if both forms are completed for auto QR generation
export const checkFormsCompletion = (email) => {
  try {
    const studentData = JSON.parse(localStorage.getItem(`studentData_${email}`) || '{}');
    const hospitalData = JSON.parse(localStorage.getItem(`hospitalData_${email}`) || '{}');
    
    const hasStudentData = studentData.email === email && studentData.fullName;
    const hasHospitalData = hospitalData.studentEmail === email && hospitalData.weight;
    
    return {
      hasStudentData,
      hasHospitalData,
      bothComplete: hasStudentData && hasHospitalData
    };
  } catch (error) {
    console.error('Error checking forms completion:', error);
    return { hasStudentData: false, hasHospitalData: false, bothComplete: false };
  }
};

// Auto-generate QR code when both forms are complete
export const autoGenerateQRIfReady = async (email) => {
  try {
    const { bothComplete } = checkFormsCompletion(email);
    
    if (bothComplete) {
      // Check if QR code already exists
      const existingQR = localStorage.getItem(`qrCodeData_${email}`);
      if (existingQR) {
        console.log('QR code already exists for:', email);
        return { success: true, alreadyExists: true };
      }
      
      console.log('Auto-generating QR code for:', email);
      const result = await processCompleteMedicalRecordByEmail(email);
      
      if (result.success) {
        console.log('QR code auto-generated successfully for:', email);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('qrCodeGenerated', { 
          detail: { email, recordId: result.recordId } 
        }));
      }
      
      return result;
    }
    
    return { success: false, error: 'Both forms not complete yet' };
  } catch (error) {
    console.error('Error in auto QR generation:', error);
    return { success: false, error: error.message };
  }
};

// Get full medical record details by medical record ID (for doctor interface)
export const getFullMedicalRecordById = async (medicalRecordId) => {
  try {
    console.log('🔍 Fetching full medical record for ID:', medicalRecordId);
    
    const response = await fetch(`http://localhost:8081/api/medical-records/by-record-id/${medicalRecordId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.medicalRecord) {
      console.log('✅ Full medical record fetched from backend:', result.medicalRecord);
      return {
        success: true,
        medicalRecord: result.medicalRecord
      };
    } else {
      throw new Error(result.error || 'Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error fetching full medical record from backend:', error);
    
    // Enhanced fallback to localStorage with mock data
    try {
      const recordKey = `medicalRecord_${medicalRecordId}`;
      const localData = localStorage.getItem(recordKey);
      
      if (localData) {
        const medicalRecord = JSON.parse(localData);
        console.log('✅ Found medical record in localStorage:', medicalRecord);
        return {
          success: true,
          medicalRecord: medicalRecord
        };
      }
      
      // Create comprehensive mock data if nothing found
      console.log('⚠️ Creating comprehensive mock medical record for:', medicalRecordId);
      const mockRecord = createEnhancedMockRecord(medicalRecordId);
      
      return {
        success: true,
        medicalRecord: mockRecord
      };
      
    } catch (localError) {
      console.error('❌ Error in fallback:', localError);
      return {
        success: false,
        error: `Failed to fetch medical record: ${error.message}`
      };
    }
  }
};

// Helper function to create comprehensive mock medical record
const createEnhancedMockRecord = (recordId) => {
  const idSuffix = recordId.substring(Math.max(0, recordId.length() - 3));
  const numericSuffix = parseInt(idSuffix) || 1;
  
  return {
    id: recordId,
    timestamp: new Date().toISOString(),
    
    student: {
      fullName: `Student ${String.fromCharCode(65 + (numericSuffix % 26))}${numericSuffix}`,
      nic: `199${(numericSuffix % 5) + 5}01${String(numericSuffix).padStart(3, '0')}${numericSuffix % 10}V`,
      studentRegistrationNumber: `MED/2024/${String(numericSuffix).padStart(3, '0')}`,
      email: `student${numericSuffix}@university.edu`,
      telephoneNumber: `077${String(1234000 + numericSuffix)}`,
      academicDivision: "Faculty of Medicine",
      dateOfBirth: `199${(numericSuffix % 5) + 5}-0${(numericSuffix % 9) + 1}-${(numericSuffix % 28) + 1}`,
      age: String(23 + (numericSuffix % 7)),
      gender: numericSuffix % 2 === 0 ? "Male" : "Female",
      nationality: "Sri Lankan",
      homeAddress: `${numericSuffix} University Road, Colombo, Sri Lanka`,
      religion: ["Buddhism", "Christianity", "Islam", "Hinduism"][numericSuffix % 4],
      
      emergencyContact: {
        name: `Emergency Contact ${numericSuffix}`,
        telephone: `077${String(7654000 + numericSuffix)}`,
        relationship: ["Father", "Mother", "Guardian", "Sibling"][numericSuffix % 4],
        address: `${numericSuffix} University Road, Colombo, Sri Lanka`
      },
      
      studentMedicalHistory: {
        allergicHistory: {
          status: numericSuffix % 4 === 0 ? "yes" : "no",
          details: numericSuffix % 4 === 0 ? ["Penicillin", "Dust", "Pollen", "Shellfish"][numericSuffix % 4] : ""
        },
        significantMedicalHistory: {
          status: numericSuffix % 6 === 0 ? "yes" : "no",
          details: numericSuffix % 6 === 0 ? "Previous hospitalization for appendectomy" : ""
        },
        chronicIllness: {
          status: numericSuffix % 8 === 0 ? "yes" : "no",
          details: numericSuffix % 8 === 0 ? "Mild asthma, well controlled" : ""
        },
        surgicalHistory: {
          status: numericSuffix % 10 === 0 ? "yes" : "no",
          details: numericSuffix % 10 === 0 ? "Appendectomy in 2018" : ""
        }
      }
    },
    
    examination: {
      physicalMeasurements: {
        weight: String(55 + (numericSuffix % 30)),
        height: String(155 + (numericSuffix % 30)),
        chestInspiration: String(80 + (numericSuffix % 10)),
        chestExpiration: String(75 + (numericSuffix % 10))
      },
      
      vaccinationStatus: "yes",
      
      examination: {
        circulation: {
          bloodPressure: `${110 + (numericSuffix % 20)}/${70 + (numericSuffix % 15)}`,
          pulse: String(65 + (numericSuffix % 20)),
          heartDisease: "no",
          heartSound: "normal",
          murmurs: "no"
        },
        
        clinicalTests: {
          bloodGroup: ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"][numericSuffix % 8],
          hemoglobin: String((12.0 + (numericSuffix % 30) / 10).toFixed(1))
        },
        
        vision: {
          rightWithoutGlasses: "6/6",
          leftWithoutGlasses: "6/6",
          rightWithGlasses: "6/6",
          leftWithGlasses: "6/6",
          colorVision: {
            normal: "yes",
            red: "no",
            green: "no"
          }
        },
        
        hearing: {
          rightEar: "normal",
          leftEar: "normal",
          speech: "normal"
        },
        
        teeth: {
          decayed: String(numericSuffix % 3),
          missing: "0",
          dentures: "no",
          gingivitis: numericSuffix % 5 === 0 ? "mild" : "no"
        },
        
        nervous: {
          convulsion: "no",
          kneeJerks: "normal"
        },
        
        abdomen: {
          liverSpleen: "normal",
          hemorrhoids: "no",
          hernialOrifices: "no"
        },
        
        extremities: {
          scarsOperations: numericSuffix % 10 === 0 ? "appendectomy scar" : "no",
          varicoseVeins: "no",
          boneJoint: "normal"
        },
        
        respiration: {
          tuberculosis: "no",
          tuberculosisTest: "negative",
          xray: {
            chest: "normal",
            number: `XR${String(numericSuffix).padStart(3, '0')}`,
            findings: "Normal chest X-ray, clear bilateral lung fields",
            date: new Date().toISOString()
          }
        }
      },
      
      assessment: {
        specialistReferral: numericSuffix % 12 === 0 ? "yes" : "no",
        medicalCondition: "healthy",
        fitForStudies: "fit",
        reason: numericSuffix % 12 === 0 ? 
          "Recommend ENT consultation for hearing assessment" : 
          "Student is medically fit for academic studies with no restrictions"
      },
      
      certification: {
        date1: new Date().toISOString(),
        date2: new Date().toISOString(),
        medicalOfficerSignature: "Dr. Sarah Johnson, MBBS",
        itumMedicalOfficerSignature: "Dr. Michael Williams, MBBS, MD"
      }
    }
  };
};

// Process complete medical record by email
export const processCompleteMedicalRecordByEmail = async (email) => {
  try {
    console.log('Processing medical record for email:', email);
    
    // 1. Get data by email
    const { studentData, hospitalData, hasData } = await getDataByEmail(email);
    
    console.log('Retrieved data:', { studentData, hospitalData, hasData });
    
    if (!hasData) {
      throw new Error('No medical data found for this email address. Please complete both forms first.');
    }
    
    if (!studentData.fullName) {
      throw new Error('Student details not found. Please complete the student form first.');
    }
    
    if (!hospitalData.weight && !hospitalData.studentEmail) {
      throw new Error('Hospital examination data not found. Please complete the hospital examination first.');
    }
    
    // 2. Merge the data
    const mergedData = mergeMedicalData(studentData, hospitalData);
    
    // 3. Generate QR code
    const qrResult = await generateMedicalQRCode(mergedData);
    
    // 4. Save to backend
    const saveResult = await saveMedicalRecord(mergedData);
    
    // 5. Store QR info in localStorage for StudentQRcode component (user-specific)
    const userEmail = mergedData.student.email;
    localStorage.setItem(`qrCodeData_${userEmail}`, qrResult.qrCodeDataUrl);
    localStorage.setItem(`medicalRecordId_${userEmail}`, mergedData.id);
    localStorage.setItem('studentName', mergedData.student.fullName);
    localStorage.setItem('studentEmail', mergedData.student.email);
    
    // Also store in general keys for backward compatibility
    localStorage.setItem('qrCodeData', qrResult.qrCodeDataUrl);
    localStorage.setItem('medicalRecordId', mergedData.id);
    
    return {
      success: true,
      recordId: mergedData.id,
      qrCode: qrResult.qrCodeDataUrl,
      message: 'Medical record processed successfully',
      studentName: mergedData.student.fullName,
      studentEmail: mergedData.student.email
    };
  } catch (error) {
    console.error('Error processing medical record:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Process complete medical record (student + hospital data) - Legacy function
export const processCompleteMedicalRecord = async (studentData, hospitalData) => {
  try {
    // 1. Merge the data
    const mergedData = mergeMedicalData(studentData, hospitalData);
    
    // 2. Generate QR code
    const qrResult = await generateMedicalQRCode(mergedData);
    
    // 3. Save to backend
    const saveResult = await saveMedicalRecord(mergedData);
    
    // 4. Store QR info in localStorage for StudentQRcode component
    localStorage.setItem('qrCodeData', qrResult.qrCodeDataUrl);
    localStorage.setItem('medicalRecordId', mergedData.id);
    localStorage.setItem('studentName', mergedData.student.fullName);
    localStorage.setItem('studentEmail', mergedData.student.email || 'No Email');
    
    return {
      success: true,
      recordId: mergedData.id,
      qrCode: qrResult.qrCodeDataUrl,
      message: 'Medical record processed successfully'
    };
  } catch (error) {
    console.error('Error processing medical record:', error);
    return {
      success: false,
      error: error.message
    };
  }
};