import React, { useState, useRef, useEffect } from 'react';
import type { TouchEvent } from 'react';

interface TouchableImageProps {
  src: string;
  alt: string;
  className?: string;
}

const TouchableImage: React.FC<TouchableImageProps> = ({ src, alt, className = '' }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null);
  const [lastDistance, setLastDistance] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset on image change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      // Single touch for panning
      setIsDragging(true);
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      // Two fingers for pinch zoom
      setIsDragging(false);
      const distance = getDistance(e.touches[0], e.touches[1]);
      setLastDistance(distance);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging && lastTouch && scale > 1) {
      // Panning
      const deltaX = e.touches[0].clientX - lastTouch.x;
      const deltaY = e.touches[0].clientY - lastTouch.y;

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && lastDistance !== null) {
      // Pinch zooming
      const distance = getDistance(e.touches[0], e.touches[1]);
      const delta = distance - lastDistance;
      const scaleChange = 1 + delta / 500;

      setScale((prev) => {
        const newScale = Math.min(Math.max(1, prev * scaleChange), 4);
        // Reset position if zooming out to 1x
        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newScale;
      });

      setLastDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouch(null);
    setLastDistance(null);
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden touch-none select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-full object-contain transition-transform"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transformOrigin: 'center center',
        }}
      />
      {scale > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
        Pinch to zoom • Double tap to reset
      </div>
    </div>
  );
};

export default TouchableImage;
