
import React from 'react';
import { CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FieldValidation } from '@/hooks/onboarding/useRealtimeValidation';

interface RealtimeFieldValidationProps {
  validation: FieldValidation;
  showSuccess?: boolean;
  className?: string;
}

export const RealtimeFieldValidation: React.FC<RealtimeFieldValidationProps> = ({
  validation,
  showSuccess = true,
  className = ""
}) => {
  const getValidationDisplay = () => {
    if (!validation.isRequired && !validation.hasValue) {
      return {
        icon: Info,
        message: 'Campo opcional',
        color: 'text-gray-400',
        show: false // Não mostrar para campos opcionais vazios
      };
    }

    if (!validation.hasValue && validation.isRequired) {
      return {
        icon: Clock,
        message: 'Campo obrigatório',
        color: 'text-gray-400',
        show: true
      };
    }

    if (validation.hasValue && !validation.isValid) {
      return {
        icon: AlertCircle,
        message: validation.error || 'Valor inválido',
        color: 'text-red-400',
        show: true
      };
    }

    if (validation.hasValue && validation.isValid && showSuccess) {
      return {
        icon: CheckCircle,
        message: 'Válido',
        color: 'text-green-400',
        show: true
      };
    }

    return { show: false };
  };

  const display = getValidationDisplay();

  if (!display.show) return null;

  const Icon = display.icon!;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 text-xs mt-1 ${display.color} ${className}`}
      >
        <Icon className="w-3 h-3" />
        <span>{display.message}</span>
      </motion.div>
    </AnimatePresence>
  );
};
