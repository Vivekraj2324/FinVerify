/**
 * components/ValidationSummary.jsx — Stats dashboard with Lucide icons & Framer Motion.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const container = {
  animate: { transition: { staggerChildren: 0.06 } }
};
const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};

const ValidationSummary = ({ summary }) => {
  if (!summary) return null;
  const { totalRows, validRows, invalidRows, errorCount } = summary;
  const validPct = totalRows > 0 ? (validRows / totalRows) * 100 : 0;
  const invalidPct = totalRows > 0 ? (invalidRows / totalRows) * 100 : 0;

  return (
    <div className="summary-section">
      <h2 className="section-title">Validation Results</h2>

      <motion.div className="stats-grid" variants={container} initial="initial" animate="animate">
        <motion.div className="card stat-card" variants={item}>
          <div className="stat-icon-wrapper total"><BarChart3 size={18} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Rows</span>
            <span className="stat-value">{totalRows}</span>
          </div>
        </motion.div>

        <motion.div className="card stat-card" variants={item}>
          <div className="stat-icon-wrapper valid"><CheckCircle2 size={18} /></div>
          <div className="stat-content">
            <span className="stat-label">Valid</span>
            <span className="stat-value">{validRows}</span>
            <span className="stat-badge success-badge">{validPct.toFixed(1)}%</span>
          </div>
        </motion.div>

        <motion.div className="card stat-card" variants={item}>
          <div className="stat-icon-wrapper invalid"><XCircle size={18} /></div>
          <div className="stat-content">
            <span className="stat-label">Invalid</span>
            <span className="stat-value">{invalidRows}</span>
            <span className="stat-badge danger-badge">{invalidPct.toFixed(1)}%</span>
          </div>
        </motion.div>

        <motion.div className="card stat-card" variants={item}>
          <div className="stat-icon-wrapper errors"><AlertTriangle size={18} /></div>
          <div className="stat-content">
            <span className="stat-label">Errors</span>
            <span className="stat-value">{errorCount}</span>
            <span className="stat-badge warning-badge">Flagged</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Ratio bar */}
      <div className="card ratio-card">
        <h3 className="card-subtitle">Data Integrity</h3>
        <div className="ratio-bar-container">
          <motion.div
            className="ratio-fill valid-fill"
            initial={{ width: 0 }}
            animate={{ width: `${validPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          <motion.div
            className="ratio-fill invalid-fill"
            initial={{ width: 0 }}
            animate={{ width: `${invalidPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          />
        </div>
        <div className="ratio-legend">
          <div className="legend-item"><span className="legend-dot valid-dot" /> Valid ({validRows})</div>
          <div className="legend-item"><span className="legend-dot invalid-dot" /> Invalid ({invalidRows})</div>
        </div>
      </div>
    </div>
  );
};

export default ValidationSummary;
