import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HelpCircle, Info, Lightbulb, AlertCircle } from 'lucide-react';

interface TooltipContent {
  title?: string;
  description: string;
  examples?: string[];
  tips?: string[];
}

interface IntelligentTooltipProps {
  content: TooltipContent;
  children: React.ReactNode;
  type?: 'info' | 'help' | 'tip' | 'warning';
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  triggerClassName?: string;
  showIcon?: boolean;
  adaptive?: boolean; // Tooltip que muda baseado no contexto
}

const iconMap = {
  info: Info,
  help: HelpCircle,
  tip: Lightbulb,
  warning: AlertCircle
};

const colorMap = {
  info: 'text-viverblue',
  help: 'text-blue-500',
  tip: 'text-yellow-500',
  warning: 'text-orange-500'
};

export const IntelligentTooltip: React.FC<IntelligentTooltipProps> = ({
  content,
  children,
  type = 'info',
  position = 'top',
  delay = 300,
  className,
  triggerClassName,
  showIcon = true,
  adaptive = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const Icon = iconMap[type];

  useEffect(() => {
    if (isVisible && adaptive && containerRef.current && tooltipRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // Verificar se precisa ajustar posição
      if (position === 'top' && container.top - tooltip.height < 10) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && container.bottom + tooltip.height > viewport.height - 10) {
        newPosition = 'top';
      } else if (position === 'left' && container.left - tooltip.width < 10) {
        newPosition = 'right';
      } else if (position === 'right' && container.right + tooltip.width > viewport.width - 10) {
        newPosition = 'left';
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position, adaptive]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    const baseClasses = "absolute z-50 max-w-sm";
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return baseClasses;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute w-2 h-2 transform rotate-45";
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 -mt-1 bg-popover border-r border-b border-border`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 -mb-1 bg-popover border-l border-t border-border`;
      case 'left':
        return `${baseClasses} left-full top-1/2 -translate-y-1/2 -ml-1 bg-popover border-t border-r border-border`;
      case 'right':
        return `${baseClasses} right-full top-1/2 -translate-y-1/2 -mr-1 bg-popover border-b border-l border-border`;
      default:
        return baseClasses;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("tooltip-container relative inline-block", triggerClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-1">
        {children}
        {showIcon && (
          <Icon className={cn("h-4 w-4", colorMap[type])} />
        )}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            getPositionClasses(),
            "tooltip-content bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-4",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            className
          )}
        >
          {/* Arrow */}
          <div className={getArrowClasses()} />
          
          {/* Content */}
          <div className="space-y-2">
            {content.title && (
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Icon className={cn("h-4 w-4", colorMap[type])} />
                {content.title}
              </h4>
            )}
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.description}
            </p>
            
            {content.examples && content.examples.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Exemplos:</p>
                <ul className="text-xs space-y-1">
                  {content.examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-viverblue mt-0.5">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {content.tips && content.tips.length > 0 && (
              <div className="space-y-1 border-t border-border pt-2">
                <p className="text-xs font-medium text-viverblue flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Dicas:
                </p>
                <ul className="text-xs space-y-1">
                  {content.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};