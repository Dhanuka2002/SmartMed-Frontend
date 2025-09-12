import React, { useState } from 'react';
import './ReceptionistNotifications.css';

function ReceptionistNotifications() {
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      time: '10:40 AM', 
      message: 'Queue 014 called.', 
      isNew: true,
      type: 'queue',
      priority: 'normal'
    },
    { 
      id: 2, 
      time: '10:35 AM', 
      message: 'Emergency Request dispatched.', 
      isNew: true,
      type: 'emergency',
      priority: 'high'
    },
    { 
      id: 3, 
      time: '10:25 AM', 
      message: 'Queue 013 called.', 
      isNew: false,
      type: 'queue',
      priority: 'normal'
    },
    { 
      id: 4, 
      time: '10:10 AM', 
      message: 'Queue 012 called.', 
      isNew: false,
      type: 'queue',
      priority: 'normal'
    },
    { 
      id: 5, 
      time: '09:55 AM', 
      message: 'System maintenance completed.', 
      isNew: false,
      type: 'system',
      priority: 'low'
    },
  ]);

  const [filter, setFilter] = useState('all');

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isNew: false }));
    setNotifications(updated);
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isNew: false } : n
    );
    setNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.isNew;
    if (filter === 'read') return !n.isNew;
    return true;
  });

  const newCount = notifications.filter(n => n.isNew).length;

  const getNotificationIcon = (type, priority) => {
    if (type === 'emergency') return '🚨';
    if (type === 'system') return '⚙️';
    if (type === 'queue') return '👥';
    return '📢';
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  return (
    <div className="receptionist-notifications">
      <div className="notifications-header">
        <div className="header-title">
          <h2>System Notifications</h2>
          <div className="notification-counter">
            {newCount > 0 && <span className="new-badge">{newCount} new</span>}
          </div>
        </div>
        
        <div className="header-actions">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({newCount})
            </button>
            <button 
              className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - newCount})
            </button>
          </div>
          
          <div className="action-buttons">
            {newCount > 0 && (
              <button className="btn btn-secondary" onClick={markAllAsRead}>
                Mark All Read
              </button>
            )}
            <button className="btn btn-danger" onClick={clearAll}>
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No notifications</h3>
            <p>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : filter === 'read'
                ? "No read notifications to display."
                : "No notifications available."}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.isNew ? 'unread' : 'read'} ${getPriorityClass(notification.priority)}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-meta">
                    <span className="notification-time">{notification.time}</span>
                    <span className={`notification-type type-${notification.type}`}>
                      {notification.type}
                    </span>
                  </div>
                </div>
                
                <div className="notification-status">
                  {notification.isNew && <div className="unread-indicator"></div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReceptionistNotifications;