'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface WebtoonImageProps {
  src: string;
  alt: string;
  index: number;
  onHeightMeasured?: (height: number) => void;
  priority?: boolean;
}

/**
 * Component chuyên dụng để hiển thị ảnh dài kiểu webtoon
 * Tự động đo chiều cao thực tế của ảnh và báo về parent component
 */
export function WebtoonImage({ src, alt, index, onHeightMeasured, priority = false }: WebtoonImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setNaturalHeight(0);
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const height = img.naturalHeight;
    const width = img.naturalWidth;
    
    // Calculate actual rendered height based on container width
    if (containerRef.current && width > 0) {
      const containerWidth = containerRef.current.offsetWidth;
      const renderedHeight = (height / width) * containerWidth;
      
      setNaturalHeight(renderedHeight);
      setIsLoading(false);
      
      // Notify parent about the actual height
      if (onHeightMeasured) {
        onHeightMeasured(renderedHeight);
      }
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    // Set a default height for error state
    if (onHeightMeasured) {
      onHeightMeasured(400);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      style={{ 
        minHeight: naturalHeight > 0 ? naturalHeight : 600,
        height: naturalHeight > 0 ? naturalHeight : 'auto'
      }}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 text-sm">Đang tải trang {index + 1}...</div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
          <div className="text-gray-500 text-sm mb-2">Không thể tải ảnh trang {index + 1}</div>
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="text-blue-600 text-xs hover:underline"
          >
            Thử lại
          </button>
        </div>
      )}
      
      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        width={1024}
        height={naturalHeight || 1536}
        className={`w-full h-auto ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        quality={90}
        unoptimized // Important: prevent Next.js from resizing webtoon images
      />
    </div>
  );
}
