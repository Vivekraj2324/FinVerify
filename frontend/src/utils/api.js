/**
 * utils/api.js
 * 
 * Why this file exists:
 * Centralizes backend API connection settings.
 * 
 * Responsibility:
 * Instantiates and exports a pre-configured Axios client. It sets a timeout limit of 60 
 * seconds to accommodate processing of large CSV file parsing without premature cut-offs.
 * 
 * Connection to the system:
 * Imported by components that need to make HTTP calls to the backend (like uploading files).
 */

import axios from 'axios';

// Instantiate Axios with default parameters
// The baseUrl uses standard env configurations, falling back to '/api' which uses our Vite proxy.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000 // 60 seconds timeout limit for large file parsing
});

export default api;
