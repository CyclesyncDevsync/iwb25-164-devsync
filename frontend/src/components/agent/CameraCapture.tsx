'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CameraIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CameraCaptureProps {
  onPhotosCapture: (photos: string[]) => void;
  existingPhotos: string[];
  materialType: string;
  maxPhotos?: number;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotosCapture,
  existingPhotos,
  materialType,
  maxPhotos = 6
}) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsCapturing(true);
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Camera error:', err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 with compression
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    const newPhotos = [...photos, dataUrl];
    setPhotos(newPhotos);
    onPhotosCapture(newPhotos);

    // Auto-stop camera when max photos reached
    if (newPhotos.length >= maxPhotos) {
      stopCamera();
    }
  }, [photos, onPhotosCapture, maxPhotos, stopCamera]);

  const removePhoto = useCallback((index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosCapture(newPhotos);
  }, [photos, onPhotosCapture]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl && photos.length < maxPhotos) {
            const newPhotos = [...photos, dataUrl];
            setPhotos(newPhotos);
            onPhotosCapture(newPhotos);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, [photos, onPhotosCapture, maxPhotos]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const recommendedAngles = [
    'Front view of the material',
    'Side view showing quantity',
    'Close-up of quality/condition',
    'Label or packaging details',
    'Overall context/environment',
    'Any defects or issues'
  ];

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Photo Requirements for {materialType}
        </h3>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          {recommendedAngles.slice(0, 4).map((angle, index) => (
            <li key={index} className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2">
                {index + 1}
              </span>
              {angle}
            </li>
          ))}
        </ul>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Camera Controls */}
      <div className="flex space-x-3">
        <button
          onClick={isCapturing ? stopCamera : startCamera}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium ${
            isCapturing
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-agent-DEFAULT text-white hover:bg-agent-DEFAULT/90'
          }`}
        >
          <CameraIcon className="w-5 h-5 mr-2" />
          {isCapturing ? 'Stop Camera' : 'Start Camera'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={photos.length >= maxPhotos}
          className="flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <PhotoIcon className="w-5 h-5" />
        </button>

        {isCapturing && (
          <button
            onClick={switchCamera}
            className="flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Camera View */}
      {isCapturing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-black rounded-lg overflow-hidden"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
          />
          
          {/* Capture Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={capturePhoto}
              disabled={photos.length >= maxPhotos}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            </button>
          </div>

          {/* Photo Counter */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {photos.length}/{maxPhotos}
          </div>
        </motion.div>
      )}

      {/* Hidden Canvas for Photo Capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Captured Photos ({photos.length}/{maxPhotos})
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <img
                  src={photo}
                  alt={`Captured ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>

                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-1 py-0.5 rounded text-xs">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {photos.length > 0 && (
        <button
          onClick={() => onPhotosCapture(photos)}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700"
        >
          Continue with {photos.length} Photo{photos.length !== 1 ? 's' : ''}
        </button>
      )}

      {/* Minimum Photos Warning */}
      {photos.length < 3 && photos.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            💡 Tip: Capture at least 3 photos for better verification accuracy
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
