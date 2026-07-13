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
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFile(files);
      setSelectedFileName(files.map((f) => f.name).join(", "));
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box" onClick={handleBoxClick}>
        <FaUpload className="upload-icon" />
        <h3>Upload Source Files</h3>
        <p>Drag and drop or browse files. Supports .py and .js files</p>
        
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          accept=".py,.js"
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