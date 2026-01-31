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

  // No longer using reset effect here. 
  // IMPORTANT: The parent component SHOULD use 'key={src}' on WebtoonImage 
  // to ensure a clean remount when the source changes, which is the 
  // standard React pattern for resetting state on prop change.

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
        <div className="absolute inset-0 bg-gray-900 animate-pulse flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full border-b-2 border-lime-400 animate-spin mb-4"></div>
          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Đang tải trang {index + 1}</div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-center p-6 border border-red-500/20 rounded-2xl">
          <div className="text-red-500 text-xs font-black uppercase tracking-widest mb-3">Lỗi tải ảnh trang {index + 1}</div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            Vui lòng kiểm tra lại kết nối
          </p>
          <button
            onClick={handleRetry}
            disabled={retryCount >= MAX_RETRIES}
            className="px-6 py-2 bg-white/5 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {retryCount >= MAX_RETRIES ? 'THẤT BẠI' : `THỬ LẠI (${retryCount}/${MAX_RETRIES})`}
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
