import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL + 'course';

// Function to search courses by title
export const searchCourses = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/search-courses`, {
      params: { title }
    });
    return response.data;
  } catch (error) {
    console.error("Error searching courses:", error);
    throw error;
  }
};