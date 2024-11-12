import axios from "axios";

const BASE_URL = "http://localhost:5001/course";

const getEnrolledCourses = async (userId, includeInvisible = false) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-enrolled-courses`, {
      params: { userId, includeInvisible },  // Send both userId and status as query parameters
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default getEnrolledCourses;