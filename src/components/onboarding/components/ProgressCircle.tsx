import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  animate?: boolean;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  animate = true
}) => {
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center",
        animate && "progress-circle animate",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        className="progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          className="progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="hsl(var(--viverblue))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: animate ? 'stroke-dashoffset 0.8s ease-in-out' : 'none'
          }}
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className={cn(
              "font-bold text-gradient",
              size > 80 ? "text-xl" : "text-lg"
            )}
          >
            {Math.round(normalizedPercentage)}%
          </span>
        </div>
      )}
    </div>
  );
};