
import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AutoSaveFeedbackProps {
  isSaving?: boolean;
  lastSaveTime?: number | null;
  hasUnsavedChanges?: boolean;
}

export const AutoSaveFeedback: React.FC<AutoSaveFeedbackProps> = ({
  isSaving = false,
  lastSaveTime = null,
  hasUnsavedChanges = false
}) => {
  const getStatus = () => {
    if (isSaving) {
      return {
        icon: Clock,
        message: 'Salvando...',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10'
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: AlertCircle,
        message: 'Alterações não salvas',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10'
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
        timeMessage = `Salvo há ${minutesAgo}m`;
      }

      return {
        icon: CheckCircle,
        message: timeMessage,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10'
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
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          ${status.bgColor} ${status.color} border-current/20
          backdrop-blur-sm text-xs font-medium
        `}
      >
        <Icon className="w-3 h-3" />
        <span>{status.message}</span>
      </motion.div>
    </AnimatePresence>
  );
};
