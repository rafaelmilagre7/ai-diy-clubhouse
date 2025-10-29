import { forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { toast as sonnerToast } from 'sonner';
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

type Variant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

export interface ToastModernProps {
  title?: string;
  message: string;
  variant?: Variant;
  duration?: number;
  position?: Position;
  action?: ActionButton;
  onDismiss?: () => void;
  highlightTitle?: boolean;
  showProgress?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ToastModernRef {
  show: (props: ToastModernProps) => string | number;
  dismiss: (toastId: string | number) => void;
  updateProgress?: (toastId: string | number, progress: number, message?: string) => void;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-card border-border text-foreground',
  success: 'bg-card border-status-success/50 shadow-lg shadow-status-success/10',
  error: 'bg-card border-status-error/50 shadow-lg shadow-status-error/10',
  warning: 'bg-card border-status-warning/50 shadow-lg shadow-status-warning/10',
  info: 'bg-card border-status-info/50 shadow-lg shadow-status-info/10',
  loading: 'bg-card border-border shadow-lg',
};

const titleColor: Record<Variant, string> = {
  default: 'text-foreground',
  success: 'text-status-success',
  error: 'text-status-error',
  warning: 'text-status-warning',
  info: 'text-status-info',
  loading: 'text-foreground',
};

const iconColor: Record<Variant, string> = {
  default: 'text-muted-foreground',
  success: 'text-status-success',
  error: 'text-status-error',
  warning: 'text-status-warning',
  info: 'text-status-info',
  loading: 'text-primary',
};

const variantIcons: Record<Variant, React.ComponentType<{ className?: string }>> = {
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

export const ToastModern = forwardRef<ToastModernRef, { defaultPosition?: Position }>(
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
        icon: CustomIcon,
      }: ToastModernProps) {
        const Icon = CustomIcon || variantIcons[variant];

        const toastId = sonnerToast.custom(
          (toastId) => (
            <motion.div
              variants={toastAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                'flex items-center justify-between w-full max-w-md p-4 rounded-xl border backdrop-blur-sm',
                variantStyles[variant]
              )}
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon 
                  className={cn(
                    'h-5 w-5 mt-0.5 flex-shrink-0',
                    iconColor[variant],
                    variant === 'loading' && 'animate-spin'
                  )} 
                />
                <div className="space-y-1 flex-1 min-w-0">
                  {title && (
                    <h3
                      className={cn(
                        'text-sm font-semibold leading-tight',
                        highlightTitle ? titleColor['success'] : titleColor[variant]
                      )}
                    >
                      {title}
                    </h3>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed break-words">
                    {message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                {action && (
                  <Button
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => {
                      action.onClick();
                      sonnerToast.dismiss(toastId);
                    }}
                    className={cn(
                      'h-7 px-3 text-xs font-medium',
                      variant === 'success' && 'border-status-success/50 text-status-success hover:bg-status-success/10',
                      variant === 'error' && 'border-status-error/50 text-status-error hover:bg-status-error/10',
                      variant === 'warning' && 'border-status-warning/50 text-status-warning hover:bg-status-warning/10',
                      variant === 'info' && 'border-status-info/50 text-status-info hover:bg-status-info/10'
                    )}
                  >
                    {action.label}
                  </Button>
                )}

                {variant !== 'loading' && (
                  <button
                    onClick={() => {
                      sonnerToast.dismiss(toastId);
                      onDismiss?.();
                    }}
                    className="rounded-lg p-1.5 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Fechar notificação"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </motion.div>
          ),
          { duration: variant === 'loading' ? Infinity : duration, position }
        );

        return toastId;
      },
      dismiss(toastId: string | number) {
        sonnerToast.dismiss(toastId);
      },
    }));

    return null;
  }
);

ToastModern.displayName = 'ToastModern';
