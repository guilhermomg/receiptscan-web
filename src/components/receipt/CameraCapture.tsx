import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '../common';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const captureImage = () => {
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

    // Convert canvas to blob
    setIsCapturing(true);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `receipt-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          onCapture(file);
          stopCamera();
        }
        setIsCapturing(false);
      },
      'image/jpeg',
      0.9
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full">
        {error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-white text-lg mb-4">{error}</p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isCapturing}
                  className="text-white border-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={captureImage}
                  disabled={isCapturing}
                  isLoading={isCapturing}
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  Capture
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
