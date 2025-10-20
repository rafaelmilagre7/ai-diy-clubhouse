import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AdminButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
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
    ...props 
  }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'h-10 px-4 transition-smooth',
          'aurora-focus interactive-press',
          variant === 'default' && 'bg-aurora hover:bg-aurora-dark text-primary-foreground shadow-aurora/20',
          variant === 'outline' && 'border-aurora/30 text-aurora hover:bg-aurora/10',
          variant === 'ghost' && 'text-aurora hover:bg-aurora/10',
          className
        )}
        disabled={disabled || loading}
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