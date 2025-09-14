// Centralized Error Handling Service
class ErrorHandler {
  constructor() {
    this.errorCodes = {
      // Authentication errors
      AUTH_001: 'Invalid credentials provided',
      AUTH_002: 'Session has expired',
      AUTH_003: 'Access denied - insufficient permissions',
      AUTH_004: 'Account not approved',

      // API errors
      API_001: 'Network connection failed',
      API_002: 'Server is temporarily unavailable',
      API_003: 'Invalid request format',
      API_004: 'Resource not found',

      // Queue errors
      QUEUE_001: 'Student already in queue',
      QUEUE_002: 'Queue operation failed',
      QUEUE_003: 'Invalid queue transition',

      // Medical record errors
      MED_001: 'Medical record not found',
      MED_002: 'Invalid medical data format',
      MED_003: 'QR code generation failed',

      // Prescription errors
      PRESC_001: 'Invalid prescription data',
      PRESC_002: 'Prescription submission failed',
      PRESC_003: 'Digital signature required',

      // General errors
      GEN_001: 'Unknown error occurred',
      GEN_002: 'Operation timeout',
      GEN_003: 'Data validation failed'
    };

    this.setupGlobalErrorHandlers();
  }

  // Setup global error handlers
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.logError('UNHANDLED_PROMISE', event.reason);
      event.preventDefault();
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global JavaScript error:', event.error);
      this.logError('JAVASCRIPT_ERROR', event.error);
    });
  }

  // Handle API errors with fallback
  handleApiError(error, context = 'API_CALL', fallbackAction = null) {
    const errorInfo = this.classifyError(error);

    console.error(`${context} Error:`, errorInfo);

    // Log error for monitoring
    this.logError(context, error);

    // Execute fallback if provided
    if (fallbackAction && typeof fallbackAction === 'function') {
      try {
        return fallbackAction(errorInfo);
      } catch (fallbackError) {
        console.error('Fallback action failed:', fallbackError);
      }
    }

    return {
      success: false,
      error: errorInfo,
      message: this.getUserFriendlyMessage(errorInfo.code),
      fallbackUsed: !!fallbackAction
    };
  }

  // Classify error type and severity
  classifyError(error) {
    if (!error) {
      return { code: 'GEN_001', severity: 'low', message: 'Unknown error' };
    }

    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { code: 'API_001', severity: 'medium', message: error.message };
    }

    // HTTP errors
    if (error.message && error.message.includes('HTTP')) {
      const status = this.extractHttpStatus(error.message);
      return {
        code: this.getHttpErrorCode(status),
        severity: status >= 500 ? 'high' : 'medium',
        message: error.message,
        httpStatus: status
      };
    }

    // Authentication errors
    if (error.message && (
      error.message.includes('unauthorized') ||
      error.message.includes('forbidden') ||
      error.message.includes('authentication')
    )) {
      return { code: 'AUTH_003', severity: 'high', message: error.message };
    }

    // Validation errors
    if (error.message && error.message.includes('validation')) {
      return { code: 'GEN_003', severity: 'low', message: error.message };
    }

    // Default classification
    return {
      code: 'GEN_001',
      severity: 'medium',
      message: error.message || 'Unknown error occurred',
      originalError: error
    };
  }

  // Extract HTTP status from error message
  extractHttpStatus(message) {
    const match = message.match(/HTTP (\d{3})/);
    return match ? parseInt(match[1]) : 500;
  }

  // Get error code based on HTTP status
  getHttpErrorCode(status) {
    if (status >= 500) return 'API_002';
    if (status === 404) return 'API_004';
    if (status === 401 || status === 403) return 'AUTH_003';
    if (status >= 400) return 'API_003';
    return 'API_001';
  }

  // Get user-friendly error message
  getUserFriendlyMessage(errorCode) {
    return this.errorCodes[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  // Log error for monitoring
  logError(context, error) {
    const errorLog = {
      context,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    // Store in localStorage for debugging (limit to last 50 errors)
    this.storeErrorLog(errorLog);

    // In production, you would send this to your monitoring service
    // this.sendToMonitoring(errorLog);
  }

  // Store error in localStorage for debugging
  storeErrorLog(errorLog) {
    try {
      const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      logs.unshift(errorLog);

      // Keep only last 50 errors
      if (logs.length > 50) {
        logs.splice(50);
      }

      localStorage.setItem('errorLogs', JSON.stringify(logs));
    } catch (storageError) {
      console.warn('Failed to store error log:', storageError);
    }
  }

  // Get current user ID for error tracking
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user.userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  // Create user notification for error
  createErrorNotification(error, showToUser = true) {
    const errorInfo = this.classifyError(error);

    const notification = {
      type: 'error',
      title: 'Error',
      message: this.getUserFriendlyMessage(errorInfo.code),
      severity: errorInfo.severity,
      timestamp: new Date().toISOString(),
      dismissible: true,
      autoClose: errorInfo.severity === 'low' ? 5000 : false
    };

    if (showToUser) {
      this.displayErrorNotification(notification);
    }

    return notification;
  }

  // Display error notification (can be customized based on UI framework)
  displayErrorNotification(notification) {
    // This would integrate with your notification system
    console.warn('Error Notification:', notification);

    // Custom event for components to listen to
    window.dispatchEvent(new CustomEvent('errorNotification', {
      detail: notification
    }));
  }

  // Retry mechanism for failed operations
  async retry(operation, maxAttempts = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          break;
        }

        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await this.sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }

    throw new Error(`Operation failed after ${maxAttempts} attempts: ${lastError.message}`);
  }

  // Helper method for delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get error logs for debugging
  getErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    } catch {
      return [];
    }
  }

  // Clear error logs
  clearErrorLogs() {
    localStorage.removeItem('errorLogs');
  }

  // Check if error should trigger fallback
  shouldUseFallback(error) {
    const errorInfo = this.classifyError(error);
    return ['API_001', 'API_002', 'API_004'].includes(errorInfo.code);
  }

  // Handle specific error types
  handleAuthError(error) {
    const errorInfo = this.classifyError(error);

    if (errorInfo.code === 'AUTH_002') {
      // Session expired - redirect to login
      this.clearUserSession();
      window.location.href = '/login';
    }

    return this.createErrorNotification(error);
  }

  handleNetworkError(error) {
    return this.createErrorNotification(error, false); // Don't show to user immediately
  }

  // Clear user session on auth errors
  clearUserSession() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentEmail');
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;