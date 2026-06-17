/**
 * components/FileUpload.jsx — File upload with Lucide icons & Framer Motion.
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, ArrowUpFromLine } from 'lucide-react';
import api from '../utils/api';

const FileUpload = ({ onUploadSuccess, onUploadStart, onUploadFailure }) => {
  const [file, setFile] = useState(null);
  const [chunkLimit, setChunkLimit] = useState(1000);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFileExtension(selectedFile)) setFile(selectedFile);
    }
  };

  const validateFileExtension = (selectedFile) => {
    if (selectedFile.name.toLowerCase().endsWith('.csv')) return true;
    onUploadFailure('Only CSV files (.csv) are supported.');
    return false;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFileExtension(droppedFile)) setFile(droppedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chunkLimit', chunkLimit);

    setIsUploading(true);
    setUploadProgress(0);
    onUploadStart();

    try {
      const response = await api.post('/transactions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct < 100 ? pct : 99);
        }
      });
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(response.data.data);
      }, 400);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      onUploadFailure(err.response?.data?.message || 'Upload failed. Check your connection.');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="card">
      <h2 className="section-title">Upload Transaction CSV</h2>
      <p className="section-subtitle">Drag a CSV file or browse to select one for validation</p>

      <form onSubmit={handleUpload}>
        <motion.div
          className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
        >
          <input
            type="file" ref={fileInputRef} onChange={handleFileChange}
            style={{ display: 'none' }} accept=".csv"
          />
          <div className="dropzone-content">
            <div className="upload-icon-wrapper">
              {file ? <FileText size={20} /> : <Upload size={20} />}
            </div>
            {file ? (
              <div className="file-details">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatBytes(file.size)}</span>
              </div>
            ) : (
              <div>
                <span className="drop-text">Drop your CSV here, or </span>
                <span className="browse-link">browse</span>
              </div>
            )}
            <p className="file-hint">
              Columns: Transaction ID, Amount, Date, Email, Phone, Country, Payment Mode
            </p>
          </div>
        </motion.div>

        <div className="form-group flex-group">
          <label>
            Split threshold
            <span className="label-hint"> (rows per chunk)</span>
          </label>
          <input
            type="number" min="10" max="10000"
            value={chunkLimit}
            onChange={(e) => setChunkLimit(parseInt(e.target.value, 10) || '')}
            disabled={isUploading}
            className="input-number"
          />
        </div>

        {isUploading ? (
          <div className="progress-container">
            <div className="progress-bar-wrapper">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
            <span className="progress-label">
              {uploadProgress === 99 ? 'Processing on server…' : `Uploading: ${uploadProgress}%`}
            </span>
          </div>
        ) : (
          <motion.button
            type="submit" disabled={!file}
            className="btn btn-primary btn-block"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowUpFromLine size={14} />
            Validate & Process
          </motion.button>
        )}
      </form>
    </div>
  );
};

export default FileUpload;
