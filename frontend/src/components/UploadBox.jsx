import React, { useRef, useState } from "react";
import { FaUpload, FaFileAlt } from "react-icons/fa";

function UploadBox({ setFile, uploadFile, loading, uploadProgress, isUploading }) {
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateFiles = (files) => {
    const allowedExtensions = [".py", ".js", ".java", ".c", ".cpp", ".h"];
    const validFiles = files.filter(f => {
      const name = f.name.toLowerCase();
      return allowedExtensions.some(ext => name.endsWith(ext));
    });
    if (validFiles.length !== files.length) {
      alert("Only Python, JavaScript, Java, and C/C++ source files are supported.");
      return validFiles;
    }
    return validFiles;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validated = validateFiles(files);
    if (validated.length > 0) {
      setFile(validated);
      setSelectedFileName(validated.map((f) => f.name).join(", "));
    } else {
      setFile(null);
      setSelectedFileName("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validated = validateFiles(files);
      if (validated.length > 0) {
        setFile(validated);
        setSelectedFileName(validated.map((f) => f.name).join(", "));
      } else {
        setFile(null);
        setSelectedFileName("");
      }
    }
  };

  return (
    <div className="upload-container">
      <div 
        className={`upload-box ${isDragging ? "dragging" : ""}`} 
        onClick={handleBoxClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FaUpload className="upload-icon" />
        <h3>Upload Source Files</h3>
        <p>Drag and drop or click to browse. Supports .py, .js, .java, and .c files.</p>
        
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          accept=".py,.js,.java,.c,.cpp,.h"
          multiple
          onChange={handleFileChange}
        />

        {selectedFileName && (
          <div className="selected-file-badge">
            <FaFileAlt />
            {selectedFileName}
          </div>
        )}
      </div>

      {isUploading && uploadProgress !== null && (
        <div className="upload-progress-container">
          <div className="progress-header">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      <button 
        className="btn-analyze" 
        style={{ marginTop: "15px", width: "100%", justifyContent: "center" }}
        onClick={uploadFile} 
        disabled={loading || !selectedFileName}
      >
        {loading ? "Analyzing..." : "Upload & Analyze File"}
      </button>
    </div>
  );
}

export default UploadBox;