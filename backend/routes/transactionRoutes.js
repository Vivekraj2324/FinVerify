/**
 * routes/transactionRoutes.js
 * 
 * Why this file exists:
 * The router maps HTTP endpoints to controller handler actions.
 * 
 * Responsibility:
 * Centralize routing definitions for transaction validation, file uploading, and downloads.
 * Keeping routing separated from the main app setup simplifies expanding the API.
 * 
 * Connection to the system:
 * Mounted in `server.js` under the prefix `/api/transactions`. Passes requests to 
 * controllers/transactionController.js.
 */

const express = require('express');
const router = express.Router();
const {
  uploadMiddleware,
  uploadTransactions,
  downloadFile
} = require('../controllers/transactionController');

// Route for uploading and processing transaction CSV files
// Multer middleware handles 'file' body parameter extraction
router.post('/upload', uploadMiddleware, uploadTransactions);

// Route for downloading processed files (cleaned CSV or chunked CSVs)
router.get('/download/:sessionId/:filename', downloadFile);

module.exports = router;
