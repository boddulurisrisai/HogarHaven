import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reviews';

export const generateReview = async (data) => {
  const response = await axios.post(`${API_URL}/generate`, data);
  return response.data;
};

export const searchReviews = async (query) => {
  const response = await axios.post(`${API_URL}/search`, { query });
  return response.data;
};
