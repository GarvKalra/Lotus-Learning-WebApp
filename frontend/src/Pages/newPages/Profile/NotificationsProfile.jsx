import React, { useState, useEffect } from 'react'
import { FaSortAlphaDownAlt } from 'react-icons/fa'
import { IoMdSearch } from 'react-icons/io'
import { MdOpenInNew  } from "react-icons/md";
import { MdOutlineClose } from "react-icons/md";
import OnHoverExtraHud from '../../../components/OnHoverExtraHud';
import getNotificationsByUserId from '../../../BackendProxy/notificationProxy/getNotificationsByUserId'
import { useAuth } from "../../../context/auth-context";
import { useSelector } from "react-redux";
import deleteNotificationsById from '../../../BackendProxy/notificationProxy/deleteNotificationsById'

const NotificationsProfile = () => {
  const authUser = useSelector((state) => state.user);
   const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = authUser._id;

  useEffect(() => {
    console.log(userId);
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
  }, [userId]);

  if (isLoading) return <div>Loading notifications...</div>;

  if (error) return <div>Error: {error}</div>;

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

  return (
    <>
        <div className='bg-white rounded-full flex justify-between items-center py-2 px-4'>
            <p className='font-semibold text-lg'>Notifications</p>
            <div className="flex items-center space-x-3 bg-red-400 w-[30px] h-[30px] justify-center rounded-full">
                <p className='text-lg font-semibold text-white'>{notifications.length}</p>
            </div>
        </div>
        {}
        <div className='flex flex-col items-center justify-center w-full mt-3 space-y-2'>
            {}
            {notifications.map((notification, index) => (
                <NotificationBar 
                    key={notification.id || index}
                    message={notification.payload.title}
                    description={"Sender:" + notification.senderName}
                    onDelete={() => handleDelete(notification._id)}
                />
            ))}
        </div>
    </>
  )
}


const NotificationBar = ({ message, description, onDelete }) => {
    return (
        <div className='bg-white rounded-full flex justify-between items-center py-2 px-4 w-full relative'>
            <div className='absolute top-1 left-[1%] h-[10px] w-[10px] bg-red-400 rounded-full'></div>
            <div>
                <p className='font-medium'>{message || 'Notification Message'}</p>
                <p className='text-sm '>{description || 'Notification description'}</p>
            </div>
            <div className='flex space-x-2'>
                <div className='cursor-pointer hover-parent'>
                    <OnHoverExtraHud name="Go"/>
                    <MdOpenInNew/>
                </div>
                <div className='cursor-pointer hover-parent' onClick={onDelete}>
          <OnHoverExtraHud name="Delete"/>
          <MdOutlineClose/>
        </div>
            </div>
        </div>
    )
}

export default NotificationsProfile