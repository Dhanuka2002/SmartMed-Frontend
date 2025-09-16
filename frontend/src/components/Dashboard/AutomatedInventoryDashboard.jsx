import React, { useState, useEffect } from 'react';
import { 
  getInventoryStatus, 
  getActiveAlerts, 
  getInventoryAnalytics,
  getSystemHealth,
  triggerInventoryMonitoring,
  acknowledgeAlert,
  inventoryMonitor,
  formatAutomationStatus,
  getStatusColor
} from '../../services/automatedInventoryService';
import AlertMessage from '../Common/AlertMessage';
import useAlert from '../../hooks/useAlert';
import './AutomatedInventoryDashboard.css';

const AutomatedInventoryDashboard = () => {
  const { alertState, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    setupRealtimeMonitoring();
    
    return () => {
      inventoryMonitor.stopMonitoring();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusResult, alertsResult, analyticsResult, healthResult] = await Promise.all([
        getInventoryStatus(),
        getActiveAlerts(),
        getInventoryAnalytics(),
        getSystemHealth()
      ]);

      setInventoryStatus(statusResult);
      setActiveAlerts(alertsResult);
      setAnalytics(analyticsResult);
      setSystemHealth(healthResult);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeMonitoring = () => {
    // Set up real-time monitoring callbacks
    inventoryMonitor.onStatusUpdate((status) => {
      setInventoryStatus(status);
      setLastUpdated(new Date());
    });

    inventoryMonitor.onAlertUpdate((alerts) => {
      setActiveAlerts(alerts);
    });

    inventoryMonitor.onError((error) => {
      setError(error.message);
    });

    // Start monitoring
    inventoryMonitor.startMonitoring();
    setIsMonitoring(true);
  };

  const handleRefresh = async () => {
    await loadDashboardData();
  };

  const handleTriggerMonitoring = async () => {
    try {
      const result = await triggerInventoryMonitoring();
      if (result.success) {
        showSuccess('Inventory monitoring triggered successfully!', 'Monitoring Triggered');
        await loadDashboardData();
      } else {
        showError('Failed to trigger monitoring: ' + result.error, 'Monitoring Error');
      }
    } catch (error) {
      showError('Error: ' + error.message, 'System Error');
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      const result = await acknowledgeAlert(alertId, 'Pharmacist');
      if (result.success) {
        showSuccess('Alert acknowledged successfully!', 'Alert Acknowledged');
        await loadDashboardData();
      } else {
        showError('Failed to acknowledge alert: ' + result.error, 'Acknowledgment Error');
      }
    } catch (error) {
      showError('Error: ' + error.message, 'System Error');
    }
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      inventoryMonitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      inventoryMonitor.startMonitoring();
      setIsMonitoring(true);
    }
  };

  if (loading) {
    return (
      <div className="automated-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading automated inventory dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="automated-dashboard">
      <div className="dashboard-header">
        <h1>🤖 Automated Inventory Management</h1>
        <div className="header-controls">
          <div className="status-indicator">
            <span 
              className={`status-dot ${systemHealth?.overallStatus === 'healthy' ? 'healthy' : 'unhealthy'}`}
            ></span>
            <span className="status-text">
              {systemHealth?.overallStatus === 'healthy' ? 'System Healthy' : 'System Issues'}
            </span>
          </div>
          <button 
            className={`monitor-toggle ${isMonitoring ? 'active' : ''}`}
            onClick={toggleMonitoring}
          >
            {isMonitoring ? '⏸️ Pause' : '▶️ Monitor'}
          </button>
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄 Refresh
          </button>
          <button className="trigger-btn" onClick={handleTriggerMonitoring}>
            🔧 Trigger Check
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ Error: {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Inventory Status Overview */}
        <div className="status-overview-card">
          <h2>📊 Inventory Status Overview</h2>
          {inventoryStatus ? (
            <div className="status-metrics">
              <div className="metric-item">
                <span className="metric-label">Total Medicines:</span>
                <span className="metric-value">{inventoryStatus.totalMedicines || 'N/A'}</span>
              </div>
              <div className="metric-item critical">
                <span className="metric-label">Low Stock:</span>
                <span className="metric-value">{inventoryStatus.lowStockCount || 0}</span>
              </div>
              <div className="metric-item expired">
                <span className="metric-label">Expired:</span>
                <span className="metric-value">{inventoryStatus.expiredCount || 0}</span>
              </div>
              <div className="metric-item warning">
                <span className="metric-label">Near Expiry:</span>
                <span className="metric-value">{inventoryStatus.nearExpiryCount || 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Total Quantity:</span>
                <span className="metric-value">{inventoryStatus.totalQuantity || 'N/A'}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Pending Prescriptions:</span>
                <span className="metric-value">{inventoryStatus.pendingPrescriptions || 0}</span>
              </div>
            </div>
          ) : (
            <p>Loading status...</p>
          )}
          
          <div className="status-summary">
            <div 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(inventoryStatus || {}) }}
            >
              {formatAutomationStatus(inventoryStatus || {})}
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="alerts-card">
          <h2>🚨 Active Alerts</h2>
          {activeAlerts ? (
            <div className="alerts-list">
              {Object.entries(activeAlerts).filter(([key, value]) => key !== 'success' && key !== 'lastUpdated' && value > 0).length > 0 ? (
                Object.entries(activeAlerts)
                  .filter(([key, value]) => key !== 'success' && key !== 'lastUpdated' && value > 0)
                  .map(([alertType, count]) => (
                    <div key={alertType} className={`alert-item ${alertType}`}>
                      <div className="alert-info">
                        <span className="alert-type">{formatAlertType(alertType)}</span>
                        <span className="alert-count">{count}</span>
                      </div>
                      <button 
                        className="acknowledge-btn"
                        onClick={() => handleAcknowledgeAlert(`${alertType}-${Date.now()}`)}
                      >
                        ✓ Ack
                      </button>
                    </div>
                  ))
              ) : (
                <div className="no-alerts">
                  <span>✅ No active alerts</span>
                </div>
              )}
            </div>
          ) : (
            <p>Loading alerts...</p>
          )}
        </div>

        {/* Analytics & Metrics */}
        <div className="analytics-card">
          <h2>📈 Performance Analytics</h2>
          {analytics?.metrics ? (
            <div className="analytics-grid">
              <div className="analytic-item">
                <span className="analytic-label">Avg Dispense Time:</span>
                <span className="analytic-value">{analytics.metrics.averageDispenseTime}</span>
              </div>
              <div className="analytic-item">
                <span className="analytic-label">Inventory Turnover:</span>
                <span className="analytic-value">{analytics.metrics.inventoryTurnover}</span>
              </div>
              <div className="analytic-item">
                <span className="analytic-label">Stockout Rate:</span>
                <span className="analytic-value">{analytics.metrics.stockoutRate}</span>
              </div>
              <div className="analytic-item">
                <span className="analytic-label">Automation Efficiency:</span>
                <span className="analytic-value efficiency">{analytics.metrics.automationEfficiency}</span>
              </div>
            </div>
          ) : (
            <p>Loading analytics...</p>
          )}

          {analytics?.trends && (
            <div className="trends-section">
              <h3>📊 Trends</h3>
              <div className="trends-grid">
                <div className="trend-item">
                  <span>Dispensing:</span>
                  <span className={`trend-indicator ${analytics.trends.dispensingTrend}`}>
                    {getTrendIcon(analytics.trends.dispensingTrend)} {analytics.trends.dispensingTrend}
                  </span>
                </div>
                <div className="trend-item">
                  <span>Stock Level:</span>
                  <span className={`trend-indicator ${analytics.trends.stockLevelTrend}`}>
                    {getTrendIcon(analytics.trends.stockLevelTrend)} {analytics.trends.stockLevelTrend}
                  </span>
                </div>
                <div className="trend-item">
                  <span>Alerts:</span>
                  <span className={`trend-indicator ${analytics.trends.alertTrend}`}>
                    {getTrendIcon(analytics.trends.alertTrend)} {analytics.trends.alertTrend}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="health-card">
          <h2>🔧 System Health</h2>
          {systemHealth ? (
            <div className="health-status">
              <div className="health-overview">
                <span className="health-label">Overall Status:</span>
                <span className={`health-value ${systemHealth.overallStatus}`}>
                  {systemHealth.overallStatus === 'healthy' ? '✅' : '❌'} {systemHealth.overallStatus}
                </span>
              </div>
              
              <div className="health-details">
                {Object.entries(systemHealth)
                  .filter(([key]) => !['success', 'overallStatus', 'lastHealthCheck', 'error'].includes(key))
                  .map(([component, status]) => (
                    <div key={component} className="health-item">
                      <span className="component-name">{formatComponentName(component)}:</span>
                      <span className={`component-status ${status}`}>
                        {status === 'healthy' || status === 'running' || status === 'connected' ? '✅' : '❌'} {status}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : (
            <p>Loading health status...</p>
          )}
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="footer-info">
          <span>🕒 Last Updated: {lastUpdated.toLocaleTimeString()}</span>
          <span>📡 Real-time Monitoring: {isMonitoring ? '🟢 Active' : '🔴 Inactive'}</span>
          <span>🔄 Auto-refresh: Every 30 seconds</span>
        </div>
      </div>

      <AlertMessage
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        show={alertState.show}
        onClose={hideAlert}
        autoClose={alertState.autoClose}
        duration={alertState.duration}
        userName={alertState.userName}
      />
    </div>
  );
};

// Helper functions
const formatAlertType = (alertType) => {
  const types = {
    lowStock: '📉 Low Stock',
    expired: '⏰ Expired',
    nearExpiry: '⚠️ Near Expiry',
    stockShortage: '📋 Stock Shortage',
    reorderRequired: '🔄 Reorder Required'
  };
  return types[alertType] || alertType;
};

const getTrendIcon = (trend) => {
  switch (trend) {
    case 'increasing': return '📈';
    case 'decreasing': return '📉';
    case 'stable': return '➖';
    default: return '❓';
  }
};

const formatComponentName = (component) => {
  const names = {
    inventoryService: 'Inventory Service',
    notificationService: 'Notification Service',
    scheduledTasks: 'Scheduled Tasks',
    database: 'Database'
  };
  return names[component] || component;
};

export default AutomatedInventoryDashboard;