import React, { useState, useEffect } from 'react';
import './DiagnosisModal.css';

function DiagnosisModal({ initialDiagnosis, onSave, onCancel }) {
    const [diagnosis, setDiagnosis] = useState(initialDiagnosis);

    useEffect(() => {
        setDiagnosis(initialDiagnosis);
    }, [initialDiagnosis]);

    const handleSave = () => {
        onSave(diagnosis);
        setDiagnosis('');
    };

    return (
        <div className="diagnosis-modal">
            <div className="modal-content">
                <h2 className="modal-title">Write Diagnosis</h2>
                <textarea
                    className="diagnosis-textarea"
                    placeholder="Enter diagnosis..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                />
                <div className="modal-buttons">
                    <button className="save-button" onClick={handleSave}>Save</button>
                    <button className="cancel-button" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default DiagnosisModal;
