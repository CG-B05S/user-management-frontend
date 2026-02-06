import axios from "axios";

const API = axios.create({
  baseURL: "https://user-management-backend-qu52.onrender.com/api"
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

// Handle unauthorized globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {

      // remove invalid token
      localStorage.removeItem("token");

      // redirect to login
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;

