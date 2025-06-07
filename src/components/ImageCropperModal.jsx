// src/components/ImageCropperModal.jsx - Image Cropping Modal
import React, { useState, useRef, useEffect } from 'react';
import './ImageCropperModal.css';

const ImageCropperModal = ({ imageSrc, onCropComplete, onCancel }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageSrc && imageRef.current) {
      const img = imageRef.current;
      img.onload = () => {
        setImageLoaded(true);
        centerImage();
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const centerImage = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const cropSize = 300; // Reduced crop circle size to match smaller avatar
    
    // Calculate scale to fit image nicely in crop area
    const scaleX = cropSize / img.naturalWidth;
    const scaleY = cropSize / img.naturalHeight;
    const optimalScale = Math.max(scaleX, scaleY);
    
    setImageScale(optimalScale);
    setImagePosition({
      x: (canvas.width - img.naturalWidth * optimalScale) / 2,
      y: (canvas.height - img.naturalHeight * optimalScale) / 2
    });
  };

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    const cropSize = 300; // Reduced crop circle size
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.save();
    ctx.drawImage(
      img,
      imagePosition.x,
      imagePosition.y,
      img.naturalWidth * imageScale,
      img.naturalHeight * imageScale
    );
    ctx.restore();
    
    // Draw overlay (darken everything except crop area)
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create circular crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, cropSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    
    // Draw crop circle border
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, cropSize / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    const gridSize = cropSize / 3;
    for (let i = 1; i < 3; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(centerX - cropSize/2 + i * gridSize, centerY - cropSize/2);
      ctx.lineTo(centerX - cropSize/2 + i * gridSize, centerY + cropSize/2);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(centerX - cropSize/2, centerY - cropSize/2 + i * gridSize);
      ctx.lineTo(centerX + cropSize/2, centerY - cropSize/2 + i * gridSize);
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [imagePosition, imageScale, imageLoaded]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - imagePosition.x,
      y: e.clientY - rect.top - imagePosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setImagePosition({
      x: e.clientX - rect.left - dragStart.x,
      y: e.clientY - rect.top - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    setImageScale(newScale);
  };

  const getCroppedImage = () => {
    if (!canvasRef.current || !imageRef.current) return null;
    
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const cropSize = 300; // Reduced crop circle size
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;
    
    // Calculate the crop area on the original image
    const sourceX = (centerX - cropSize/2 - imagePosition.x) / imageScale;
    const sourceY = (centerY - cropSize/2 - imagePosition.y) / imageScale;
    const sourceSize = cropSize / imageScale;
    
    // Create circular clipping path
    cropCtx.save();
    cropCtx.beginPath();
    cropCtx.arc(cropSize/2, cropSize/2, cropSize/2, 0, 2 * Math.PI);
    cropCtx.clip();
    
    // Draw the cropped portion within the circular clip
    cropCtx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      cropSize,
      cropSize
    );
    
    cropCtx.restore();
    
    return cropCanvas.toDataURL('image/png', 1.0);
  };

  const handleCrop = () => {
    const croppedImage = getCroppedImage();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="image-cropper-overlay" onClick={handleOverlayClick}>
      <div className="image-cropper-modal">
        <div className="cropper-header">
          <h3>Crop Your Profile Picture</h3>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>
        
        <div className="cropper-content">
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={350}
              height={350}
              className="crop-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <img
              ref={imageRef}
              style={{ display: 'none' }}
              alt="Crop source"
            />
          </div>
          
          <div className="crop-controls">
            <div className="control-group">
              <label htmlFor="scale-slider">Zoom:</label>
              <input
                id="scale-slider"
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={imageScale}
                onChange={handleScaleChange}
                className="scale-slider"
              />
              <span className="scale-value">{Math.round(imageScale * 100)}%</span>
            </div>
            
            <div className="crop-instructions">
              <p>• Drag the image to reposition</p>
              <p>• Use the zoom slider to resize</p>
              <p>• Crop to the orange circle</p>
            </div>
          </div>
        </div>
        
        <div className="cropper-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="crop-btn" onClick={handleCrop}>
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;