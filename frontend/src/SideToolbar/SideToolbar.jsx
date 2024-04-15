import React, { useState } from 'react';
import './SideToolbar.css';

function SideToolbar({ 
    onBrightnessChange, 
    onContrastChange, 
    onAddRectangle, 
    onTogglePenMode, 
    onToggleRubberMode, 
    onPenColorChange, 
    onPenThicknessChange,
    penMode,
    rubberMode
}) {
    const [penColor, setPenColor] = useState('#000000');
    const [penThickness, setPenThickness] = useState(2);

    const handleBrightnessInputChange = (e) => {
        const value = parseInt(e.target.value);
        onBrightnessChange(value);
    };

    const handleContrastInputChange = (e) => {
        const value = parseInt(e.target.value);
        onContrastChange(value);
    };

    const handlePenColorChange = (e) => {
        const color = e.target.value;
        setPenColor(color);
        onPenColorChange(color);
    };

    const handlePenThicknessChange = (e) => {
        const thickness = parseInt(e.target.value);
        setPenThickness(thickness);
        onPenThicknessChange(thickness);
    };

    const handleEnablePenMode = () => {
        onTogglePenMode();
    };

    const handleEnableRubberMode = () => {
        onToggleRubberMode();
    };

    return (
        <div className="side-toolbar">
            <div>
                <label htmlFor="brightness">Brightness:</label>
                <input
                    type="range"
                    id="brightness"
                    min="0"
                    max="200"
                    defaultValue="100"
                    onChange={handleBrightnessInputChange}
                />
            </div>
            <div>
                <label htmlFor="contrast">Contrast:</label>
                <input
                    type="range"
                    id="contrast"
                    min="0"
                    max="200"
                    defaultValue="100"
                    onChange={handleContrastInputChange}
                />
            </div>
            <div>
                <button onClick={onAddRectangle}>Add Rectangle</button>
            </div>
            <div>
                <label htmlFor="penColor">Pen Color:</label>
                <input
                    type="color"
                    id="penColor"
                    value={penColor}
                    onChange={handlePenColorChange}
                />
            </div>
            <div>
                <label htmlFor="penThickness">Pen Thickness:</label>
                <input
                    type="number"
                    id="penThickness"
                    min="1"
                    max="10"
                    value={penThickness}
                    onChange={handlePenThicknessChange}
                />
            </div>
            <div>
                <button onClick={handleEnablePenMode} disabled={penMode}>
                    {penMode ? 'Pen Mode Enabled' : 'Enable Pen Mode'}
                </button>
            </div>
            <div>
                <button onClick={handleEnableRubberMode} disabled={rubberMode}>
                    {rubberMode ? 'Rubber Mode Enabled' : 'Enable Rubber Mode'}
                </button>
            </div>
        </div>
    );
}

export default SideToolbar;
