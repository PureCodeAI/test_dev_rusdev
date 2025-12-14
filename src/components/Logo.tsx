import React from 'react';
import logoImage from '@/1.png';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  return (
    <img 
      src={logoImage} 
      alt="BizForge" 
      width={size} 
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default Logo;

