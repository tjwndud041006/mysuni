import React from "react";

const DownloadButtons = ({ onDownload }) => {
  return (
    <div className="mt-8 text-center">
      <button
        onClick={onDownload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        필터링된 데이터 CSV 다운로드
      </button>
    </div>
  );
};

export default DownloadButtons;
