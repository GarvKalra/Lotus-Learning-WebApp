import React, { useState, useEffect } from 'react'
import { FaSortAlphaDownAlt } from 'react-icons/fa'
import { IoMdSearch } from 'react-icons/io'
import { MdOpenInNew  } from "react-icons/md";
import { MdOutlineClose } from "react-icons/md";
import OnHoverExtraHud from '../../../components/OnHoverExtraHud';
import getNotificationsByUserId from '../../../BackendProxy/notificationProxy/getNotificationsByUserId'
import { useAuth } from '../../../context/AuthContext'

const NotificationsProfile = () => {
   // Initialize state variables
   const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (userId) {
          // Get the notifications from backend
          const userNotifications = await getNotificationsByUserId(userId);
          setNotifications(userNotifications);
        }
      } catch (error) {
        // Handle any errors that happen during fetch
        console.error('Failed to fetch notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  if (isLoading) return <div>Loading notifications...</div>;

  // Show error if there's an error
  if (error) return <div>Error: {error}</div>;

  return (
    <>
        <div className='bg-white rounded-full flex justify-between items-center py-2 px-4'>
            <p className='font-semibold text-lg'>Notifications</p>
            <div className="flex items-center space-x-3 bg-red-400 w-[30px] h-[30px] justify-center rounded-full">
                <p className='text-lg font-semibold text-white'>{notifications.length}</p>
            </div>
        </div>
        {/* List of notification items */}
        <div className='flex flex-col items-center justify-center w-full mt-3 space-y-2'>
            {/* Render a NotificationBar component for each notification */}
            {notifications.map((notification, index) => (
                <NotificationBar 
                    key={notification.id || index}
                    message={notification.message}
                    description={notification.description}
                />
            ))}
        </div>
    </>
  )
}

// The component for individual notification items
const NotificationBar = ({ message, description }) => {
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
                <div className='cursor-pointer hover-parent'>
                    <OnHoverExtraHud name="Delete"/>
                    <MdOutlineClose/>
                </div>
            </div>
        </div>
    )
}

export default NotificationsProfile