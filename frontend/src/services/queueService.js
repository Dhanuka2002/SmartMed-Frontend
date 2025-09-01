// Queue Management Service - Backend Integration
const API_BASE_URL = 'http://localhost:8081/api/queue';

// Add student to reception queue from QR scan
export const addStudentToReceptionQueue = async (medicalData) => {
  try {
    console.log('Adding student to queue via backend API:', medicalData);
    
    const response = await fetch(`${API_BASE_URL}/add-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medicalData: medicalData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.isDuplicate) {
      console.log('Student already in queue:', result.queueEntry);
      return {
        ...result.queueEntry,
        isDuplicate: true,
        message: result.message
      };
    }

    console.log('Student added to reception queue:', result.queueEntry);
    return result.queueEntry;
    
  } catch (error) {
    console.error('Error adding student to reception queue:', error);
    
    // Fallback to localStorage if backend is not available
    console.warn('Falling back to localStorage due to backend error');
    return addStudentToReceptionQueueLocalStorage(medicalData);
  }
};

// Fallback localStorage implementation
const addStudentToReceptionQueueLocalStorage = (medicalData) => {
  try {
    // Get existing reception queue
    const existingQueue = JSON.parse(localStorage.getItem('receptionQueue') || '[]');
    
    // Check for duplicates by email, NIC, or medical record ID (only in reception queue)
    const isDuplicate = existingQueue.some(entry => 
      (entry.email === medicalData.student.email ||
       entry.nic === medicalData.student.nic ||
       entry.medicalRecordId === medicalData.id) &&
      entry.stage === 'reception'  // Only check reception stage
    );
    
    if (isDuplicate) {
      const existingEntry = existingQueue.find(entry => 
        (entry.email === medicalData.student.email ||
         entry.nic === medicalData.student.nic ||
         entry.medicalRecordId === medicalData.id) &&
        entry.stage === 'reception'
      );
      
      console.log('Student already in reception queue:', existingEntry);
      return {
        ...existingEntry,
        isDuplicate: true,
        message: `Student ${medicalData.student.fullName} is already in the reception queue (Queue #${existingEntry.queueNo})`
      };
    }
    
    // Check if student exists in other queues for informational purposes
    const allQueues = [
      ...JSON.parse(localStorage.getItem('receptionQueue') || '[]'),
      ...JSON.parse(localStorage.getItem('doctorQueue') || '[]'),
      ...JSON.parse(localStorage.getItem('pharmacyQueue') || '[]'),
      ...JSON.parse(localStorage.getItem('completedQueue') || '[]')
    ];
    
    const existingInOtherStage = allQueues.find(entry => 
      (entry.email === medicalData.student.email ||
       entry.nic === medicalData.student.nic ||
       entry.medicalRecordId === medicalData.id) &&
      entry.stage !== 'reception'
    );
    
    let existingStageInfo = '';
    if (existingInOtherStage) {
      existingStageInfo = ` (Note: Student was previously in ${existingInOtherStage.stage} queue)`;
    }
    
    // Generate simple queue number for fallback
    const queueNumber = String(Date.now()).slice(-3);
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
      status: 'Waiting',
      priority: 'Normal',
      addedTime: currentTime,
      waitTime: '0 min',
      action: 'Call Now',
      stage: 'reception'
    };
    
    // Add new entry
    existingQueue.push(queueEntry);
    
    // Save updated queue
    localStorage.setItem('receptionQueue', JSON.stringify(existingQueue));
    
    console.log('Student added to reception queue (localStorage fallback):', queueEntry);
    return queueEntry;
  } catch (error) {
    console.error('Error adding student to reception queue (localStorage fallback):', error);
    throw error;
  }
};

// Get reception queue
export const getReceptionQueue = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reception`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const queue = await response.json();
    return queue;
  } catch (error) {
    console.error('Error getting reception queue from backend:', error);
    
    // Fallback to localStorage
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
    } catch (localError) {
      console.error('Error getting reception queue from localStorage:', localError);
      return [];
    }
  }
};

// Move student from reception to doctor queue
export const moveStudentToDoctor = async (queueNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/move-to-doctor/${queueNo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Student moved to doctor queue:', result.queueEntry);
    return result.queueEntry;
  } catch (error) {
    console.error('Error moving student to doctor via backend:', error);
    
    // Fallback to localStorage
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
      
      console.log('Student moved to doctor queue (localStorage fallback):', doctorEntry);
      return doctorEntry;
    } catch (localError) {
      console.error('Error moving student to doctor (localStorage fallback):', localError);
      throw localError;
    }
  }
};

// Get doctor queue
export const getDoctorQueue = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctor`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const queue = await response.json();
    return queue;
  } catch (error) {
    console.error('Error getting doctor queue from backend:', error);
    
    // Fallback to localStorage
    try {
      const queue = JSON.parse(localStorage.getItem('doctorQueue') || '[]');
      return queue;
    } catch (localError) {
      console.error('Error getting doctor queue from localStorage:', localError);
      return [];
    }
  }
};

// Add prescription and move to pharmacy queue
export const addPrescriptionAndMoveToPharmacy = async (queueNo, prescription) => {
  try {
    const response = await fetch(`${API_BASE_URL}/move-to-pharmacy/${queueNo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prescription)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Student moved to pharmacy queue with prescription:', result.queueEntry);
    return result.queueEntry;
  } catch (error) {
    console.error('Error moving student to pharmacy via backend:', error);
    
    // Fallback to localStorage
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
      
      console.log('Student moved to pharmacy queue with prescription (localStorage fallback):', pharmacyEntry);
      return pharmacyEntry;
    } catch (localError) {
      console.error('Error moving student to pharmacy (localStorage fallback):', localError);
      throw localError;
    }
  }
};

// Get pharmacy queue
export const getPharmacyQueue = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pharmacy`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const queue = await response.json();
    return queue;
  } catch (error) {
    console.error('Error getting pharmacy queue from backend:', error);
    
    // Fallback to localStorage
    try {
      const queue = JSON.parse(localStorage.getItem('pharmacyQueue') || '[]');
      return queue;
    } catch (localError) {
      console.error('Error getting pharmacy queue from localStorage:', localError);
      return [];
    }
  }
};

// Complete pharmacy process
export const completePharmacyProcess = async (queueNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/complete/${queueNo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Student process completed:', result.queueEntry);
    return result.queueEntry;
  } catch (error) {
    console.error('Error completing pharmacy process via backend:', error);
    
    // Fallback to localStorage
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
      
      console.log('Student process completed (localStorage fallback):', completedEntry);
      return completedEntry;
    } catch (localError) {
      console.error('Error completing pharmacy process (localStorage fallback):', localError);
      throw localError;
    }
  }
};

// Update queue entry status
export const updateQueueEntryStatus = async (queueType, queueNo, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update-status/${queueNo}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.queueEntry;
  } catch (error) {
    console.error('Error updating queue entry via backend:', error);
    
    // Fallback to localStorage
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
    } catch (localError) {
      console.error(`Error updating ${queueType} queue entry (localStorage fallback):`, localError);
      throw localError;
    }
  }
};

// Get student by queue number from any queue
export const getStudentByQueueNumber = async (queueNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/${queueNo}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const student = await response.json();
    return student;
  } catch (error) {
    console.error('Error getting student by queue number from backend:', error);
    
    // Fallback to localStorage
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
    } catch (localError) {
      console.error('Error getting student by queue number (localStorage fallback):', localError);
      return null;
    }
  }
};

// Clear all queues (for testing)
export const clearAllQueues = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/clear-all`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('All queues cleared via backend:', result.message);
    
    // Also clear localStorage as fallback
    localStorage.removeItem('receptionQueue');
    localStorage.removeItem('doctorQueue');
    localStorage.removeItem('pharmacyQueue');
    localStorage.removeItem('completedQueue');
    
    return result;
  } catch (error) {
    console.error('Error clearing all queues via backend:', error);
    
    // Fallback to localStorage only
    localStorage.removeItem('receptionQueue');
    localStorage.removeItem('doctorQueue');
    localStorage.removeItem('pharmacyQueue');
    localStorage.removeItem('completedQueue');
    
    console.log('All queues cleared (localStorage fallback)');
    return { success: true, message: 'All queues cleared (localStorage fallback)' };
  }
};

// Get queue statistics
export const getQueueStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error getting queue stats from backend:', error);
    
    // Fallback to localStorage count
    try {
      const receptionQueue = JSON.parse(localStorage.getItem('receptionQueue') || '[]');
      const doctorQueue = JSON.parse(localStorage.getItem('doctorQueue') || '[]');
      const pharmacyQueue = JSON.parse(localStorage.getItem('pharmacyQueue') || '[]');
      const completedQueue = JSON.parse(localStorage.getItem('completedQueue') || '[]');
      
      return {
        reception: receptionQueue.length,
        doctor: doctorQueue.length,
        pharmacy: pharmacyQueue.length,
        completed: completedQueue.length,
        total: receptionQueue.length + doctorQueue.length + pharmacyQueue.length + completedQueue.length
      };
    } catch (localError) {
      console.error('Error getting queue stats (localStorage fallback):', localError);
      return {
        reception: 0,
        doctor: 0,
        pharmacy: 0,
        completed: 0,
        total: 0
      };
    }
  }
};