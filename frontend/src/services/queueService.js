// Queue Management Service
let queueCounter = 100; // Starting queue number

// Generate unique queue number
const generateQueueNumber = () => {
  return String(queueCounter++).padStart(3, '0');
};

// Add student to reception queue from QR scan
export const addStudentToReceptionQueue = (medicalData) => {
  try {
    // Get existing reception queue
    const existingQueue = JSON.parse(localStorage.getItem('receptionQueue') || '[]');
    
    // Check if student already exists in queue (prevent duplicates)
    const existingStudent = existingQueue.find(entry => 
      entry.studentId === medicalData.student.studentRegistrationNumber ||
      entry.nic === medicalData.student.nic ||
      entry.medicalRecordId === medicalData.id
    );
    
    if (existingStudent) {
      console.log('Student already exists in queue:', existingStudent);
      throw new Error(`Student ${medicalData.student.fullName} is already in the reception queue (Queue #${existingStudent.queueNo})`);
    }
    
    // Try to get student profile image from various sources
    let profileImage = null;
    
    // Check studentFormData first
    const formData = localStorage.getItem('studentFormData');
    if (formData) {
      try {
        const parsedFormData = JSON.parse(formData);
        if (parsedFormData.email === medicalData.student.email && parsedFormData.profileImage) {
          profileImage = parsedFormData.profileImage;
        }
      } catch (error) {
        console.error('Error parsing studentFormData for profile image:', error);
      }
    }
    
    // Check student-specific data
    if (!profileImage) {
      const studentDataKey = `studentData_${medicalData.student.email}`;
      const studentData = localStorage.getItem(studentDataKey);
      if (studentData) {
        try {
          const parsedStudentData = JSON.parse(studentData);
          if (parsedStudentData.profileImage) {
            profileImage = parsedStudentData.profileImage;
          }
        } catch (error) {
          console.error('Error parsing student data for profile image:', error);
        }
      }
    }
    
    const queueNumber = generateQueueNumber();
    const currentTime = new Date().toISOString();
    
    const queueEntry = {
      queueNo: queueNumber,
      studentName: medicalData.student.fullName,
      studentId: medicalData.student.studentRegistrationNumber,
      email: medicalData.student.email,
      nic: medicalData.student.nic,
      phone: medicalData.student.telephoneNumber,
      medicalRecordId: medicalData.id,
      medicalData: medicalData,
      profileImage: profileImage, // Add profile image to queue entry
      status: 'Waiting',
      priority: 'Normal',
      addedTime: currentTime,
      waitTime: '0 min',
      action: 'Call Now',
      stage: 'reception' // reception -> doctor -> pharmacy
    };
    
    // Add new entry
    existingQueue.push(queueEntry);
    
    // Save updated queue
    localStorage.setItem('receptionQueue', JSON.stringify(existingQueue));
    
    console.log('Student added to reception queue:', queueEntry);
    return queueEntry;
  } catch (error) {
    console.error('Error adding student to reception queue:', error);
    throw error;
  }
};

// Get reception queue
export const getReceptionQueue = () => {
  try {
    const queue = JSON.parse(localStorage.getItem('receptionQueue') || '[]');
    
    // Update wait times
    const currentTime = new Date();
    const updatedQueue = queue.map(entry => {
      const addedTime = new Date(entry.addedTime);
      const waitMinutes = Math.floor((currentTime - addedTime) / (1000 * 60));
      return {
        ...entry,
        waitTime: waitMinutes > 0 ? `${waitMinutes} min` : '0 min'
      };
    });
    
    return updatedQueue;
  } catch (error) {
    console.error('Error getting reception queue:', error);
    return [];
  }
};

// Move student from reception to doctor queue
export const moveStudentToDoctor = (queueNo) => {
  try {
    const receptionQueue = JSON.parse(localStorage.getItem('receptionQueue') || '[]');
    const doctorQueue = JSON.parse(localStorage.getItem('doctorQueue') || '[]');
    
    // Find student in reception queue
    const studentIndex = receptionQueue.findIndex(entry => entry.queueNo === queueNo);
    if (studentIndex === -1) {
      throw new Error('Student not found in reception queue');
    }
    
    const student = receptionQueue[studentIndex];
    
    // Update student entry for doctor queue
    const doctorEntry = {
      ...student,
      status: 'Waiting for Doctor',
      stage: 'doctor',
      movedToDoctorTime: new Date().toISOString()
    };
    
    // Add to doctor queue
    doctorQueue.push(doctorEntry);
    
    // Remove from reception queue
    receptionQueue.splice(studentIndex, 1);
    
    // Save updated queues
    localStorage.setItem('receptionQueue', JSON.stringify(receptionQueue));
    localStorage.setItem('doctorQueue', JSON.stringify(doctorQueue));
    
    console.log('Student moved to doctor queue:', doctorEntry);
    return doctorEntry;
  } catch (error) {
    console.error('Error moving student to doctor:', error);
    throw error;
  }
};

// Get doctor queue
export const getDoctorQueue = () => {
  try {
    const queue = JSON.parse(localStorage.getItem('doctorQueue') || '[]');
    return queue;
  } catch (error) {
    console.error('Error getting doctor queue:', error);
    return [];
  }
};

// Add prescription and move to pharmacy queue
export const addPrescriptionAndMoveToPharmacy = (queueNo, prescription) => {
  try {
    const doctorQueue = JSON.parse(localStorage.getItem('doctorQueue') || '[]');
    const pharmacyQueue = JSON.parse(localStorage.getItem('pharmacyQueue') || '[]');
    
    // Find student in doctor queue
    const studentIndex = doctorQueue.findIndex(entry => entry.queueNo === queueNo);
    if (studentIndex === -1) {
      throw new Error('Student not found in doctor queue');
    }
    
    const student = doctorQueue[studentIndex];
    
    // Create pharmacy entry with prescription
    const pharmacyEntry = {
      ...student,
      status: 'Prescription Ready',
      stage: 'pharmacy',
      prescription: prescription,
      prescriptionTime: new Date().toISOString(),
      pharmacyStatus: 'Pending'
    };
    
    // Add to pharmacy queue
    pharmacyQueue.push(pharmacyEntry);
    
    // Remove from doctor queue
    doctorQueue.splice(studentIndex, 1);
    
    // Save updated queues
    localStorage.setItem('doctorQueue', JSON.stringify(doctorQueue));
    localStorage.setItem('pharmacyQueue', JSON.stringify(pharmacyQueue));
    
    console.log('Student moved to pharmacy queue with prescription:', pharmacyEntry);
    return pharmacyEntry;
  } catch (error) {
    console.error('Error moving student to pharmacy:', error);
    throw error;
  }
};

// Get pharmacy queue
export const getPharmacyQueue = () => {
  try {
    const queue = JSON.parse(localStorage.getItem('pharmacyQueue') || '[]');
    return queue;
  } catch (error) {
    console.error('Error getting pharmacy queue:', error);
    return [];
  }
};

// Complete pharmacy process
export const completePharmacyProcess = (queueNo) => {
  try {
    const pharmacyQueue = JSON.parse(localStorage.getItem('pharmacyQueue') || '[]');
    const completedQueue = JSON.parse(localStorage.getItem('completedQueue') || '[]');
    
    // Find student in pharmacy queue
    const studentIndex = pharmacyQueue.findIndex(entry => entry.queueNo === queueNo);
    if (studentIndex === -1) {
      throw new Error('Student not found in pharmacy queue');
    }
    
    const student = pharmacyQueue[studentIndex];
    
    // Create completed entry
    const completedEntry = {
      ...student,
      status: 'Completed',
      stage: 'completed',
      completedTime: new Date().toISOString(),
      pharmacyStatus: 'Dispensed'
    };
    
    // Add to completed queue
    completedQueue.push(completedEntry);
    
    // Remove from pharmacy queue
    pharmacyQueue.splice(studentIndex, 1);
    
    // Save updated queues
    localStorage.setItem('pharmacyQueue', JSON.stringify(pharmacyQueue));
    localStorage.setItem('completedQueue', JSON.stringify(completedQueue));
    
    console.log('Student process completed:', completedEntry);
    return completedEntry;
  } catch (error) {
    console.error('Error completing pharmacy process:', error);
    throw error;
  }
};

// Update queue entry status
export const updateQueueEntryStatus = (queueType, queueNo, updates) => {
  try {
    const queue = JSON.parse(localStorage.getItem(`${queueType}Queue`) || '[]');
    
    const entryIndex = queue.findIndex(entry => entry.queueNo === queueNo);
    if (entryIndex === -1) {
      throw new Error(`Entry not found in ${queueType} queue`);
    }
    
    // Update entry
    queue[entryIndex] = { ...queue[entryIndex], ...updates };
    
    // Save updated queue
    localStorage.setItem(`${queueType}Queue`, JSON.stringify(queue));
    
    return queue[entryIndex];
  } catch (error) {
    console.error(`Error updating ${queueType} queue entry:`, error);
    throw error;
  }
};

// Get student by queue number from any queue
export const getStudentByQueueNumber = (queueNo) => {
  try {
    const queueTypes = ['reception', 'doctor', 'pharmacy', 'completed'];
    
    for (const queueType of queueTypes) {
      const queue = JSON.parse(localStorage.getItem(`${queueType}Queue`) || '[]');
      const student = queue.find(entry => entry.queueNo === queueNo);
      if (student) {
        return { ...student, currentQueue: queueType };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting student by queue number:', error);
    return null;
  }
};

// Clear all queues (for testing)
export const clearAllQueues = () => {
  localStorage.removeItem('receptionQueue');
  localStorage.removeItem('doctorQueue');
  localStorage.removeItem('pharmacyQueue');
  localStorage.removeItem('completedQueue');
  queueCounter = 100; // Reset counter
};