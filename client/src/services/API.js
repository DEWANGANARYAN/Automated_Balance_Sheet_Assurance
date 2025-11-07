import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000", // Flask backend
  withCredentials: true,            // important for session cookies
});

export default API;
