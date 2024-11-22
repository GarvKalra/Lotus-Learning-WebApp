import React, { useState, useEffect, useRef } from 'react';
import { MdOpenInNew, MdOutlineClose, MdDelete, MdBook } from "react-icons/md";
import OnHoverExtraHud from '../../../components/OnHoverExtraHud';
import getNotificationsByUserId from '../../../BackendProxy/notificationProxy/getNotificationsByUserId';
import deleteNotificationsById from '../../../BackendProxy/notificationProxy/deleteNotificationsById';
import markNotificationAsRead from '../../../BackendProxy/notificationProxy/markNotificationAsRead';
import { useSelector } from "react-redux";
import './NotificationBar.css';
import Pagination from './Pagination';
import { useNavigate } from 'react-router-dom';

const NotificationsProfile = () => {
  const authUser = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const BASE_WS_URL = process.env.REACT_APP_WEBSOCKET_URL;
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (authUser._id) {
          const userNotifications = await getNotificationsByUserId(authUser._id);
          setNotifications(userNotifications);
          updateUnreadCount(userNotifications);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [authUser._id]);

  useEffect(() => {
    if (authUser && authUser._id) {
      const connectWebSocket = () => {
        wsRef.current = new WebSocket(BASE_WS_URL);

        wsRef.current.onopen = () => {
          console.log("Connected to WebSocket");
          reconnectAttempts.current = 0; // Reset reconnect attempts
        };

        wsRef.current.onmessage = (event) => {
          console.log("Received WebSocket message:", event.data);
          const data = JSON.parse(event.data);

          if (data.action === 'new' && data.notification.userId === authUser._id) {
            setNotifications((prevNotifications) => {
              const updatedNotifications = [data.notification, ...prevNotifications];
              updateUnreadCount(updatedNotifications);
              return updatedNotifications;
            });
          } else if (data.action === 'delete') {
            setNotifications((prevNotifications) => {
              const updatedNotifications = prevNotifications.filter(notification => !data.notificationIds.includes(notification._id));
              updateUnreadCount(updatedNotifications);
              return updatedNotifications;
            });
          } else if (data.action === 'update') {
            setNotifications((prevNotifications) => {
              const updatedNotifications = prevNotifications.map(notification =>
                data.notificationIds.includes(notification._id)
                  ? { ...notification, status: 'read' }
                  : notification
              );
              updateUnreadCount(updatedNotifications);
              return updatedNotifications;
            });
          }
        };

        wsRef.current.onclose = (event) => {
          console.log("WebSocket connection closed", event);
          if (!event.wasClean) {
            attemptReconnect();
          }
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          wsRef.current.close();
        };
      };

      const attemptReconnect = () => {
        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current += 1;
          const timeout = Math.min(1000 * 2 ** reconnectAttempts.current, 30000); // max 30s
          console.log(`Reconnecting in ${timeout / 1000}s...`);
          setTimeout(() => connectWebSocket(), timeout);
        } else {
          console.error("Max reconnect attempts reached. WebSocket will not reconnect.");
        }
      };

      connectWebSocket();

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [authUser]);
  

  const updateUnreadCount = (notifications) => {
    const unread = notifications.filter(notification => notification.status === 'unread').length;
    setUnreadCount(unread);
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteNotificationsById(selectedNotifications);
      setNotifications((prevNotifications) => {
        const updatedNotifications = prevNotifications.filter(notification => !selectedNotifications.includes(notification._id));
        updateUnreadCount(updatedNotifications);
        adjustPageOnDeletion(updatedNotifications);
        return updatedNotifications;
      });
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to delete selected notifications:', error);
      alert('Failed to delete selected notifications');
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markNotificationAsRead(selectedNotifications);
      setNotifications((prevNotifications) => {
        const updatedNotifications = prevNotifications.map(notification =>
          selectedNotifications.includes(notification._id)
            ? { ...notification, status: 'read' }
            : notification
        );
        updateUnreadCount(updatedNotifications);
        return updatedNotifications;
      });
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      alert('Failed to mark notifications as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotificationsById(notificationId);
  
      // Filter out the deleted notification and update notifications state
      setNotifications(prevNotifications => {
        const updatedNotifications = prevNotifications.filter(
          notification => notification._id !== notificationId
        );
  
        // Adjust the current page if the last item on the page was deleted
        adjustPageOnDeletion(updatedNotifications);
  
        return updatedNotifications;
      });
  
      // Remove the notification from selectedNotifications if it exists
      setSelectedNotifications(prevSelected => 
        prevSelected.filter(id => id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  };

  const adjustPageOnDeletion = (updatedNotifications) => {
    const totalItems = updatedNotifications.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
  
    // Check if the current page is now out of range
    if (currentPage > totalPages && currentPage > 1) {
      setCurrentPage(currentPage - 1); // Move one page back
    }
  };
  const indexOfLastNotification = currentPage * itemsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - itemsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSelectNotification = (id) => {
    setSelectedNotifications((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter(notificationId => notificationId !== id)
        : [...prevSelected, id]
    );
  };


  const handleSelectAll = () => {
    const allSelected = currentNotifications.every(notification => selectedNotifications.includes(notification._id));
    setSelectedNotifications(allSelected ? [] : currentNotifications.map(notification => notification._id));
  };

  return (
    <div className="relative flex flex-col h-full min-h-[600px]">
      <div className="bg-white rounded-full flex justify-between items-center py-2 px-4">
        <p className="font-semibold text-lg">Notifications</p>
        <div className="flex items-center space-x-3 bg-red-400 w-[30px] h-[30px] justify-center rounded-full">
          <p className="text-lg font-semibold text-white">{unreadCount}</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto mt-3 px-4">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox"
            checked={currentNotifications.length > 0 && currentNotifications.every(notification => selectedNotifications.includes(notification._id))}
            onChange={handleSelectAll}
            className="w-4 h-4"
          />
          <span className="text-sm">Select All</span>
        </div>

        {currentNotifications.map((notification) => (
          <div key={notification._id}>
            <NotificationBar 
              id={notification._id}
              message={notification.payload.title}
              description={"Sender:" + notification.senderName}
              date = {notification.createdAt} 
              status={notification.status}
              isSelected={selectedNotifications.includes(notification._id)}
              onSelect={() => handleSelectNotification(notification._id)}
              onDelete={() => handleDelete(notification._id)}
              notification={notification}
            />
          </div>
        ))}
      </div>

      {selectedNotifications.length > 0 && (
  <div className="absolute bottom-6  flex space-x-2 z-10"> {/* Wrap in flex container */}
    <button 
      onClick={handleMarkAsRead}
      className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:shadow-lg relative hover-parent"
    >
      <OnHoverExtraHud name="Read" />
      <MdBook className="text-xl" />
    </button>
    <button 
      onClick={handleDeleteSelected}
      className="w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:shadow-lg relative hover-parent"
    >
      <OnHoverExtraHud name="Delete" />
      <MdDelete className="text-xl" />
    </button>
  </div>
)}
          <div>
         <Pagination
         totalPages={totalPages}
         currentPage={currentPage}
         onPageChange={handlePageChange}
       />
       </div>
 
    </div>

  );
};



const NotificationBar = ({ id, message, description, date, status, isSelected, onSelect, onDelete, notification }) => {
  const navigate = useNavigate();

  const handleNavigateToMessage = async () => {
    await markNotificationAsRead(notification._id);
    navigate('/messages', {
      state: {
        notificationData: {
          notificationId: notification._id,
          date: date,
          payload: {
            title: message,
            message: notification.payload.message
          },
          senderName: description.replace('Sender:', '')
        }
      }
    });
  };

  if (date) {
    date = new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }

  return (
    <div className="flex items-center space-x-2 py-1">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="w-4 h-4"
      />
      <div className={`flex-grow rounded-lg flex justify-between items-center px-4 shadow-md h-[60px] ${isSelected ? 'highlight' : 'default-bg'}`}>
        <div className={`h-2 w-2 rounded-full ${status === 'read' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        
        <div className="ml-4 flex-grow overflow-hidden">
          <p className="font-medium">{message || 'Notification Message'}</p>
          <p className="text-sm text-stone-500">{description || 'Notification description'}</p>
          <p className="text-sm text-stone-500">{date || 'Notification date'}</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 focus:outline-none hover-parent" 
            onClick={handleNavigateToMessage}
          >
            <MdOpenInNew />
            <OnHoverExtraHud name="Go" />
          </button>
          <button className="p-2 rounded-full bg-red-100 hover:bg-red-200 focus:outline-none hover-parent" onClick={onDelete}>
            <MdOutlineClose />
            <OnHoverExtraHud name="Delete" />
          </button>
        </div>
      </div>
    </div>
  );
};



export default NotificationsProfile;
