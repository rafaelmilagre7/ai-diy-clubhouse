
import React from 'react';
import { CheckCircle, Clock, AlertCircle, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedAutoSaveFeedbackProps {
  isSaving?: boolean;
  lastSaveTime?: number | null;
  hasUnsavedChanges?: boolean;
  saveError?: string | null;
  retryCount?: number;
  onRetry?: () => void;
}

export const EnhancedAutoSaveFeedback: React.FC<EnhancedAutoSaveFeedbackProps> = ({
  isSaving = false,
  lastSaveTime = null,
  hasUnsavedChanges = false,
  saveError = null,
  retryCount = 0,
  onRetry
}) => {
  const getStatus = () => {
    if (saveError) {
      return {
        icon: AlertCircle,
        message: `Erro ao salvar${retryCount > 0 ? ` (tentativa ${retryCount})` : ''}`,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        showRetry: true
      };
    }

    if (isSaving) {
      return {
        icon: Clock,
        message: 'Salvando alterações...',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        showRetry: false
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: WifiOff,
        message: 'Alterações não salvas',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        showRetry: false
      };
    }

    if (lastSaveTime) {
      const timeDiff = Date.now() - lastSaveTime;
      const secondsAgo = Math.floor(timeDiff / 1000);
      
      let timeMessage = '';
      if (secondsAgo < 5) {
        timeMessage = 'Salvo agora';
      } else if (secondsAgo < 60) {
        timeMessage = `Salvo há ${secondsAgo}s`;
      } else {
        const minutesAgo = Math.floor(secondsAgo / 60);
        if (minutesAgo < 60) {
          timeMessage = `Salvo há ${minutesAgo}m`;
        } else {
          const hoursAgo = Math.floor(minutesAgo / 60);
          timeMessage = `Salvo há ${hoursAgo}h`;
        }
      }

      return {
        icon: CheckCircle,
        message: timeMessage,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        showRetry: false
      };
    }

    return null;
  };

  const status = getStatus();

  if (!status) return null;

  const Icon = status.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-sm
          ${status.bgColor} ${status.color} ${status.borderColor}
          text-sm font-medium shadow-lg
        `}
      >
        <div className="flex items-center gap-2">
          {isSaving ? (
            <Clock className="w-4 h-4 animate-spin" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
          <span>{status.message}</span>
        </div>
        
        {status.showRetry && onRetry && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRetry}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Tentar salvar novamente"
          >
            <RotateCcw className="w-3 h-3" />
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
