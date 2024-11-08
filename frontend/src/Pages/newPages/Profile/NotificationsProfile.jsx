import React, { useState, useEffect } from 'react';
import { MdOpenInNew, MdOutlineClose, MdDelete, MdBook } from "react-icons/md";
import OnHoverExtraHud from '../../../components/OnHoverExtraHud';
import getNotificationsByUserId from '../../../BackendProxy/notificationProxy/getNotificationsByUserId';
import deleteNotificationsById from '../../../BackendProxy/notificationProxy/deleteNotificationsById';
import markNotificationAsRead from '../../../BackendProxy/notificationProxy/markNotificationAsRead';
import { useSelector } from "react-redux";
import './NotificationBar.css';
import Pagination from './Pagination';

const NotificationsProfile = () => {
  const authUser = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const BASE_WS_URL = 'ws://localhost:5000/notification';

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
      const ws = new WebSocket(BASE_WS_URL);

      ws.onopen = () => {
        console.log("Connected to WebSocket");
      };

      ws.onmessage = (event) => {
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

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      return () => {
        ws.close();
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
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  };

  const indexOfLastNotification = currentPage * itemsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - itemsPerPage;
  const reversedNotifications = [...notifications].reverse();
  const currentNotifications = reversedNotifications.slice(indexOfFirstNotification, indexOfLastNotification);
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
              status={notification.status}
              isSelected={selectedNotifications.includes(notification._id)}
              onSelect={() => handleSelectNotification(notification._id)}
              onDelete={() => handleDelete(notification._id)}
            />
          </div>
        ))}
      </div>

      {selectedNotifications.length > 0 && (

<div className="absolute bottom-9 right-20 flex items-center justify-center">
      <button 
    onClick={handleMarkAsRead}
    className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:shadow-lg relative hover-parent"
    >
    <OnHoverExtraHud name="Read" />
    <MdBook className="text-xl" />
  </button>
  </div>)}
      {selectedNotifications.length > 0 && (
        <div className="absolute bottom-9 right-4 flex items-center justify-center">
      
          <button 
            onClick={handleDeleteSelected}
            className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:shadow-lg relative hover-parent"
          >
            <OnHoverExtraHud name="Delete" />
            <MdDelete className="text-xl" />
          </button>
        </div>
      )}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
const NotificationBar = ({ id, message, description, status, isSelected, onSelect, onDelete }) => {
  return (
    <div className="flex items-center space-x-2 py-2">
     
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="w-4 h-4"
      />

      
      <div className="flex-grow bg-white rounded-lg flex justify-between items-center px-4 py-1 shadow-md">
        <div 
          className={`h-2 w-2 rounded-full ${status === 'read' ? 'bg-green-500' : 'bg-red-500'}`}
        ></div>
        <div className="ml-4 overflow-hidden">
          <p className="font-medium">{message || 'Notification Message'}</p>
          <p className="text-sm text-stone-500">{description || 'Notification description'}</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 focus:outline-none hover-parent" onClick={onSelect}>
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
