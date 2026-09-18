import React from 'react';

export default function Logo({ size = 'default', className = '' }) {
  // Size presets tailored for the 3:1 logo aspect ratio
  const sizeClasses = {
    small: 'h-8 max-w-[140px]',
    default: 'h-12 max-w-[200px]',
    large: 'h-16 max-w-[260px]',
  };

  const selectedClass = sizeClasses[size] || sizeClasses.default;

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/vyaparmitra-logo.png"
        alt="VyaparMitra — Business Together For A Brighter Tomorrow"
        className={`${selectedClass} w-auto object-contain drop-shadow-2xs`}
        loading="eager"
      />
    </div>
  );
}
