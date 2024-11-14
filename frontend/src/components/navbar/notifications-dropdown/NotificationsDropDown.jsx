import React from 'react';
import './NotificationDropDown.css';
import { useNavigate } from 'react-router-dom';

const NotificationsDropDown = ({ notifications }) => {
  const navigate = useNavigate();

  const handleNavigateToMessage = (notification) => {
    navigate('/messages', {
      state: {
        notificationData: {
          notificationId: notification._id,
          date:formatDate(notification.createdAt),
          payload: {
            title: notification.payload.title,
            message: notification.payload.message,
          },
          senderName: notification.senderName,
        },
      },
    });
  };

  const unreadNotifications = notifications.filter((notification) => notification.status === 'unread'); 


  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',    
      month: 'short',     
      day: 'numeric',     
      hour: 'numeric',     
      minute: 'numeric',   
      hour12: true        
    });
  };

  return (
    <div className="notifications-dropdown">
      <div className="notifications-dropdown-header">
        <p className="text-sm text-stone-500">Notifications</p>
      </div>
      <div className="notifications-list">
        {unreadNotifications && unreadNotifications.length > 0 ? (
          unreadNotifications.map((notification) => (
            <div
              key={notification._id}
              className="notification-item cursor-pointer"
              onClick={() => handleNavigateToMessage(notification)}
            >
              <span
                className="status-icon status-unread"
                title="unread"
              ></span>
              <div>
                <p className="font-semibold">{notification.payload.title}</p>
                <p className="text-stone-500">{notification.senderName}</p>
                <p className="text-stone-500">{formatDate(notification.createdAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <p>No unread notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsDropDown;
