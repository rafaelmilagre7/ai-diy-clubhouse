import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
  ripple?: boolean;
  children: React.ReactNode;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glowing = true,
  ripple = true,
  className,
  children,
  onClick,
  disabled,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const variantClasses = {
    primary: 'gradient-networking text-white hover:[box-shadow:var(--shadow-glow-networking)]',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:[box-shadow:var(--shadow-glow-secondary)]',
    success: 'gradient-knowledge text-white hover:[box-shadow:var(--shadow-glow-knowledge)]',
    danger: 'gradient-commercial text-white hover:[box-shadow:var(--shadow-glow-commercial)]'
  };

  const sizeClasses = {
    sm: 'px-md py-sm text-sm rounded-lg',
    md: 'px-lg py-md text-base rounded-xl',
    lg: 'px-xl py-md text-lg rounded-2xl'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={cn(
        'relative overflow-hidden font-semibold',
        'transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
        variantClasses[variant],
        sizeClasses[size],
        glowing && 'glow-effect',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {ripple && ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute w-4 h-4 bg-white/50 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 8,
            top: ripple.y - 8,
            animation: 'ripple 0.6s ease-out'
          }}
        />
      ))}
      <span className="relative z-10 flex items-center justify-center gap-sm">
        {children}
      </span>
    </button>
  );
};
