import React, { useState, useRef, useCallback } from 'react';

/**
 * TiltCard: High-performance 3D interactive tilt container with dynamic specular sheen.
 * Leverages CSS 3D transforms (perspective, rotateX, rotateY, translateZ) and specular lighting.
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 12,
  perspective = 1000,
  glare = true,
  scale = 1.015,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setStyle({
      transform: `perspective(${perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
      boxShadow: `${(-rotY * 2).toFixed(1)}px ${(rotX * 2 + 18).toFixed(1)}px 32px rgba(15, 23, 42, 0.10), 0 4px 12px rgba(15, 23, 42, 0.05)`,
      transition: 'transform 0.08s ease-out, box-shadow 0.08s ease-out',
      transformStyle: 'preserve-3d',
    });

    if (glare) {
      setGlareStyle({
        opacity: 0.65,
        background: `radial-gradient(circle 320px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 75%)`,
        transition: 'opacity 0.15s ease-out',
      });
    }
  }, [maxTilt, perspective, glare, scale]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
      transition: 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.45s ease',
      transformStyle: 'preserve-3d',
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.4s ease',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={style}
      className={`relative preserve-3d transition-transform ${className}`}
      {...props}
    >
      {glare && (
        <div
          className="sheen-overlay z-30"
          style={glareStyle}
        />
      )}
      <div className="relative z-10 w-full h-full preserve-3d">
        {children}
      </div>
    </div>
  );
}
