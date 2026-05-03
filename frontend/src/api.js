// Connect Backend API
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000"
});

// Add token to every request automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token && !req.headers.Authorization) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;

// API calls
export const predictBurnout = (data) => API.post("/predict", data);
export const getTrend = () => API.get("/trend");