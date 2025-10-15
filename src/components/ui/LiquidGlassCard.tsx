import React from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'commercial' | 'partnership' | 'knowledge';
  hoverable?: boolean;
  glowBorder?: boolean;
  onClick?: () => void;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className,
  variant = 'default',
  hoverable = true,
  glowBorder = false,
  onClick
}) => {
  const variantClasses = {
    default: 'liquid-glass-card',
    premium: 'liquid-glass-card-premium',
    commercial: 'liquid-glass-card glow-border-pink',
    partnership: 'liquid-glass-card glow-border-blue',
    knowledge: 'liquid-glass-card glow-border-green'
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        hoverable && 'cursor-pointer transition-all duration-200 hover:shadow-lg',
        glowBorder && 'glow-border',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};
