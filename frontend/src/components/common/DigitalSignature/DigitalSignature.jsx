import React, { useRef, useState, useEffect } from 'react';
import './DigitalSignature.css';

const DigitalSignature = ({ onSignatureChange, clearSignature, disabled = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set drawing styles
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    if (clearSignature) {
      clearCanvas();
    }
  }, [clearSignature]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e) => {
    if (disabled) return;
    
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;
    
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (!isEmpty && onSignatureChange) {
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL('image/png');
      onSignatureChange(signatureData);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  return (
    <div className="digital-signature">
      <div className="signature-header">
        <label className="signature-label">
          Digital Signature <span className="required">*</span>
        </label>
        <button
          type="button"
          className="clear-signature-btn"
          onClick={clearCanvas}
          disabled={disabled || isEmpty}
        >
          Clear
        </button>
      </div>
      
      <div className="signature-canvas-container">
        <canvas
          ref={canvasRef}
          className={`signature-canvas ${disabled ? 'disabled' : ''}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty && (
          <div className="signature-placeholder">
            {disabled ? 'Signature cannot be modified' : 'Sign here with your mouse or finger'}
          </div>
        )}
      </div>
      
      <div className="signature-info">
        <small className="signature-disclaimer">
          By signing above, you confirm the accuracy of this prescription and authorize its dispensing.
        </small>
      </div>
    </div>
  );
};

export default DigitalSignature;