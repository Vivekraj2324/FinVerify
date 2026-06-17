<div align="center">
  <h1>💳 Transaction Data Validator & Processor</h1>
  <p>A production-ready, full-stack application for validating, auditing, and segmenting large transaction datasets.</p>
</div>

---

## 📖 Overview

The **Transaction Data Validator** is a robust web application built to streamline data compliance. It accepts CSV uploads containing financial transaction records, rigorously validates them against business rules (like formatting, geographic constraints, and payment modes), and generates instantly downloadable cleaned datasets and paginated error reports.

Built with performance in mind, the backend processes files via memory-efficient Node.js streams, preventing RAM exhaustion even with massive datasets.

## ✨ Features

- **🚀 Stream-Based Parsing:** Uses `csv-parser` to handle very large CSV files efficiently without crashing the server.
- **🛡️ Strict Validation Engine:** Validates emails (RFC 5322), dates (strict ISO formats), and country-specific phone numbers (e.g., 10 digits for India, 8 for Singapore).
- **🎨 Interactive Dashboard:** A beautiful, responsive UI built with React, featuring drag-and-drop uploads, progress bars, and Framer Motion animations.
- **🌗 Dark / Light Mode:** Built-in Charcoal Grey theme with an intuitive light and dark mode toggle.
- **📄 Paginated Error Reports:** Identifies invalid rows and displays exact error reasons in an interactive table with a popup inspection modal.
- **📦 Data Segmentation:** Automatically splits valid datasets into smaller downloadable chunk files based on user-defined limits.

---

## 🛠️ Tech Stack

**Frontend:**
- **React.js** (Vite)
- **Framer Motion** (Micro-animations and transitions)
- **Lucide React** (SVG Iconography)
- **Axios** (API Requests)

**Backend:**
- **Node.js & Express.js**
- **Multer** (Multipart file uploads)
- **csv-parser** (Streaming CSV parser)
- **json2csv** (Exporting valid data)

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/transaction-validator.git
cd transaction-validator
```

### 2. Setup the Backend
The backend runs an Express server that handles the validation logic.
```bash
cd backend
npm install
npm start
# The backend will start on http://localhost:5001
```

### 3. Setup the Frontend
Open a new terminal window to start the React UI.
```bash
cd frontend
npm install
npm run dev
# The frontend will start on http://localhost:5173
```

---

## 📡 API Reference

### `POST /api/transactions/upload`
Uploads a transaction CSV file and returns the validation report.

**Content-Type:** `multipart/form-data`

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | file | **Yes** | The `.csv` transaction file |
| `chunkLimit` | number | No | Number of rows per exported file chunk (default: 1000) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": { "totalRows": 1500, "validRows": 1450, "invalidRows": 50, "errorCount": 54 },
    "errors": [ ... ],
    "downloadInfo": { "sessionId": "165432-123", "cleanedFile": "cleaned.csv", "chunks": ["chunk_1.csv"] }
  }
}
```

### `GET /api/transactions/download/:sessionId/:filename`
Downloads a generated output file (cleaned valid records or chunks).

---

## 🛡️ Validation Rules

The engine currently enforces the following rules for any uploaded CSV:
1. **Transaction ID**: Must be present.
2. **Amount**: Must be a positive integer/float.
3. **Date**: Strict ISO format checking (no "Month 13" overflow allowed).
4. **Email**: Must conform to standard RFC format.
5. **Phone**: Context-aware lengths (India = 10 digits, Singapore = 8 digits).
6. **Payment Mode**: Restricted to specific enums (Credit Card, Debit Card, UPI, Net Banking, Wallet).

---

<div align="center">
  <i>Developed for scalable transaction auditing and technical demonstration.</i>
</div>
