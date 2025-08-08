import React from "react";

const FileUploader = ({ onFileUpload }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file); // App.jsx에서 handleFileUpload 실행됨
    }
  };

  return (
    <div className="mb-6 text-center">
      <input type="file" accept=".xlsx" onChange={handleChange} />
    </div>
  );
};

export default FileUploader;
