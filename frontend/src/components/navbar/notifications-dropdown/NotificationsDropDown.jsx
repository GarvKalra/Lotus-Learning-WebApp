import React from 'react';
import './NotificationDropDown.css';

const NotificationsDropDown = ({ notifications }) => {
  return (
    <div className="notifications-dropdown">
      <div className="notifications-dropdown-header">
        <p className="text-sm text-stone-500">Notifications</p>
      </div>
      <div className="notifications-list">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} className="notification-item">
              {/* Status Icon */}
              <span
                className={`status-icon ${
                  notification.status ? 'status-read' : 'status-unread'
                }`}
                title={notification.status ? 'read' : 'unread'}
              ></span>
              <div>
                <p className="font-semibold">{notification.payload.title}</p>
                <p className="text-stone-500">{notification.senderName}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsDropDown;
