import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AdminButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  size?: 'sm' | 'default' | 'lg';
}

/**
 * Botão padrão do admin com estados de loading e ícones
 * Implementa o design system Aurora
 */
export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ 
    children, 
    className, 
    icon, 
    loading = false, 
    loadingText = 'Carregando...', 
    disabled,
    variant = 'default',
    size = 'default',
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      default: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg'
    };

    return (
      <Button
        ref={ref}
        className={cn(
          sizeClasses[size],
          'transition-smooth aurora-focus',
          variant === 'default' && 'bg-aurora-primary hover:bg-aurora-primary-dark text-primary-foreground shadow-lg shadow-aurora-primary/20',
          variant === 'outline' && 'border-aurora-primary/30 text-aurora-primary hover:bg-aurora-primary/10 hover:border-aurora-primary/50',
          variant === 'ghost' && 'text-aurora-primary hover:bg-aurora-primary/10',
          variant === 'destructive' && 'bg-destructive hover:bg-destructive/90',
          className
        )}
        disabled={disabled || loading}
        variant={variant}
        {...props}
      >
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : icon ? (
            <span className="h-4 w-4 flex items-center justify-center">
              {icon}
            </span>
          ) : null}
          
          <span>
            {loading ? loadingText : children}
          </span>
        </div>
      </Button>
    );
  }
);

AdminButton.displayName = 'AdminButton';