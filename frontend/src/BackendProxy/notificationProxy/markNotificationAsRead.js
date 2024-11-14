import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL + 'notification';

async function markNotificationAsRead(notificationIds) {
  try {
    // Ensure notificationIds is an array, so we can support both single and multiple notifications
    const idsArray = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    const response = await axios.put(`${BASE_URL}/mark-as-read`, {
      notificationIds: idsArray
    });
    console.log(response.data.message); 
    return response.data; 
  } catch (error) {
    console.error('Error marking notification(s) as read:', error);
    throw error; 
  }
}

export default markNotificationAsRead;
