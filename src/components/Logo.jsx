import React from 'react';

export default function Logo({ size = 'default', className = '' }) {
  if (size === 'icon') {
    return (
      <div className={`flex items-center justify-center select-none ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-[#123B78] flex items-center justify-center shadow-xs">
          <span className="font-extrabold text-white text-base tracking-tighter">
            V<span className="text-[#10B8A5]">M</span>
          </span>
        </div>
      </div>
    );
  }

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
