import React, { useState } from 'react';
import './App.css';
import UpToolbar from "../UpToolbar/UpToolbar";
import ImageEditor from "../ImageEditor/ImageEditor";

function App() {
    const [selectedImages, setSelectedImages] = useState([]);

    const handleFilesSelect = (files) => {
        setSelectedImages([...selectedImages, ...files]); // Merge new images with existing ones
    };

    return (
        <div className="App">
            <UpToolbar onFilesSelect={handleFilesSelect} />
            <ImageEditor images={selectedImages} />
        </div>
    );
}

export default App;
