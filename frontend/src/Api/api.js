
import axios from 'axios';
const DEPLOYED='https://e-commerce-server-production-0873.up.railway.app'
const LOCALHOST='http://localhost:5454'

export const API_BASE_URL = LOCALHOST

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.defaults.headers.post['Content-Type'] = 'application/json';

export default api;
