/**
 * components/ErrorReport.jsx — Paginated error table with a details modal.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, SearchX, AlertCircle, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorReport = ({ errors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedError, setSelectedError] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getTransactionId = (data) => {
    if (!data) return null;
    const key = Object.keys(data).find(k => 
      k.trim().toLowerCase().replace(/[\s_]/g, '') === 'transactionid'
    );
    return key ? data[key] : null;
  };

  const filteredErrors = useMemo(() => {
    if (!searchTerm.trim()) return errors;
    const lowerTerm = searchTerm.toLowerCase();
    return errors.filter(err => {
      const txId = getTransactionId(err.data) || '';
      const matchId = String(txId).toLowerCase().includes(lowerTerm);
      const matchRow = String(err.row).includes(lowerTerm);
      const matchMsg = err.errors.some(e => e.toLowerCase().includes(lowerTerm));
      return matchId || matchRow || matchMsg;
    });
  }, [errors, searchTerm]);

  const totalPages = Math.ceil(filteredErrors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredErrors.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  if (!errors || errors.length === 0) return null;

  return (
    <div className="card">
      <div className="error-header-flex">
        <div>
          <h2 className="section-title">Audit Report</h2>
          <p className="section-subtitle">Detailed breakdown of invalid records</p>
        </div>
        
        <div className="search-bar-wrapper">
          <div className="search-icon-left"><Search size={14} /></div>
          <input
            type="text"
            placeholder="Search TX ID, row #, or error..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-search"
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="error-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Row</th>
              <th style={{ width: '25%' }}>Tx ID</th>
              <th style={{ width: '45%' }}>Issue Summary</th>
              <th style={{ width: '20%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((err, idx) => {
                const txId = getTransactionId(err.data);
                const errorCount = err.errors.length;
                return (
                  <tr key={`${err.row}-${idx}`}>
                    <td><span className="badge-row">#{err.row}</span></td>
                    <td className="tx-id-cell">
                      {txId ? (
                        <code>{txId}</code>
                      ) : (
                        <span className="empty-cell">Missing</span>
                      )}
                    </td>
                    <td>
                      <div style={{ color: 'var(--accent-red)', fontWeight: 500, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={14} />
                        {errorCount} {errorCount === 1 ? 'Rule Failed' : 'Rules Failed'}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedError(err)}
                      >
                        <ExternalLink size={12} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4}>
                  <div className="empty-search-state">
                    <SearchX size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p>No errors match "{searchTerm}"</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <button
            className="btn btn-secondary pager-btn"
            onClick={handlePrev} disabled={currentPage === 1}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary pager-btn"
            onClick={handleNext} disabled={currentPage === totalPages}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedError && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedError(null)}
          >
            <motion.div 
              className="modal-content"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} // Prevent clicking inside modal from closing it
            >
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Transaction Details</h3>
                  <p className="modal-subtitle">Spreadsheet Row #{selectedError.row}</p>
                </div>
                <button className="modal-close-btn" onClick={() => setSelectedError(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div>
                  <h4 className="modal-section-title">Validation Failures</h4>
                  <ul className="error-bullet-list" style={{ background: 'var(--accent-red-dim)', padding: '16px 16px 16px 24px', borderRadius: 'var(--radius-md)' }}>
                    {selectedError.errors.map((msg, i) => (
                      <li key={i} className="error-bullet-item" style={{ marginBottom: '8px' }}>
                        <span className="bullet-alert-icon" style={{ marginTop: '2px' }}><AlertCircle size={14} /></span>
                        <span style={{ fontSize: '0.85rem' }}>{msg}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="modal-section-title">Original Record Data</h4>
                  <div className="original-data-inspect" style={{ maxWidth: '100%', gap: '8px' }}>
                    {selectedError.data && Object.entries(selectedError.data).map(([k, v], i) => {
                      if (v === '' || v === undefined) return null; // skip empty
                      return (
                        <span key={i} className="data-inspect-tag" title={k} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                          <strong>{k}:</strong> {v}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ErrorReport;
