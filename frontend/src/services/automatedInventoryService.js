// Automated Inventory Management Service
const API_BASE_URL = 'http://localhost:8081/api/automated-inventory';

/**
 * Get real-time inventory status
 */
export const getInventoryStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Inventory status fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching inventory status:', error);
    
    // Fallback data for offline mode
    return {
      success: false,
      error: error.message,
      fallback: {
        totalMedicines: 'N/A',
        lowStockCount: 'N/A',
        expiredCount: 'N/A',
        nearExpiryCount: 'N/A',
        totalQuantity: 'N/A',
        pendingPrescriptions: 'N/A',
        lastUpdated: new Date().toISOString()
      }
    };
  }
};

/**
 * Process new prescription automatically
 */
export const processNewPrescription = async (prescriptionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/process-prescription/${prescriptionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Prescription processed automatically:', data);
    return data;
  } catch (error) {
    console.error('❌ Error processing prescription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Auto-dispense prescription
 */
export const autoDispensePrescription = async (prescriptionId, dispensedBy) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dispense-prescription/${prescriptionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dispensedBy: dispensedBy
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Prescription auto-dispensed:', data);
    return data;
  } catch (error) {
    console.error('❌ Error auto-dispensing prescription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Trigger manual inventory monitoring
 */
export const triggerInventoryMonitoring = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/monitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Inventory monitoring triggered:', data);
    return data;
  } catch (error) {
    console.error('❌ Error triggering inventory monitoring:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get active alerts
 */
export const getActiveAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Active alerts fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching active alerts:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        lowStock: 0,
        expired: 0,
        nearExpiry: 0,
        stockShortage: 0,
        reorderRequired: 0,
        lastUpdated: new Date().toISOString()
      }
    };
  }
};

/**
 * Acknowledge alert
 */
export const acknowledgeAlert = async (alertId, acknowledgedBy) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acknowledgedBy: acknowledgedBy
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Alert acknowledged:', data);
    return data;
  } catch (error) {
    console.error('❌ Error acknowledging alert:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get inventory analytics
 */
export const getInventoryAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Inventory analytics fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching inventory analytics:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        currentStatus: {},
        alerts: {},
        metrics: {
          averageDispenseTime: 'N/A',
          inventoryTurnover: 'N/A',
          stockoutRate: 'N/A',
          automationEfficiency: 'N/A'
        },
        trends: {
          dispensingTrend: 'unknown',
          stockLevelTrend: 'unknown',
          alertTrend: 'unknown'
        }
      }
    };
  }
};

/**
 * Get system health status
 */
export const getSystemHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ System health fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching system health:', error);
    return {
      success: false,
      overallStatus: 'unhealthy',
      error: error.message,
      lastHealthCheck: Date.now()
    };
  }
};

/**
 * Get automation configuration
 */
export const getAutomationConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/config`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Automation config fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching automation config:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update automation configuration
 */
export const updateAutomationConfig = async (newConfig) => {
  try {
    const response = await fetch(`${API_BASE_URL}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newConfig)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Automation config updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating automation config:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Real-time inventory monitoring (WebSocket-like polling)
 */
export class InventoryMonitor {
  constructor(updateInterval = 30000) { // 30 seconds default
    this.updateInterval = updateInterval;
    this.isMonitoring = false;
    this.intervalId = null;
    this.callbacks = {
      statusUpdate: [],
      alertUpdate: [],
      error: []
    };
  }

  /**
   * Start monitoring inventory
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('Inventory monitoring already active');
      return;
    }

    console.log('🔄 Starting automated inventory monitoring...');
    this.isMonitoring = true;

    // Initial fetch
    this.fetchUpdates();

    // Set up periodic updates
    this.intervalId = setInterval(() => {
      this.fetchUpdates();
    }, this.updateInterval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    console.log('⏹️ Stopping automated inventory monitoring...');
    this.isMonitoring = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Add callback for status updates
   */
  onStatusUpdate(callback) {
    this.callbacks.statusUpdate.push(callback);
  }

  /**
   * Add callback for alert updates
   */
  onAlertUpdate(callback) {
    this.callbacks.alertUpdate.push(callback);
  }

  /**
   * Add callback for errors
   */
  onError(callback) {
    this.callbacks.error.push(callback);
  }

  /**
   * Fetch and distribute updates
   */
  async fetchUpdates() {
    try {
      // Fetch status
      const statusPromise = getInventoryStatus();
      const alertsPromise = getActiveAlerts();

      const [status, alerts] = await Promise.all([statusPromise, alertsPromise]);

      // Notify callbacks
      this.callbacks.statusUpdate.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error('Error in status update callback:', error);
        }
      });

      this.callbacks.alertUpdate.forEach(callback => {
        try {
          callback(alerts);
        } catch (error) {
          console.error('Error in alert update callback:', error);
        }
      });

    } catch (error) {
      console.error('Error fetching inventory updates:', error);
      
      this.callbacks.error.forEach(callback => {
        try {
          callback(error);
        } catch (callbackError) {
          console.error('Error in error callback:', callbackError);
        }
      });
    }
  }

  /**
   * Update monitoring interval
   */
  updateInterval(newInterval) {
    this.updateInterval = newInterval;
    
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
}

// Create a singleton monitor instance
export const inventoryMonitor = new InventoryMonitor();

// Utility function to format automation status for display
export const formatAutomationStatus = (status) => {
  if (!status.success) {
    return 'System Offline';
  }

  const alerts = status.lowStockCount + status.expiredCount + status.nearExpiryCount;
  
  if (alerts === 0) {
    return 'All Systems Normal';
  } else if (alerts <= 5) {
    return 'Minor Issues Detected';
  } else if (alerts <= 10) {
    return 'Multiple Alerts Active';
  } else {
    return 'Critical Attention Required';
  }
};

// Utility function to get status color
export const getStatusColor = (status) => {
  if (!status.success) return '#ff4444'; // Red for offline
  
  const alerts = status.lowStockCount + status.expiredCount + status.nearExpiryCount;
  
  if (alerts === 0) return '#4CAF50'; // Green for normal
  if (alerts <= 5) return '#FF9800'; // Orange for minor issues
  if (alerts <= 10) return '#FF5722'; // Deep orange for multiple alerts
  return '#f44336'; // Red for critical
};

export default {
  getInventoryStatus,
  processNewPrescription,
  autoDispensePrescription,
  triggerInventoryMonitoring,
  getActiveAlerts,
  acknowledgeAlert,
  getInventoryAnalytics,
  getSystemHealth,
  getAutomationConfig,
  updateAutomationConfig,
  InventoryMonitor,
  inventoryMonitor,
  formatAutomationStatus,
  getStatusColor
};