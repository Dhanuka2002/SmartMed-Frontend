// Simplified Queue Management Service
import apiService from './apiService.js';

class QueueService {
  constructor() {
    this.queueTypes = ['reception', 'doctor', 'pharmacy', 'completed'];
    this.fallbackData = this.initializeFallbackData();
  }

  // Initialize fallback data structure
  initializeFallbackData() {
    const data = {};
    this.queueTypes.forEach(type => {
      data[type] = this.getLocalQueue(type);
    });
    return data;
  }

  // Get queue from localStorage
  getLocalQueue(queueType) {
    try {
      return JSON.parse(localStorage.getItem(`${queueType}Queue`) || '[]');
    } catch (error) {
      console.error(`Error reading ${queueType} queue from localStorage:`, error);
      return [];
    }
  }

  // Save queue to localStorage
  saveLocalQueue(queueType, queue) {
    try {
      localStorage.setItem(`${queueType}Queue`, JSON.stringify(queue));
      this.fallbackData[queueType] = queue;
    } catch (error) {
      console.error(`Error saving ${queueType} queue to localStorage:`, error);
    }
  }

  // Get queue with API fallback
  async getQueue(queueType) {
    try {
      const queue = await apiService.getQueue(queueType);
      this.saveLocalQueue(queueType, queue);
      return queue;
    } catch (error) {
      console.warn(`Using local ${queueType} queue due to API error:`, error.message);
      return this.updateWaitTimes(this.getLocalQueue(queueType));
    }
  }

  // Add student to queue
  async addStudentToQueue(queueType, studentData) {
    try {
      // Check for duplicates first
      const existingQueue = await this.getQueue(queueType);
      const duplicate = this.findDuplicate(existingQueue, studentData);

      if (duplicate) {
        return {
          success: false,
          isDuplicate: true,
          existing: duplicate,
          message: `Student already in ${queueType} queue`
        };
      }

      const result = await apiService.addToQueue(queueType, studentData);

      if (result.success) {
        const queueEntry = this.createQueueEntry(studentData, queueType, result.queueNo);

        // Update local storage
        existingQueue.push(queueEntry);
        this.saveLocalQueue(queueType, existingQueue);

        return { success: true, queueEntry };
      }

      return result;
    } catch (error) {
      console.warn('API failed, using local storage:', error.message);
      return this.addStudentToQueueLocal(queueType, studentData);
    }
  }

  // Local fallback for adding student
  addStudentToQueueLocal(queueType, studentData) {
    const queue = this.getLocalQueue(queueType);
    const duplicate = this.findDuplicate(queue, studentData);

    if (duplicate) {
      return {
        success: false,
        isDuplicate: true,
        existing: duplicate,
        message: `Student already in ${queueType} queue`
      };
    }

    const queueEntry = this.createQueueEntry(studentData, queueType);
    queue.push(queueEntry);
    this.saveLocalQueue(queueType, queue);

    return { success: true, queueEntry };
  }

  // Move student between queues
  async moveStudentBetweenQueues(queueNo, fromQueue, toQueue, additionalData = {}) {
    try {
      const result = await apiService.moveInQueue(queueNo, fromQueue, toQueue, additionalData);

      if (result.success) {
        await this.moveStudentLocal(queueNo, fromQueue, toQueue, additionalData);
      }

      return result;
    } catch (error) {
      console.warn('API failed, using local move:', error.message);
      return this.moveStudentLocal(queueNo, fromQueue, toQueue, additionalData);
    }
  }

  // Local move between queues
  moveStudentLocal(queueNo, fromQueue, toQueue, additionalData = {}) {
    const sourceQueue = this.getLocalQueue(fromQueue);
    const targetQueue = this.getLocalQueue(toQueue);

    const studentIndex = sourceQueue.findIndex(entry => entry.queueNo === queueNo);

    if (studentIndex === -1) {
      return { success: false, error: 'Student not found in source queue' };
    }

    const student = sourceQueue[studentIndex];
    const updatedStudent = {
      ...student,
      stage: toQueue,
      status: this.getStatusForQueue(toQueue),
      [`movedTo${toQueue.charAt(0).toUpperCase() + toQueue.slice(1)}Time`]: new Date().toISOString(),
      ...additionalData
    };

    // Move student
    sourceQueue.splice(studentIndex, 1);
    targetQueue.push(updatedStudent);

    // Save both queues
    this.saveLocalQueue(fromQueue, sourceQueue);
    this.saveLocalQueue(toQueue, targetQueue);

    return { success: true, queueEntry: updatedStudent };
  }

  // Update queue entry status
  async updateQueueStatus(queueType, queueNo, updates) {
    try {
      const result = await apiService.updateQueueStatus(queueNo, updates);

      if (result.success) {
        this.updateLocalQueueStatus(queueType, queueNo, updates);
      }

      return result;
    } catch (error) {
      console.warn('API failed, updating locally:', error.message);
      return this.updateLocalQueueStatus(queueType, queueNo, updates);
    }
  }

  // Update local queue status
  updateLocalQueueStatus(queueType, queueNo, updates) {
    const queue = this.getLocalQueue(queueType);
    const entryIndex = queue.findIndex(entry => entry.queueNo === queueNo);

    if (entryIndex === -1) {
      return { success: false, error: 'Entry not found' };
    }

    queue[entryIndex] = { ...queue[entryIndex], ...updates };
    this.saveLocalQueue(queueType, queue);

    return { success: true, queueEntry: queue[entryIndex] };
  }

  // Get student by queue number from any queue
  async getStudentByQueueNumber(queueNo) {
    try {
      return await apiService.apiCall(`/queue/student/${queueNo}`, {
        fallbackData: this.findStudentInLocalQueues(queueNo)
      });
    } catch (error) {
      return this.findStudentInLocalQueues(queueNo);
    }
  }

  // Find student in local queues
  findStudentInLocalQueues(queueNo) {
    for (const queueType of this.queueTypes) {
      const queue = this.getLocalQueue(queueType);
      const student = queue.find(entry => entry.queueNo === queueNo);
      if (student) {
        return { ...student, currentQueue: queueType };
      }
    }
    return null;
  }

  // Clear all queues
  async clearAllQueues() {
    try {
      await apiService.apiCall('/queue/clear-all', { method: 'DELETE' });
    } catch (error) {
      console.warn('API clear failed, clearing locally:', error.message);
    } finally {
      this.queueTypes.forEach(type => {
        localStorage.removeItem(`${type}Queue`);
      });
      this.fallbackData = this.initializeFallbackData();
    }
  }

  // Get queue statistics
  async getQueueStats() {
    try {
      return await apiService.getStats('queue');
    } catch (error) {
      const stats = {};
      let total = 0;

      this.queueTypes.forEach(type => {
        const count = this.getLocalQueue(type).length;
        stats[type] = count;
        total += count;
      });

      stats.total = total;
      return stats;
    }
  }

  // Helper methods
  findDuplicate(queue, studentData) {
    return queue.find(entry =>
      entry.email === studentData.student?.email ||
      entry.nic === studentData.student?.nic ||
      entry.medicalRecordId === studentData.id
    );
  }

  createQueueEntry(studentData, queueType, providedQueueNo = null) {
    const queueNo = providedQueueNo || this.generateQueueNumber();
    const currentTime = new Date().toISOString();

    return {
      queueNo,
      studentName: studentData.student?.fullName || studentData.name || 'Unknown',
      studentId: studentData.student?.studentRegistrationNumber || studentData.studentId || '',
      email: studentData.student?.email || studentData.email || '',
      nic: studentData.student?.nic || studentData.nic || '',
      phone: studentData.student?.telephoneNumber || studentData.phone || '',
      medicalRecordId: studentData.id || '',
      medicalData: studentData,
      status: this.getStatusForQueue(queueType),
      priority: 'Normal',
      addedTime: currentTime,
      waitTime: '0 min',
      stage: queueType
    };
  }

  getStatusForQueue(queueType) {
    const statusMap = {
      reception: 'Waiting',
      doctor: 'Waiting for Doctor',
      pharmacy: 'Prescription Ready',
      completed: 'Completed'
    };
    return statusMap[queueType] || 'Unknown';
  }

  generateQueueNumber() {
    return Date.now().toString().slice(-3);
  }

  updateWaitTimes(queue) {
    const currentTime = new Date();
    return queue.map(entry => {
      const addedTime = new Date(entry.addedTime);
      const waitMinutes = Math.floor((currentTime - addedTime) / (1000 * 60));
      return {
        ...entry,
        waitTime: waitMinutes > 0 ? `${waitMinutes} min` : '0 min'
      };
    });
  }
}

// Create singleton instance
const queueService = new QueueService();

export default queueService;