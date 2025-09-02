// Automated Inventory Reporting Service
const API_BASE_URL = 'http://localhost:8081/api/inventory-reports';

/**
 * Get comprehensive dashboard summary report
 */
export const getDashboardSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard-summary`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Dashboard summary report fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching dashboard summary:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        inventoryStatus: {},
        recentActivity: [],
        statusSummary: [],
        alertsSummary: [],
        reorderStatus: []
      }
    };
  }
};

/**
 * Get low stock medicines report
 */
export const getLowStockReport = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/low-stock`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Low stock report fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching low stock report:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        lowStockItems: [],
        totalLowStockCount: 0
      }
    };
  }
};

/**
 * Get expiry report (expired and near-expiry medicines)
 */
export const getExpiryReport = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/expiry-report`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Expiry report fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching expiry report:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        expiredItems: [],
        nearExpiryItems: [],
        expiredCount: 0,
        nearExpiryCount: 0
      }
    };
  }
};

/**
 * Get inventory activity report
 */
export const getActivityReport = async (days = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activity-report?days=${days}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Activity report fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching activity report:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        activityData: [],
        activitySummary: {},
        totalTransactions: 0,
        reportPeriodDays: days
      }
    };
  }
};

/**
 * Get alerts report and history
 */
export const getAlertsReport = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts-report`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Alerts report fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching alerts report:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        alertsSummary: [],
        alertsBySeverity: {},
        alertsByType: {},
        totalActiveAlerts: 0
      }
    };
  }
};

/**
 * Get automated reorder recommendations report
 */
export const getReorderReport = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reorder-report`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Reorder report fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching reorder report:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        reorderData: [],
        reordersByStatus: {},
        totalPendingReorders: 0,
        estimatedReorderValue: 0
      }
    };
  }
};

/**
 * Get system performance analytics
 */
export const getPerformanceAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/performance-analytics`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Performance analytics fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching performance analytics:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        totalTransactions: 0,
        dispensingTransactions: 0,
        stockAdditions: 0,
        totalActiveAlerts: 0,
        automationEfficiency: 'N/A',
        averageProcessingTime: 'N/A',
        systemUptime: 'N/A'
      }
    };
  }
};

/**
 * Generate and download CSV report
 */
export const downloadCsvReport = async (reportType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/export-csv?reportType=${reportType}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvData = await response.text();
    
    // Create and trigger download
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ CSV report downloaded:', reportType);
    return { success: true, message: 'Report downloaded successfully' };
    
  } catch (error) {
    console.error('❌ Error downloading CSV report:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate system health report
 */
export const generateHealthReport = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-health-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Health report generated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error generating health report:', error);
    return {
      success: false,
      error: error.message,
      overallStatus: 'unhealthy'
    };
  }
};

/**
 * Real-time report data fetcher with caching
 */
export class ReportDataFetcher {
  constructor(updateInterval = 300000) { // 5 minutes default
    this.updateInterval = updateInterval;
    this.isActive = false;
    this.intervalId = null;
    this.cache = new Map();
    this.callbacks = {
      dashboardUpdate: [],
      reportUpdate: [],
      error: []
    };
  }

  /**
   * Start automatic report data fetching
   */
  startAutoFetch() {
    if (this.isActive) {
      console.log('Report data fetching already active');
      return;
    }

    console.log('🔄 Starting automated report data fetching...');
    this.isActive = true;

    // Initial fetch
    this.fetchAllReports();

    // Set up periodic updates
    this.intervalId = setInterval(() => {
      this.fetchAllReports();
    }, this.updateInterval);
  }

  /**
   * Stop automatic fetching
   */
  stopAutoFetch() {
    if (!this.isActive) {
      return;
    }

    console.log('⏹️ Stopping automated report data fetching...');
    this.isActive = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Fetch all reports and update cache
   */
  async fetchAllReports() {
    try {
      const reports = await Promise.allSettled([
        getDashboardSummary(),
        getLowStockReport(),
        getExpiryReport(),
        getActivityReport(7), // Last 7 days
        getAlertsReport(),
        getReorderReport(),
        getPerformanceAnalytics()
      ]);

      const reportData = {
        dashboardSummary: reports[0].status === 'fulfilled' ? reports[0].value : null,
        lowStockReport: reports[1].status === 'fulfilled' ? reports[1].value : null,
        expiryReport: reports[2].status === 'fulfilled' ? reports[2].value : null,
        activityReport: reports[3].status === 'fulfilled' ? reports[3].value : null,
        alertsReport: reports[4].status === 'fulfilled' ? reports[4].value : null,
        reorderReport: reports[5].status === 'fulfilled' ? reports[5].value : null,
        performanceAnalytics: reports[6].status === 'fulfilled' ? reports[6].value : null,
        lastUpdated: new Date()
      };

      // Update cache
      this.cache.set('allReports', reportData);

      // Notify callbacks
      this.callbacks.reportUpdate.forEach(callback => {
        try {
          callback(reportData);
        } catch (error) {
          console.error('Error in report update callback:', error);
        }
      });

      // Notify dashboard specific callbacks
      if (reportData.dashboardSummary) {
        this.callbacks.dashboardUpdate.forEach(callback => {
          try {
            callback(reportData.dashboardSummary);
          } catch (error) {
            console.error('Error in dashboard update callback:', error);
          }
        });
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
      
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
   * Add callback for dashboard updates
   */
  onDashboardUpdate(callback) {
    this.callbacks.dashboardUpdate.push(callback);
  }

  /**
   * Add callback for report updates
   */
  onReportUpdate(callback) {
    this.callbacks.reportUpdate.push(callback);
  }

  /**
   * Add callback for errors
   */
  onError(callback) {
    this.callbacks.error.push(callback);
  }

  /**
   * Get cached report data
   */
  getCachedReports() {
    return this.cache.get('allReports') || null;
  }

  /**
   * Force refresh all reports
   */
  async refreshReports() {
    await this.fetchAllReports();
    return this.getCachedReports();
  }
}

// Create a singleton report fetcher instance
export const reportDataFetcher = new ReportDataFetcher();

// Utility functions for report formatting
export const formatReportDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${parseFloat(value).toFixed(1)}%`;
};

export const getSeverityColor = (severity) => {
  const colors = {
    'CRITICAL': '#f44336',
    'HIGH': '#ff5722',
    'MEDIUM': '#ff9800',
    'LOW': '#ffc107'
  };
  return colors[severity] || '#6c757d';
};

export const getStockStatusColor = (status) => {
  const colors = {
    'OUT_OF_STOCK': '#f44336',
    'LOW_STOCK': '#ff5722',
    'NORMAL': '#4caf50',
    'OVERSTOCK': '#2196f3'
  };
  return colors[status] || '#6c757d';
};

export const getExpiryStatusColor = (status) => {
  const colors = {
    'EXPIRED': '#f44336',
    'NEAR_EXPIRY': '#ff9800',
    'VALID': '#4caf50'
  };
  return colors[status] || '#6c757d';
};

export default {
  getDashboardSummary,
  getLowStockReport,
  getExpiryReport,
  getActivityReport,
  getAlertsReport,
  getReorderReport,
  getPerformanceAnalytics,
  downloadCsvReport,
  generateHealthReport,
  ReportDataFetcher,
  reportDataFetcher,
  formatReportDate,
  formatCurrency,
  formatPercentage,
  getSeverityColor,
  getStockStatusColor,
  getExpiryStatusColor
};