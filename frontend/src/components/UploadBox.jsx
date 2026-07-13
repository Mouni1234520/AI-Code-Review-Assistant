import React, { useRef, useState } from "react";
import { FaUpload, FaFileAlt } from "react-icons/fa";

function UploadBox({ setFile, uploadFile, loading }) {
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setSelectedFileName(file.name);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box" onClick={handleBoxClick}>
        <FaUpload className="upload-icon" />
        <h3>Upload Source File</h3>
        <p>Drag and drop or browse files. Supports .py and .js files</p>
        
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          accept=".py,.js"
          onChange={handleFileChange}
        />

        {selectedFileName && (
          <div className="selected-file-badge">
            <FaFileAlt />
            {selectedFileName}
          </div>
        )}
      </div>

      <button 
        className="btn-analyze" 
        style={{ marginTop: "15px", width: "100%", justifyContent: "center" }}
        onClick={uploadFile} 
        disabled={loading || !selectedFileName}
      >
        {loading ? "Uploading & Auditing..." : "Upload & Analyze File"}
      </button>
    </div>
  );
}

export default UploadBox;