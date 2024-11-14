import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL + 'notification';

async function saveNotification(notificationData) {
  try {
    const response = await axios.post(`${BASE_URL}/save-notification`, notificationData);
    console.log(response.data.message);  // Success message from the backend
    return response.data; // Return response.data correctly
  } catch (error) {
    console.error('Error saving notification:', error);
    throw error; // Throw error to be handled by the caller
  }
}

export default saveNotification;