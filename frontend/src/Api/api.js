import axios from 'axios';

// window.__RUNTIME_CONFIG__ is injected at container start (Phase 2 Docker
// entrypoint) so one built image can point at different backends without
// a rebuild. Falls back to the build-time Vite env var for local dev.
export const API_BASE_URL =
  window.__RUNTIME_CONFIG__?.API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.defaults.headers.post['Content-Type'] = 'application/json';

export default api;
