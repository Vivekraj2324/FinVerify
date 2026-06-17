/**
 * controllers/transactionController.js
 * 
 * Why this file exists:
 * The controller acts as the orchestrator of HTTP requests. It handles mapping of web data
 * (like multipart forms and request parameters) to backend services.
 * 
 * Responsibility:
 * 1. Configure and export Multer middleware for safe temporary storage of uploaded CSVs.
 * 2. Coordinate file processing: upload file -> parse & validate -> generate cleaned/chunk outputs.
 * 3. Safely manage filesystem cleanup (delete uploaded temp files to prevent disk bloating).
 * 4. Map request inputs and send clean JSON payloads back, or trigger native browser file downloads.
 * 
 * Connection to the system:
 * Receives execution threads from `routes/transactionRoutes.js` and hands off business tasks
 * to `services/validationService.js` and `services/csvService.js`.
 */

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { validateCSV } = require('../services/validationService');
const { processCSVOutput, getProcessedFilePath } = require('../services/csvService');

// Configure Multer storage
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure base upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Save with a unique timestamp to prevent filename collisions in the upload folder
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to restrict uploads to CSV files only
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  // Accept standard CSV mime-types or file extensions
  if (ext === '.csv' || file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit files to 5MB
  }
});

/**
 * Handles CSV upload, runs validations, generates processed outputs, and responds.
 */
const uploadTransactions = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a CSV file'
    });
  }

  const tempFilePath = req.file.path;

  try {
    // Parse dynamic chunk size from request body, default to 1000
    let chunkLimit = parseInt(req.body.chunkLimit, 10);
    if (isNaN(chunkLimit) || chunkLimit <= 0) {
      chunkLimit = 1000;
    }

    // 1. Run validation engine
    const report = await validateCSV(tempFilePath);

    // 2. Create a unique session identifier for downloading
    const sessionId = Date.now() + '-' + Math.round(Math.random() * 1e9);

    // 3. Generate cleaned output and chunks
    const outputFiles = await processCSVOutput(report.validRows, chunkLimit, sessionId);

    // 4. Return validation results & file downloading indicators
    return res.status(200).json({
      success: true,
      message: 'File processed successfully',
      data: {
        summary: {
          totalRows: report.totalRows,
          validRows: report.validRows.length,
          invalidRows: report.invalidRowsCount,
          errorCount: report.errors.reduce((acc, curr) => acc + curr.errors.length, 0)
        },
        errors: report.errors,
        downloadInfo: {
          sessionId: sessionId,
          cleanedFile: outputFiles.cleanedFile,
          chunks: outputFiles.chunks
        }
      }
    });

  } catch (error) {
    next(error); // Delegate error handling to global Express middleware
  } finally {
    // Clean up temporary upload file asynchronously to free server memory/disk
    fs.unlink(tempFilePath, (err) => {
      if (err) console.error(`Error deleting temp upload file ${tempFilePath}:`, err);
    });
  }
};

/**
 * Triggers browser file download for a processed file.
 */
const downloadFile = (req, res) => {
  const { sessionId, filename } = req.params;

  if (!sessionId || !filename) {
    return res.status(400).json({
      success: false,
      message: 'Session ID and Filename are required'
    });
  }

  const filePath = getProcessedFilePath(sessionId, filename);

  if (!filePath) {
    return res.status(404).json({
      success: false,
      message: 'Requested file not found or expired'
    });
  }

  // Force file download and return the file directly
  return res.download(filePath, filename, (err) => {
    if (err && !res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Could not download the file'
      });
    }
  });
};

module.exports = {
  uploadMiddleware: upload.single('file'),
  uploadTransactions,
  downloadFile
};
