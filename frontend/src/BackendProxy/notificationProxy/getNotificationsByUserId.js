import axios from 'axios';


const BASE_URL = process.env.REACT_APP_API_URL + 'notification';
async function getNotificationsByUserId(userId) {
  try {
    const response = await axios.get(`${BASE_URL}/${userId}`);
    return response.data;  
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error; 
  }
}

export default getNotificationsByUserId;