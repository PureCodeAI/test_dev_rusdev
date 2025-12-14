import { useState, useRef, useEffect } from 'react';
import { createLazyImageObserver } from '@/utils/performanceUtils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  onLoad,
  onError
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = createLazyImageObserver((entry) => {
      if (entry.target === img && !isLoaded && !hasError) {
        const image = new window.Image();
        image.onload = () => {
          setImageSrc(src);
          setIsLoaded(true);
          if (onLoad) {
            onLoad();
          }
        };
        image.onerror = () => {
          setHasError(true);
          if (onError) {
            onError();
          }
        };
        image.src = src;
        observer.unobserve(img);
      }
    });

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, isLoaded, hasError, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      style={{
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

