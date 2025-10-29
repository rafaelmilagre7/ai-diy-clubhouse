'use client'

import { forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import {
  toast as sonnerToast,
} from 'sonner';
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ToastModernVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastModernPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastModernActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface ToastModernProps {
  title?: string;
  message: string;
  variant?: ToastModernVariant;
  duration?: number;
  position?: ToastModernPosition;
  action?: ToastModernActionButton;
  onDismiss?: () => void;
  highlightTitle?: boolean;
}

export interface ToastModernRef {
  show: (props: ToastModernProps) => string | number;
  dismiss: (toastId: string | number) => void;
}

const variantStyles: Record<ToastModernVariant, string> = {
  default: 'bg-card border-border text-foreground shadow-md',
  success: 'bg-gradient-to-br from-operational/10 via-card to-card border-operational/50 shadow-lg shadow-operational/10',
  error: 'bg-gradient-to-br from-status-error/10 via-card to-card border-status-error/50 shadow-lg shadow-status-error/10',
  warning: 'bg-gradient-to-br from-status-warning/10 via-card to-card border-status-warning/50 shadow-lg shadow-status-warning/10',
  info: 'bg-gradient-to-br from-status-info/10 via-card to-card border-status-info/50 shadow-lg shadow-status-info/10',
  loading: 'bg-gradient-to-br from-aurora-primary/10 via-card to-card border-aurora-primary/50 shadow-lg shadow-aurora-primary/10',
};

const titleColor: Record<ToastModernVariant, string> = {
  default: 'text-foreground',
  success: 'text-operational',
  error: 'text-status-error',
  warning: 'text-status-warning',
  info: 'text-status-info',
  loading: 'text-aurora-primary',
};

const iconColor: Record<ToastModernVariant, string> = {
  default: 'text-muted-foreground',
  success: 'text-operational',
  error: 'text-status-error',
  warning: 'text-status-warning',
  info: 'text-status-info',
  loading: 'text-aurora-primary',
};

const variantIcons: Record<ToastModernVariant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const toastAnimation = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 50, scale: 0.95 },
};

export const ToastModern = forwardRef<ToastModernRef, { defaultPosition?: ToastModernPosition }>(
  ({ defaultPosition = 'bottom-right' }, ref) => {
    useImperativeHandle(ref, () => ({
      show({
        title,
        message,
        variant = 'default',
        duration = 4000,
        position = defaultPosition,
        action,
        onDismiss,
        highlightTitle,
      }) {
        const Icon = variantIcons[variant];
        const isLoading = variant === 'loading';

        return sonnerToast.custom(
          (toastId) => (
            <motion.div
              variants={toastAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                'flex items-center justify-between w-full max-w-sm p-3 rounded-xl border shadow-lg',
                variantStyles[variant]
              )}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Icon 
                  className={cn(
                    'h-4 w-4 mt-0.5 flex-shrink-0', 
                    iconColor[variant],
                    isLoading && 'animate-spin'
                  )} 
                />
                <div className="space-y-0.5 flex-1 min-w-0">
                  {title && (
                    <h3
                      className={cn(
                        'text-sm font-semibold leading-none',
                        highlightTitle ? titleColor['success'] : titleColor[variant]
                      )}
                    >
                      {title}
                    </h3>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed break-words">{message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {action?.label && (
                  <Button
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => {
                      action.onClick();
                      sonnerToast.dismiss(toastId);
                    }}
                    className={cn(
                      'cursor-pointer h-7 px-2 text-xs transition-all duration-300',
                      variant === 'success'
                        ? 'text-operational border-operational hover:bg-operational/10'
                        : variant === 'error'
                        ? 'text-status-error border-status-error hover:bg-status-error/10'
                        : variant === 'warning'
                        ? 'text-status-warning border-status-warning hover:bg-status-warning/10'
                        : variant === 'info'
                        ? 'text-status-info border-status-info hover:bg-status-info/10'
                        : 'text-foreground border-border hover:bg-muted/10'
                    )}
                  >
                    {action.label}
                  </Button>
                )}

                {!isLoading && (
                  <button
                    onClick={() => {
                      sonnerToast.dismiss(toastId);
                      onDismiss?.();
                    }}
                    className="rounded-full p-1 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Fechar notificação"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </motion.div>
          ),
          { duration: isLoading ? Infinity : duration, position }
        );
      },
      dismiss(toastId) {
        sonnerToast.dismiss(toastId);
      },
    }));

    return null;
  }
);

ToastModern.displayName = 'ToastModern';
