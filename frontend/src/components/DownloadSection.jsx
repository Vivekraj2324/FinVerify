/**
 * components/DownloadSection.jsx — Export options with Lucide icons.
 */

import React from 'react';
import { Download, FileDown, Database } from 'lucide-react';
import api from '../utils/api';

const DownloadSection = ({ downloadInfo }) => {
  if (!downloadInfo) return null;

  const handleDownloadFile = async (url, filename) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download file.');
    }
  };

  const handleDownloadValid = () => {
    if (downloadInfo.cleanedFile && downloadInfo.sessionId) {
      const url = `/transactions/download/${downloadInfo.sessionId}/${downloadInfo.cleanedFile}`;
      handleDownloadFile(url, downloadInfo.cleanedFile);
    }
  };

  const hasValidFile = !!downloadInfo.cleanedFile;

  return (
    <div className="summary-section">
      <h2 className="section-title">Export Results</h2>
      
      <div className="download-grid">
        {hasValidFile && (
          <div className="download-file-card">
            <div className="file-info-header">
              <div className="file-icon-wrapper" style={{ color: 'var(--accent-green)', background: 'var(--accent-green-dim)' }}>
                <FileDown size={20} />
              </div>
              <div>
                <h4 className="file-title">Valid Records</h4>
                <p className="file-desc">Clean, verified data ready for system ingestion.</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleDownloadValid}>
              <Download size={14} /> Download CSV
            </button>
          </div>
        )}
      </div>

      {downloadInfo.chunks && downloadInfo.chunks.length > 0 && (
        <div className="download-chunks-container">
          <h4 className="chunks-heading">Batched Data Export</h4>
          <p className="chunks-subheading">Valid records split according to your specified threshold.</p>
          <div className="chunks-list">
            {downloadInfo.chunks.map((chunkFilename, index) => {
              const url = `/transactions/download/${downloadInfo.sessionId}/${chunkFilename}`;
              return (
                <div key={index} className="chunk-item">
                  <div className="chunk-left">
                    <Database size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="chunk-name">Batch {index + 1}</span>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDownloadFile(url, chunkFilename)}
                  >
                    <Download size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadSection;
