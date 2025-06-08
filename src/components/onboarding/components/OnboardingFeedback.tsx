
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface OnboardingFeedbackProps {
  type: 'error' | 'success' | 'info' | 'loading';
  message: string;
  details?: string;
  show: boolean;
  onClose?: () => void;
}

export const OnboardingFeedback = ({ 
  type, 
  message, 
  details, 
  show,
  onClose 
}: OnboardingFeedbackProps) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'success':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Alert variant={getVariant()} className="mb-4">
            {getIcon()}
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">{message}</p>
                {details && (
                  <p className="text-sm text-muted-foreground">{details}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
