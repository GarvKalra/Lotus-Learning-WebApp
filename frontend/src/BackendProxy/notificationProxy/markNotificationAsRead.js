import axios from 'axios';

const BASE_URL = 'http://localhost:5000/notification';

async function markNotificationAsRead(notificationId) {
  try {
    const response = await axios.put(`${BASE_URL}/${notificationId}/read`);
    console.log(response.data.message); 
    return response.data; 
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error; 
  }
}

export default markNotificationAsRead;
