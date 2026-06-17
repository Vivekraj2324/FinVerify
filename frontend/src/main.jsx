/**
 * main.jsx
 * 
 * Why this file exists:
 * The entry point for the React application bundle.
 * 
 * Responsibility:
 * Imports React, React DOM, the root application component, and styling sheets.
 * Mounts the virtual DOM of <App /> to the physical <div id="root"> element in index.html.
 * 
 * Connection to the system:
 * Bootstraps the client interface. Read directly by Vite during compilation.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
