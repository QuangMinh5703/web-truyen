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

const MAX_RETRIES = 3;

/**
 * Component chuyên dụng để hiển thị ảnh dài kiểu webtoon
 * Tự động đo chiều cao thực tế của ảnh và báo về parent component
 */
export function WebtoonImage({ src, alt, index, onHeightMeasured, priority = false }: WebtoonImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a derived image source that changes on each retry attempt to bypass cache
  const imageSrc = `${src}?retry=${retryCount}`;

  // Reset states when the original src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setNaturalHeight(0);
    setRetryCount(0); // Reset retry count on src change
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
      setRetryCount(0); // Reset retry count on success
      
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

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setHasError(false);
      setIsLoading(true);
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
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">Đang tải trang {index + 1}...</div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4">
          <div className="text-red-500 text-sm mb-2">Không thể tải ảnh trang {index + 1}.</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">
            Vui lòng kiểm tra lại kết nối mạng.
          </p>
          <button 
            onClick={handleRetry}
            disabled={retryCount >= MAX_RETRIES}
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
          >
            {retryCount >= MAX_RETRIES ? 'Tải lại thất bại' : `Thử lại (${retryCount}/${MAX_RETRIES})`}
          </button>
        </div>
      )}
      
      {/* Actual image, hidden if there is an error */}
      {!hasError && (
        <Image
          src={imageSrc}
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
      )}
    </div>
  );
}
