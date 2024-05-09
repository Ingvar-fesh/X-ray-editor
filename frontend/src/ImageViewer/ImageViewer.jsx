import React, { useRef, useEffect, useState } from 'react';
import './ImageViewer.css';
import SideToolbar from '../SideToolbar/SideToolbar';
import axios from 'axios';
import DiagnosisModal from '../DiagnosisModal/DiagnosisModal';

function ImageViewer({ image, onClose, onSave }) {
    const imageCanvasRef = useRef(null);
    const drawingCanvasRef = useRef(null);
    const [imageContext, setImageContext] = useState(null);
    const [drawingContext, setDrawingContext] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [shapes, setShapes] = useState([]);
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragStartY, setDragStartY] = useState(0);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeIndex, setResizeIndex] = useState(-1);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartY, setResizeStartY] = useState(0);
    const [prevMouseX, setPrevMouseX] = useState(0);
    const [prevMouseY, setPrevMouseY] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1.0);

    const [penMode, setPenMode] = useState(false);
    const [rubberMode, setRubberMode] = useState(false);
    const [penColor, setPenColor] = useState('#000000');
    const [penThickness, setPenThickness] = useState(2);

    const [imagePositionX, setImagePositionX] = useState(0);
    const [imagePositionY, setImagePositionY] = useState(0);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [dragImageStartX, setDragImageStartX] = useState(0);
    const [dragImageStartY, setDragImageStartY] = useState(0);

    const [loading, setLoading] = useState(false);
    const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
    const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    

    useEffect(() => {
        if (image) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(image);
        }
    }, [image]);

    useEffect(() => {
        const imageCanvas = imageCanvasRef.current;
        const ctx = imageCanvas.getContext('2d');
        setImageContext(ctx);
    }, []);

    useEffect(() => {
        const drawingCanvas = drawingCanvasRef.current;
        const ctx = drawingCanvas.getContext('2d');
        setDrawingContext(ctx);
    }, []);

    useEffect(() => {
        if (image && imageCanvasRef.current && drawingCanvasRef.current) {
            console.log(image)
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
                const img = new Image();
                img.onload = () => {
                    const { width, height } = img;
                    const imageCanvas = imageCanvasRef.current;
                    const drawingCanvas = drawingCanvasRef.current;
                    const imageCtx = imageCanvas.getContext('2d');
                    const drawingCtx = drawingCanvas.getContext('2d');
                    
                    imageCanvas.width = width;
                    imageCanvas.height = height;
                    drawingCanvas.width = width;
                    drawingCanvas.height = height;
                    
                    setImageContext(imageCtx);
                    setDrawingContext(drawingCtx);
                    
                    imageCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
                    imageCtx.drawImage(img, 0, 0, width, height);
                    
                    shapes.forEach((shape, index) => {
                        drawShape(drawingCtx, shape, index === selectedShapeIndex, index === resizeIndex);
                    });
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(image);
        }
    }, [image, brightness, contrast, shapes, selectedShapeIndex, resizeIndex]);

    const handleMouseDown = (e) => {
        const canvas = drawingCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / zoomLevel;
        const mouseY = (e.clientY - rect.top) / zoomLevel; 

        if (penMode || rubberMode) {
            setIsDragging(true);
            setPrevMouseX(mouseX);
            setPrevMouseY(mouseY);
        } else {
            let shapeSelected = false;
            shapes.forEach((shape, index) => {
                if (isPointInsideShape(mouseX, mouseY, shape)) {
                    setSelectedShapeIndex(index);
                    setIsDragging(true);
                    setDragStartX(mouseX - shape.x);
                    setDragStartY(mouseY - shape.y);
                    setIsResizing(isResizingHandle(mouseX, mouseY, shape));
                    if (isResizing) {
                        setResizeIndex(index);
                        setResizeStartX(mouseX - shape.x);
                        setResizeStartY(mouseY - shape.y);
                    }
                    shapeSelected = true;
                }
            });

            if (!shapeSelected) {
                setSelectedShapeIndex(null);
            }
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || (penMode && !rubberMode && !isDragging)) return;

        const canvas = drawingCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / zoomLevel;
        const mouseY = (e.clientY - rect.top) / zoomLevel;
    
        if (penMode) {
            drawingContext.strokeStyle = rubberMode ? '#FFFFFF' : penColor;
            drawingContext.lineWidth = penThickness;
            drawingContext.lineCap = 'round';
            drawingContext.beginPath();
            drawingContext.moveTo(prevMouseX, prevMouseY);
            drawingContext.lineTo(mouseX, mouseY);
            drawingContext.stroke();
            drawingContext.closePath();
            setPrevMouseX(mouseX);
            setPrevMouseY(mouseY);
        } else if (rubberMode) {
            drawingContext.globalCompositeOperation = 'destination-out';
            drawingContext.beginPath();
            drawingContext.arc(mouseX, mouseY, penThickness / 2, 0, 2 * Math.PI);
            drawingContext.fill();
        } else {
            const newShapes = [...shapes];
            const shape = newShapes[selectedShapeIndex];
            if (!isResizing) {
                shape.x = mouseX - dragStartX;
                shape.y = mouseY - dragStartY;
            } else {
                const dx = mouseX - shape.x - resizeStartX;
                const dy = mouseY - shape.y - resizeStartY;
                shape.width += dx;
                shape.height += dy;
                setResizeStartX(mouseX - shape.x);
                setResizeStartY(mouseY - shape.y);
            }
            setShapes(newShapes);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    const isResizingHandle = (x, y, shape) => {
        return x >= shape.x + shape.width - 10 && x <= shape.x + shape.width &&
            y >= shape.y + shape.height - 10 && y <= shape.y + shape.height;
    };

    const drawShape = (ctx, shape, isSelected, isResizing) => {
        ctx.beginPath();
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        ctx.strokeStyle = isSelected ? 'red' : shape.color;
        ctx.lineWidth = shape.lineWidth;
        ctx.stroke();
    };

    const handleDeleteShape = () => {
        if (selectedShapeIndex !== null) {
            const newShapes = [...shapes];
            newShapes.splice(selectedShapeIndex, 1);
            setShapes(newShapes);
            setSelectedShapeIndex(null);
        }
    };

    const handleSave = () => {
        const imageCanvas = imageCanvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;
        const mergedCanvas = document.createElement('canvas');
        const mergedCtx = mergedCanvas.getContext('2d');
        
        mergedCanvas.width = imageCanvas.width;
        mergedCanvas.height = imageCanvas.height;
        
        mergedCtx.drawImage(imageCanvas, 0, 0);
        
        mergedCtx.drawImage(drawingCanvas, 0, 0);
        
        mergedCanvas.toBlob(blob => {
            onSave(blob);
        }, 'image/jpeg', 1);
    };

    const handleAddShape = (type) => {
        setRubberMode(false);
        const newShapes = [...shapes];
        if (type === 'square') {
            newShapes.push({
                type: 'square',
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                color: 'red',
                lineWidth: 2,
            });
        } else if (type === 'rectangle') {
            newShapes.push({
                type: 'rectangle',
                x: 200,
                y: 200,
                width: 80,
                height: 40,
                color: 'blue',
                lineWidth: 2,
            });
        }
        setShapes(newShapes);
    };


    const handleZoomIn = () => {
        const newZoomLevel = zoomLevel * 1.2;
        setZoomLevel(newZoomLevel);

        const imageCanvas = imageCanvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;

        imageCanvas.style.transform = `scale(${newZoomLevel})`;
        drawingCanvas.style.transform = `scale(${newZoomLevel})`;
    };

    const handleZoomOut = () => {
        const newZoomLevel = zoomLevel / 1.2;
        setZoomLevel(newZoomLevel);

        const imageCanvas = imageCanvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;


        imageCanvas.style.transform = `scale(${newZoomLevel})`;
        drawingCanvas.style.transform = `scale(${newZoomLevel})`;
    };

    

    const togglePenMode = () => {
        if (!penMode) {
            setRubberMode(false); // Disable rubber mode when switching to pen mode
            setIsDragging(false); // Reset dragging state
            setPrevMouseX(0); // Reset prevMouseX
            setPrevMouseY(0); // Reset prevMouseY
    
            // Reset canvas context settings
            const canvas = drawingCanvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
            ctx.strokeStyle = penColor; // Reset stroke color
            ctx.lineWidth = penThickness; // Reset line width
        }
        setPenMode(!penMode); // Toggle pen mode
    };

    const handleToggleRubberMode = () => {
        togglePenMode()
        setRubberMode(!rubberMode);
        setPenMode(false);
    };
    

    const isPointInsideShape = (x, y, shape) => {
        if (shape.type === 'rectangle') {
            return x >= shape.x && x <= (shape.x + shape.width) &&
                y >= shape.y && y <= (shape.y + shape.height);
        } 
        return false;
    };

    const handleTogglePenMode = () => {
        togglePenMode()
        setPenMode(!penMode);
        setRubberMode(false);
    };

    const handleImageMouseDown = (e) => {
        const canvas = imageCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / zoomLevel; // Calculate mouseX relative to zoom level
        const mouseY = (e.clientY - rect.top) / zoomLevel; // Calculate mouseY relative to zoom level
        
        setIsDraggingImage(true);
        setDragImageStartX(mouseX);
        setDragImageStartY(mouseY);
    };
    
    const handleImageMouseMove = (e) => {
        if (!isDraggingImage) return;
    
        const canvas = imageCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / zoomLevel; // Calculate mouseX relative to zoom level
        const mouseY = (e.clientY - rect.top) / zoomLevel; // Calculate mouseY relative to zoom level
        
        const deltaX = mouseX - dragImageStartX;
        const deltaY = mouseY - dragImageStartY;
    
        setImagePositionX(prevX => prevX + deltaX);
        setImagePositionY(prevY => prevY + deltaY);
    
        setDragImageStartX(mouseX);
        setDragImageStartY(mouseY);

        const drawingCanvas = drawingCanvasRef.current;
        drawingCanvas.style.transform = `scale(${zoomLevel}) translate(${imagePositionX}px, ${imagePositionY}px)`;
    };
    
    const handleImageMouseUp = () => {
        setIsDraggingImage(false);
    };
    
    const imageCanvasStyle = {
        position: 'absolute',
        transform: `scale(${zoomLevel}) translate(${imagePositionX}px, ${imagePositionY}px)`
    };
    
    const handleSubmit = async () => {
        setLoading(true);
        if (image) {
            const formData = new FormData();
            formData.append('image', image);
    
            try {
                const response = await axios.post('http://127.0.0.1:5000/process_image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    responseType: 'blob',
                });
                console.log('Response from server:', response);
    
                if (response.status === 200) {
                    const blob = new Blob([response.data], { type: 'image/png' });
    
                    const img = new Image();
                    img.onload = () => {
                        const canvas = imageCanvasRef.current;
                        const ctx = canvas.getContext('2d');
    
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    };
    
                    img.onerror = (error) => {
                        console.error('Error loading image:', error);
                    };
    
                    img.src = URL.createObjectURL(blob);
                } else {
                    console.error('Error processing image. Status:', response.status);
                }
            } catch (error) {
                console.error('Error processing image:', error);
            } finally {
                setLoading(false);
            }
        } else {
            console.error('No image available in props');
        }
    };

    const loadDiagnosis = async (imageId) => {
        try {
            setLoadingDiagnosis(true);
            const response = await axios.get(`http://127.0.0.1:5000/get_diagnosis/${imageId}`);
            if (response.status === 200) {
                setDiagnosis(response.data.diagnosis);
            } else {
                console.error('Error loading diagnosis:', response.status);
            }
        } catch (error) {
            console.error('Error loading diagnosis:', error);
        } finally {
            setLoadingDiagnosis(false);
        }
    };
    
    const handleOpenDiagnosisModal = () => {
        if (image && image.name) {
            loadDiagnosis(image.name);
        }
        setShowDiagnosisModal(true);
    };

    const handleCloseDiagnosisModal = () => {
        setShowDiagnosisModal(false);
    };

    const handleSaveDiagnosis = async (diagnosis) => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/save_diagnosis', {
                imageName: image.name,
                diagnosis: diagnosis
            });
    
            if (response.status === 200) {
                console.log('Diagnosis saved successfully:', response.data);
            } else {
                console.error('Error saving diagnosis:', response.status);
            }
        } catch (error) {
            console.error('Error saving diagnosis:', error);
        } finally {
            setShowDiagnosisModal(false);
        }
    };
    

    return (
        <div className="image-viewer">
            <canvas
                ref={imageCanvasRef}
                onMouseDown={handleImageMouseDown}
                onMouseMove={handleImageMouseMove}
                onMouseUp={handleImageMouseUp}
                style={imageCanvasStyle}
            />
            <canvas
                ref={drawingCanvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ position: 'absolute' }}
            />
            <div className="controls">
                <button onClick={handleZoomIn}>Zoom In</button>
                <button onClick={handleZoomOut}>Zoom Out</button>
                <button onClick={handleSave}>Save</button>
                <button onClick={handleOpenDiagnosisModal}>Write Diagnosis</button>
                <button onClick={handleSubmit}>AI Model</button>
                <button onClick={onClose}>Close</button>
                {selectedShapeIndex !== null && (
                    <button onClick={handleDeleteShape} style={{
                        position: 'absolute',
                        top: shapes[selectedShapeIndex].y - 50,
                        left: shapes[selectedShapeIndex].x + shapes[selectedShapeIndex].width - 420
                    }}>X</button>
                )}
            </div>
    
            <SideToolbar
                onBrightnessChange={setBrightness}
                onContrastChange={setContrast}
                onAddRectangle={() => handleAddShape('rectangle')}
                onTogglePenMode={handleTogglePenMode}
                onToggleRubberMode={handleToggleRubberMode}
                onPenColorChange={setPenColor}
                onPenThicknessChange={setPenThickness}
                penMode={penMode}
                rubberMode={rubberMode}
            />
            {showDiagnosisModal ? (
                <DiagnosisModal 
                initialDiagnosis={diagnosis} 
                onSave={handleSaveDiagnosis} 
                onCancel={handleCloseDiagnosisModal} />
            ) : null}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Please wait, AI model is processing...</p>
                </div>
            )}
        </div>
    );
    
}

export default ImageViewer;
