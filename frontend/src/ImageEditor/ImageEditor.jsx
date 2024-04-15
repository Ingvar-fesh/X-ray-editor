// ImageEditor.js
import React, { useRef, useEffect, useState } from 'react';
import './ImageEditor.css';
import ImageViewer from '../ImageViewer/ImageViewer';

function ImageEditor({ images }) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [maxImageSize, setMaxImageSize] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [updatedImages, setUpdatedImages] = useState(images); // Define updatedImages state

    useEffect(() => {
        setUpdatedImages(images);
    }, [images]);

    useEffect(() => {
        const updateContainerSize = () => {
            const container = containerRef.current;
            if (container) {
                setContainerWidth(container.offsetWidth);
                setContainerHeight(container.offsetHeight);
            }
        };

        window.addEventListener('resize', updateContainerSize);
        updateContainerSize();

        return () => {
            window.removeEventListener('resize', updateContainerSize);
        };
    }, []);

    useEffect(() => {
        const calculateMaxImageSize = () => {
            const numImages = updatedImages.length;
            const maxRowImages = Math.floor(containerWidth / 300); // Adjust 300 as needed for desired image width
            const maxColImages = Math.floor(containerHeight / 300); // Adjust 300 as needed for desired image height
            const maxImagesPerPage = maxRowImages * maxColImages;
            const numRows = Math.ceil(numImages / maxRowImages);

            const width = containerWidth / maxRowImages;
            const height = containerHeight / numRows;
            return Math.min(width, height);
        };

        setMaxImageSize(calculateMaxImageSize());
    }, [containerWidth, containerHeight, updatedImages]);

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
    };

    const handleCloseViewer = () => {
        setSelectedImageIndex(null);
    };

    const handleSaveImage = (editedImage) => {
        // Create a copy of the images array
        const newImages = [...updatedImages];
        // Replace the original image with the edited one at the selected index
        newImages[selectedImageIndex] = editedImage;
        // Update the images state with the edited image
        setUpdatedImages(newImages);
    };

    const handleDeleteImage = (index) => {
        // Create a copy of the images array
        const newImages = [...updatedImages];
        // Remove the image at the specified index
        newImages.splice(index, 1);
        // Update the images state with the edited image
        setUpdatedImages(newImages);
    };

    return (
        <div className="image-editor" ref={containerRef}>
            {updatedImages.map((image, index) => (
                <div key={index} className="image-container" style={{ width: maxImageSize, height: maxImageSize }}>
                    <button className="delete-button" onClick={() => handleDeleteImage(index)}>Delete</button>
                    <img
                        src={URL.createObjectURL(image)}
                        alt={`Image ${index}`}
                        className="image-item"
                        onClick={() => handleImageClick(index)}
                    />
                </div>
            ))}
            {selectedImageIndex !== null && (
                <ImageViewer
                    image={updatedImages[selectedImageIndex]}
                    onClose={handleCloseViewer}
                    onSave={handleSaveImage} // Pass onSave function to ImageViewer
                />
            )}
        </div>
    );
}

export default ImageEditor;
