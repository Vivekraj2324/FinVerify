/**
 * server.js
 * 
 * Why this file exists:
 * It is the core bootstrapping file of our Express backend server.
 * 
 * Responsibility:
 * 1. Initialize Express application.
 * 2. Setup standard global middlewares (CORS, JSON parsers, URL encoders).
 * 3. Mount all modular API routes.
 * 4. Implement global catch-all error handling so backend processes never crash unexpectedly.
 * 5. Start listening on the port.
 * 
 * Connection to the system:
 * The startup entry point for npm start / npm run dev. Binds everything together.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS so our frontend (running on a different domain/port) can make API calls.
app.use(cors({
  origin: '*', // In production, replace with specific domain for security
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Express built-in body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve API roots
app.use('/api/transactions', transactionRoutes);

// Server health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Root fallback route
app.get('/', (req, res) => {
  res.send('Transaction Data Validator & Processor API is running...');
});

// 404 Route handler for unregistered paths
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`
  });
});

// Global central error handler middleware
// This intercepts any throws/rejects from controllers and prevents server crashes.
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR_CAUGHT:', err);

  // Check if it's a Multer specific error (file upload issues)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size limit exceeded. Max file size allowed is 5MB.'
    });
  }

  // Handle explicitly thrown filter errors from Multer
  if (err.message === 'Only CSV files are allowed!') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Generic fallback error response
  return res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Bind port and start listening
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Server is running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);
});
