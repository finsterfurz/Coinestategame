import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InlineLoader } from './LoadingSpinner';

// ===================================
// 🖼️ IMAGE OPTIMIZATION TYPES
// ===================================

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
  quality?: number;
  responsive?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface LazyImageProps extends OptimizedImageProps {
  threshold?: number;
  rootMargin?: string;
}

interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  fallbackText?: string;
  className?: string;
  online?: boolean;
}

interface BackgroundImageProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  lazy?: boolean;
  overlay?: boolean;
  overlayOpacity?: number;
}

// ===================================
// 🎯 OPTIMIZED IMAGE COMPONENT
// ===================================

/**
 * Main optimized image component with lazy loading, fallbacks, and modern formats
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  lazy = true,
  placeholder,
  fallback,
  quality = 80,
  responsive = true,
  sizes,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized source URLs for different formats
  const generateSources = useCallback((baseSrc: string) => {
    const sources = [];
    
    // WebP format (modern browsers)
    sources.push({
      srcSet: `${baseSrc}?format=webp&quality=${quality}`,
      type: 'image/webp'
    });
    
    // AVIF format (newest browsers)
    if (typeof window !== 'undefined' && 'HTMLImageElement' in window) {
      sources.push({
        srcSet: `${baseSrc}?format=avif&quality=${quality}`,
        type: 'image/avif'
      });
    }
    
    return sources;
  }, [quality]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setHasError(false);
      return;
    }
    
    const error = new Error(`Failed to load image: ${src}`);
    onError?.(error);
  }, [src, fallback, currentSrc, onError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded && !hasError) {
            setCurrentSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, lazy, isLoaded, hasError]);

  // Set initial src if not lazy loading
  useEffect(() => {
    if (!lazy) {
      setCurrentSrc(src);
    }
  }, [src, lazy]);

  const imageClasses = [
    'optimized-image',
    className,
    isLoaded ? 'loaded' : 'loading',
    hasError ? 'error' : ''
  ].filter(Boolean).join(' ');

  if (hasError && !fallback) {
    return (
      <div className={`${imageClasses} error-placeholder`}>
        <div className="error-content">
          <span className="error-icon">🖼️</span>
          <span className="error-text">Bild konnte nicht geladen werden</span>
        </div>
      </div>
    );
  }

  return (
    <div className="optimized-image-container">
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="image-placeholder">
          {placeholder ? (
            <img 
              src={placeholder} 
              alt={alt}
              className="placeholder-image"
              aria-hidden="true"
            />
          ) : (
            <div className="placeholder-skeleton">
              <InlineLoader size="small" text="" />
            </div>
          )}
        </div>
      )}

      {/* Main image with modern format support */}
      <picture>
        {generateSources(currentSrc).map((source, index) => (
          <source 
            key={index}
            srcSet={source.srcSet}
            type={source.type}
            sizes={responsive ? sizes || '(max-width: 768px) 100vw, 50vw' : undefined}
          />
        ))}
        
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={imageClasses}
          width={width}
          height={height}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      </picture>
    </div>
  );
};

// ===================================
// 🙂 AVATAR IMAGE COMPONENT
// ===================================

/**
 * Specialized avatar component with fallback initials
 */
export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt,
  size = 'md',
  fallbackText,
  className = '',
  online
}) => {
  const [hasError, setHasError] = useState(!src);

  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  const avatarSize = typeof size === 'number' ? size : sizeMap[size];
  
  const avatarClasses = [
    'avatar-image',
    `size-${typeof size === 'string' ? size : 'custom'}`,
    online !== undefined ? (online ? 'online' : 'offline') : '',
    className
  ].filter(Boolean).join(' ');

  const generateInitials = (text: string): string => {
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (hasError || !src) {
    return (
      <div 
        className={`${avatarClasses} avatar-fallback`}
        style={{ width: avatarSize, height: avatarSize }}
      >
        <span className="avatar-initials">
          {fallbackText ? generateInitials(fallbackText) : '?'}
        </span>
        
        {online !== undefined && (
          <div className={`online-indicator ${online ? 'online' : 'offline'}`} />
        )}
      </div>
    );
  }

  return (
    <div className={`${avatarClasses} avatar-wrapper`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={avatarSize}
        height={avatarSize}
        className="avatar-img"
        onError={() => setHasError(true)}
      />
      
      {online !== undefined && (
        <div className={`online-indicator ${online ? 'online' : 'offline'}`} />
      )}
    </div>
  );
};

// ===================================
// 🖼️ BACKGROUND IMAGE COMPONENT
// ===================================

/**
 * Optimized background image with lazy loading
 */
export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  className = '',
  children,
  lazy = true,
  overlay = false,
  overlayOpacity = 0.3
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy) {
      setCurrentSrc(src);
      return;
    }

    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [src, lazy]);

  useEffect(() => {
    if (!currentSrc) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = currentSrc;
  }, [currentSrc]);

  const backgroundClasses = [
    'background-image',
    className,
    isLoaded ? 'loaded' : 'loading'
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={containerRef}
      className={backgroundClasses}
      style={{
        backgroundImage: isLoaded ? `url(${currentSrc})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="background-placeholder">
          <InlineLoader size="large" text="Lade Hintergrund..." />
        </div>
      )}
      
      {/* Overlay */}
      {overlay && isLoaded && (
        <div 
          className="background-overlay"
          style={{ 
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
        />
      )}
      
      {/* Content */}
      <div className="background-content" style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

// ===================================
// 🖼️ GALLERY IMAGE COMPONENT
// ===================================

/**
 * Gallery image with zoom and lightbox support
 */
export const GalleryImage: React.FC<OptimizedImageProps & {
  thumbnail?: string;
  caption?: string;
  zoomable?: boolean;
  onZoom?: () => void;
}> = ({
  src,
  alt,
  thumbnail,
  caption,
  zoomable = true,
  onZoom,
  ...props
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoom = useCallback(() => {
    if (zoomable) {
      setIsZoomed(!isZoomed);
      onZoom?.();
    }
  }, [zoomable, isZoomed, onZoom]);

  return (
    <div className={`gallery-image ${isZoomed ? 'zoomed' : ''}`}>
      <OptimizedImage
        src={thumbnail || src}
        alt={alt}
        className="gallery-thumbnail"
        onClick={zoomable ? handleZoom : undefined}
        {...props}
      />
      
      {caption && (
        <div className="gallery-caption">
          {caption}
        </div>
      )}
      
      {zoomable && (
        <div className="zoom-indicator">
          <span className="zoom-icon">🔍</span>
        </div>
      )}
      
      {/* Lightbox Modal */}
      {isZoomed && (
        <div className="lightbox-overlay" onClick={handleZoom}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage
              src={src}
              alt={alt}
              className="lightbox-image"
              lazy={false}
            />
            <button className="lightbox-close" onClick={handleZoom}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================================
// 🎯 RESPONSIVE IMAGE COMPONENT
// ===================================

/**
 * Responsive image with multiple breakpoints
 */
export const ResponsiveImage: React.FC<OptimizedImageProps & {
  breakpoints?: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}> = ({
  src,
  alt,
  breakpoints,
  ...props
}) => {
  const defaultBreakpoints = {
    mobile: `${src}?w=480`,
    tablet: `${src}?w=768`,
    desktop: `${src}?w=1200`
  };

  const imageBreakpoints = breakpoints || defaultBreakpoints;

  return (
    <picture>
      {/* Desktop */}
      <source 
        media="(min-width: 1024px)" 
        srcSet={imageBreakpoints.desktop} 
      />
      
      {/* Tablet */}
      <source 
        media="(min-width: 768px)" 
        srcSet={imageBreakpoints.tablet} 
      />
      
      {/* Mobile */}
      <source 
        media="(max-width: 767px)" 
        srcSet={imageBreakpoints.mobile} 
      />
      
      {/* Fallback */}
      <OptimizedImage
        src={src}
        alt={alt}
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
        {...props}
      />
    </picture>
  );
};

// ===================================
// 🎮 CHARACTER IMAGE COMPONENT
// ===================================

/**
 * Specialized component for character images in the game
 */
export const CharacterImage: React.FC<{
  character: {
    id: number;
    name: string;
    type: 'common' | 'rare' | 'legendary';
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showRarity?: boolean;
  className?: string;
}> = ({
  character,
  size = 'md',
  showRarity = true,
  className = ''
}) => {
  const rarityEmojis = {
    common: '⚪',
    rare: '🟦', 
    legendary: '🟨'
  };

  const characterClasses = [
    'character-image',
    `character-${character.type}`,
    `size-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={characterClasses}>
      <AvatarImage
        src={character.avatar}
        alt={character.name}
        size={size}
        fallbackText={character.name}
        className="character-avatar"
      />
      
      {showRarity && (
        <div className="character-rarity">
          <span className="rarity-indicator">
            {rarityEmojis[character.type]}
          </span>
        </div>
      )}
    </div>
  );
};

// Default export
export default OptimizedImage;