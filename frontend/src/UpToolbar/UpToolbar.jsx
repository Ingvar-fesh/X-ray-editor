import React, { useState } from 'react';
import "./UpToolbar.css"

function UpToolbar({ onFilesSelect }) {
    const [isImportHovered, setIsImportHovered] = useState(false);
    const [isExportHovered, setIsExportHovered] = useState(false);
    const [isAIHovered, setIsAIHovered] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        onFilesSelect(files); // Passing selected files to the parent component
    };

    return (
        <div className="toolbar-container">
            <div className="up-toolbar">
                <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <button
                    className="toolbar-btn"
                    onMouseEnter={() => setIsImportHovered(true)}
                    onMouseLeave={() => setIsImportHovered(false)}
                >
                    <label htmlFor="fileInput">
                        <img src={require("../icons/import.png")} alt="Import"/>
                    </label>
                    <span style={{ opacity: isImportHovered ? 1 : 0 }}>Import Image</span>
                </button>
                <button
                    className="toolbar-btn"
                    onMouseEnter={() => setIsExportHovered(true)}
                    onMouseLeave={() => setIsExportHovered(false)}
                >
                    <img src={require("../icons/export.png")} alt="Export"/>
                    <span style={{ opacity: isExportHovered ? 1 : 0 }}>Export Image</span>
                </button>
                <button
                    className="toolbar-btn"
                    onMouseEnter={() => setIsAIHovered(true)}
                    onMouseLeave={() => setIsAIHovered(false)}
                >
                    <img src={require("../icons/artificial-intelligence.png")} alt="Launch AI"/>
                    <span style={{ opacity: isAIHovered ? 1 : 0 }}>Launch AI</span>
                </button>
            </div>
        </div>
    );
}

export default UpToolbar;
