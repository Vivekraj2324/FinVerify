/**
 * App.jsx — Root component with Framer Motion, Lucide React icons, and theme toggle.
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ValidationSummary from './components/ValidationSummary';
import ErrorReport from './components/ErrorReport';
import DownloadSection from './components/DownloadSection';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleUploadStart = () => {
    setLoading(true);
    setError(null);
    setReport(null);
    setHasUploaded(true);
  };

  const handleUploadSuccess = (data) => {
    setLoading(false);
    setReport(data);
    setError(null);
  };

  const handleUploadFailure = (message) => {
    setLoading(false);
    setError(message);
    setReport(null);
  };

  const handleReset = () => {
    setLoading(false);
    setError(null);
    setReport(null);
    setHasUploaded(false);
  };

  return (
    <div className="app-container">
      {/* Header with theme toggle */}
      <header className="app-header">
        <div className="header-row">
          <span className="logo-badge">Compliance Suite</span>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
        <h1 className="main-title">Transaction Data Validator</h1>
        <p className="main-subtitle">
          Upload transaction CSV files to audit records, enforce regional formatting checks, and segment outputs.
        </p>
      </header>

      {/* Main Content */}
      <main className="app-content">
        <AnimatePresence mode="wait">

          {/* Idle: side-by-side upload + rules */}
          {!hasUploaded && (
            <motion.div className="idle-grid" key="idle" {...fadeUp}>
              <div>
                <FileUpload
                  onUploadStart={handleUploadStart}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadFailure={handleUploadFailure}
                />
              </div>
              <div className="card guidelines-card">
                <h3 className="card-subtitle">Validation Rules</h3>
                <ul className="guidelines-list-vertical">
                  <li>
                    <strong>Transaction ID</strong>
                    <span className="rule-desc">Required field. Must be unique within the file.</span>
                  </li>
                  <li>
                    <strong>Amount</strong>
                    <span className="rule-desc">Required. Must resolve to a positive number.</span>
                  </li>
                  <li>
                    <strong>Date</strong>
                    <span className="rule-desc">Strict format validation (YYYY-MM-DD, DD/MM/YYYY). No overflow.</span>
                  </li>
                  <li>
                    <strong>Email</strong>
                    <span className="rule-desc">Must conform to RFC 5322 pattern.</span>
                  </li>
                  <li>
                    <strong>Phone (Geographic)</strong>
                    <div className="country-subrules">
                      <span>India — exactly 10 digits</span>
                      <span>Singapore — exactly 8 digits</span>
                    </div>
                  </li>
                  <li>
                    <strong>Payment Mode</strong>
                    <span className="rule-desc">Credit Card, Debit Card, Net Banking, UPI, or Wallet.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <motion.div className="card loading-card" key="loading" {...fadeUp}>
              <div className="spinner" />
              <h2>Running Ledger Audit</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.85rem' }}>
                Streaming CSV, checking formats, compiling segments…
              </p>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div key="error" {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="card error-alert-card">
                <div className="error-message-content">
                  <h3>Processing Failed</h3>
                  <p>{error}</p>
                </div>
              </div>
              <button onClick={handleReset} className="btn btn-secondary btn-block btn-reset">
                Try Again
              </button>
            </motion.div>
          )}

          {/* Results */}
          {report && (
            <motion.div className="results-panel" key="results" {...fadeUp}>
              <div className="results-action-bar">
                <button onClick={handleReset} className="btn btn-secondary">
                  Upload Another File
                </button>
              </div>

              <ValidationSummary summary={report.summary} />
              <DownloadSection downloadInfo={report.downloadInfo} />

              {report.errors && report.errors.length > 0 ? (
                <ErrorReport errors={report.errors} />
              ) : (
                <div className="card clean-success-card">
                  <h2>100% Data Integrity</h2>
                  <p>All records verified. No audit errors found.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="app-footer">
        <p>Transaction Validator Engine — Internship Technical Evaluation 2026</p>
      </footer>
    </div>
  );
}

export default App;
