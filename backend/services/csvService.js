/**
 * services/csvService.js
 * 
 * Why this file exists:
 * It handles the creation of processed output files (cleaned CSV and chunked files) on the disk.
 * 
 * Responsibility:
 * 1. Convert JavaScript arrays of objects back to CSV format using `json2csv`.
 * 2. Manage filesystem directories inside the `processed` folder.
 * 3. Handle chunking logic: split valid rows into smaller files if the count exceeds a configurable row limit.
 * 
 * Connection to the system:
 * Called by `controllers/transactionController.js` after CSV validation is complete.
 * Provides the generated file names/paths which are returned to the frontend.
 */

const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const PROCESSED_DIR = path.join(__dirname, '../processed');

// Ensure base processed directory exists
if (!fs.existsSync(PROCESSED_DIR)) {
  fs.mkdirSync(PROCESSED_DIR, { recursive: true });
}

/**
 * Generates the cleaned CSV file and splits it into chunks if rows exceed chunkLimit.
 * 
 * @param {Array<Object>} validRows List of valid transaction records
 * @param {number} chunkLimit Number of rows per split file
 * @param {string} sessionId Unique ID for the current request context (avoids filename collisions)
 * @returns {Promise<Object>} Object containing filenames of the cleaned file and chunk files
 */
const processCSVOutput = async (validRows, chunkLimit, sessionId) => {
  const sessionDir = path.join(PROCESSED_DIR, sessionId);
  
  // Create unique folder for the current user's session files
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const result = {
    cleanedFile: null,
    chunks: []
  };

  if (validRows.length === 0) {
    return result;
  }

  // Set up the json2csv parser
  const parser = new Parser({
    fields: ['Transaction ID', 'Amount', 'Date', 'Email', 'Phone', 'Country', 'Payment Mode']
  });

  // 1. Generate Cleaned CSV file
  const cleanedCsvContent = parser.parse(validRows);
  const cleanedFileName = 'cleaned.csv';
  const cleanedFilePath = path.join(sessionDir, cleanedFileName);
  fs.writeFileSync(cleanedFilePath, cleanedCsvContent, 'utf8');
  result.cleanedFile = cleanedFileName;

  // 2. Generate Split Chunks if limit is exceeded and size is positive
  if (chunkLimit > 0 && validRows.length > chunkLimit) {
    let chunkIndex = 1;
    for (let i = 0; i < validRows.length; i += chunkLimit) {
      const chunkRows = validRows.slice(i, i + chunkLimit);
      const chunkCsvContent = parser.parse(chunkRows);
      const chunkFileName = `chunk_${chunkIndex}.csv`;
      const chunkFilePath = path.join(sessionDir, chunkFileName);
      
      fs.writeFileSync(chunkFilePath, chunkCsvContent, 'utf8');
      result.chunks.push(chunkFileName);
      chunkIndex++;
    }
  }

  return result;
};

/**
 * Resolves the absolute path for a generated file.
 * 
 * @param {string} sessionId 
 * @param {string} filename 
 * @returns {string} Absolute file path or null if not exists/outside sandbox
 */
const getProcessedFilePath = (sessionId, filename) => {
  // Validate path traversal attempts
  const safeSessionId = path.basename(sessionId);
  const safeFilename = path.basename(filename);
  const targetPath = path.join(PROCESSED_DIR, safeSessionId, safeFilename);

  if (fs.existsSync(targetPath)) {
    return targetPath;
  }
  return null;
};

module.exports = {
  processCSVOutput,
  getProcessedFilePath
};
