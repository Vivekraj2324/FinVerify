/**
 * vite.config.js
 * 
 * Why this file exists:
 * It is the configuration file for the Vite build tool.
 * 
 * Responsibility:
 * 1. Inject React compilation support plugins.
 * 2. Configure a local development server proxy. All calls to `/api` are automatically 
 *    redirected to the Node server on `http://localhost:5000`.
 * 
 * Connection to the system:
 * Binds frontend requests to the backend. Eliminates the need to hardcode the backend 
 * domain inside frontend source files, resolving CORS and port routing cleanly.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Run frontend dev server on port 3000
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
