import React, { useState, useEffect } from 'react';
import { MdOpenInNew, MdOutlineClose, MdDelete } from "react-icons/md";
import OnHoverExtraHud from '../../../components/OnHoverExtraHud';
import getNotificationsByUserId from '../../../BackendProxy/notificationProxy/getNotificationsByUserId';
import deleteNotificationsById from '../../../BackendProxy/notificationProxy/deleteNotificationsById';
import { useSelector } from "react-redux";
import './NotificationBar.css';

const NotificationsProfile = () => {
  const authUser = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
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
          setNotifications((prevNotifications) => [data.notification, ...prevNotifications]);
        } else if (data.action === 'delete') {
          setNotifications((prevNotifications) =>
            prevNotifications.filter(notification => !data.notificationIds.includes(notification._id))
          );
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

  if (isLoading) return <div>Loading notifications...</div>;
  if (error) return <div>Error: {error}</div>;

  const indexOfLastNotification = currentPage * itemsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - itemsPerPage;
  const reversedNotifications = [...notifications].reverse();
  const currentNotifications = reversedNotifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const handleDeleteSelected = async () => {
    try {
      await deleteNotificationsById(selectedNotifications);
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => !selectedNotifications.includes(notification._id))
      );
      setSelectedNotifications([]); // Clear selected notifications after deletion
    } catch (error) {
      console.error('Failed to delete selected notifications:', error);
      alert('Failed to delete selected notifications');
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

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prevSelected => 
      prevSelected.includes(id)
        ? prevSelected.filter(notificationId => notificationId !== id)
        : [...prevSelected, id]
    );
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(prevPage => prevPage - 1);
  };

  // Toggle select all notifications on the current page
  const handleSelectAll = () => {
    const allSelected = currentNotifications.every(notification => selectedNotifications.includes(notification._id));
    if (allSelected) {
      setSelectedNotifications(prevSelected =>
        prevSelected.filter(id => !currentNotifications.map(n => n._id).includes(id))
      );
    } else {
      setSelectedNotifications(prevSelected => [
        ...prevSelected,
        ...currentNotifications.map(notification => notification._id).filter(id => !prevSelected.includes(id))
      ]);
    }
  };

  return (
    <div className="relative flex flex-col h-full min-h-[600px]">
      <div className='bg-white rounded-full flex justify-between items-center py-2 px-4'>
        <p className='font-semibold text-lg'>Notifications</p>
        <div className="flex items-center space-x-3 bg-red-400 w-[30px] h-[30px] justify-center rounded-full">
          <p className='text-lg font-semibold text-white'>{notifications.length}</p>
        </div>
      </div>

      {/* Notification List with Select All Checkbox */}
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

      {/* Trash bin icon button for multi-delete positioned at bottom right */}
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
      
      {/* Pagination Controls Fixed at the Bottom */}
      <div className="flex justify-center space-x-4 py-4">
        <button 
          onClick={handlePreviousPage} 
          disabled={currentPage === 1}
          className="text-white font-medium px-3 py-1 ml-3 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
        >
          Previous
        </button>
        
        <span className="text-lg font-semibold">{currentPage} / {totalPages}</span>
        
        <button 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages}
            className="text-white font-medium px-3 py-1 ml-3 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
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
