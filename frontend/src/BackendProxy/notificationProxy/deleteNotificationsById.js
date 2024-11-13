import axios from 'axios';

const BASE_URL = 'http://localhost:5000/notification';

async function deleteNotificationsById(notificationIds) {
  try {
    const response = await axios.delete(`${BASE_URL}/delete-notification`, {
      data: { notificationIds } 
    });
    console.log(response.data.message); 
    return response.data; 
  } catch (error) {
    console.error('Error deleting notifications:', error);
    throw error; 
  }
}

export default deleteNotificationsById;
