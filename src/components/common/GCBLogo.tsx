import React, { useState } from 'react';

interface GCBLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const GCBLogo: React.FC<GCBLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeDimensions = {
    xs: { h: 'h-6', w: 'w-6', img: 'h-6 max-w-[120px]' },
    sm: { h: 'h-8', w: 'w-8', img: 'h-8 max-w-[150px]' },
    md: { h: 'h-10', w: 'w-10', img: 'h-10 max-w-[180px]' },
    lg: { h: 'h-14', w: 'w-14', img: 'h-14 max-w-[220px]' },
    xl: { h: 'h-20', w: 'w-20', img: 'h-20 max-w-[300px]' },
  }[size] || { h: 'h-10', w: 'w-10', img: 'h-10 max-w-[180px]' };

  return (
    <div className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      {!imgError ? (
        <img
          src="/gcb-logo.png"
          alt="GCB Bank Logo"
          className={`${sizeDimensions.img} w-auto object-contain drop-shadow-xs`}
          loading="eager"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`relative ${sizeDimensions.h} ${sizeDimensions.w} rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-md border border-amber-400/40 text-white font-black text-xs tracking-wider`}>
          GCB
        </div>
      )}
    </div>
  );
};
