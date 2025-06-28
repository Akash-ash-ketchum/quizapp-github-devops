import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// ✅ Fetch user profile using token
export const getUserProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Add "Bearer " before the token
      },
    });
    return response.data.user; // ✅ Return only user data
  } catch (error) {
    throw error.response.data; // ✅ Pass the error response
  }
};

// Signup API
export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login API
export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
