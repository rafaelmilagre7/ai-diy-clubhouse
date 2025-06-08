
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface EnhancedFieldIndicatorProps {
  isValid?: boolean;
  isRequired?: boolean;
  message?: string;
  showSuccess?: boolean;
  className?: string;
}

export const EnhancedFieldIndicator = ({ 
  isValid, 
  isRequired, 
  message, 
  showSuccess = true,
  className = '' 
}: EnhancedFieldIndicatorProps) => {
  if (isValid && showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-1 ${className}`}
      >
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-xs text-green-400">Válido</span>
      </motion.div>
    );
  }

  if (isValid === false && message) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-1 ${className}`}
      >
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-xs text-red-400">{message}</span>
      </motion.div>
    );
  }

  if (isRequired) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Clock className="w-4 h-4 text-neutral-400" />
        <span className="text-xs text-neutral-400">Obrigatório</span>
      </div>
    );
  }

  return null;
};
