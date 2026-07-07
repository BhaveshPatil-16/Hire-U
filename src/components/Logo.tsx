import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  textColor?: string;
}

export function LogoIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 hover:scale-105`}
    >
      <defs>
        {/* Left figure gradient: rich purple/lavender */}
        <linearGradient id="leftPurpleGrad" x1="26" y1="20" x2="44" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="60%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>

        {/* Right figure gradient: light teal/cyan */}
        <linearGradient id="rightTealGrad" x1="74" y1="20" x2="56" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="60%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>

        {/* Subtle drop shadow for depth in the handshake overlap */}
        <filter id="handshakeShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="-0.8" dy="1" stdDeviation="0.8" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Left Person Head */}
      <circle cx="34" cy="20" r="7.5" fill="url(#leftPurpleGrad)" />

      {/* Right Person Head */}
      <circle cx="66" cy="20" r="7.5" fill="url(#rightTealGrad)" />

      {/* Left Person Body & Arm forming left side of H */}
      <path
        d="M 26 36 
           C 26 31.5, 30 28, 35 28 
           C 40 28, 42 31.5, 42 36 
           V 45 
           C 42 45, 51.5 45, 53.5 45
           C 55.5 45, 55.5 48.5, 53.5 49
           C 51.5 49.5, 42 49.5, 42 49.5
           V 68
           C 42 72.5, 40 75, 35 75
           C 30 75, 26 72.5, 26 68
           V 36 Z"
        fill="url(#leftPurpleGrad)"
      />

      {/* Right Person Body & Arm forming right side of H */}
      <path
        d="M 74 36
           C 74 31.5, 70 28, 65 28
           C 60 28, 58 31.5, 58 36
           V 47.5
           C 58 47.5, 48.5 47.5, 46.5 47.5
           C 44.5 47.5, 44.5 51, 46.5 51.5
           C 48.5 52, 58 52, 58 52
           V 68
           C 58 72.5, 60 75, 65 75
           C 70 75, 74 72.5, 74 68
           V 36 Z"
        fill="url(#rightTealGrad)"
      />

      {/* Interlocking hand shake overlay detail */}
      <path
        d="M 48 45.5 C 50.5 45.5, 52 46.5, 52 48.5 C 52 50.5, 50.5 51.5, 48 51.5"
        stroke="url(#leftPurpleGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#handshakeShadow)"
      />
      <path
        d="M 52 47.5 C 49.5 47.5, 48 48.5, 48 50.5 C 48 52.5, 49.5 53.5, 52 53.5"
        stroke="url(#rightTealGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Logo({
  size = 36,
  className = '',
  showText = true,
  textSize = 'xl',
  textColor = 'text-slate-900',
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <div className="flex flex-col justify-center select-none">
          <span className={`font-display font-extrabold tracking-tight leading-none ${sizeClasses[textSize]} ${textColor}`}>
            Hire-<span className="text-teal-500">U</span>
          </span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 font-sans">
            Connect • Grow • Succeed
          </span>
        </div>
      )}
    </div>
  );
}
