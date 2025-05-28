
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, CheckCircle, WifiOff } from 'lucide-react';

interface AutoSaveFeedbackProps {
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  lastSaveTime?: number | null;
  isOnline?: boolean;
}

export const AutoSaveFeedback: React.FC<AutoSaveFeedbackProps> = ({ 
  isSaving = false,
  hasUnsavedChanges = false,
  lastSaveTime = null,
  isOnline = true
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (isSaving || hasUnsavedChanges || !isOnline) {
      setShowFeedback(true);
    } else if (lastSaveTime) {
      setShowFeedback(true);
      // Esconder após 3 segundos se salvo com sucesso
      const timer = setTimeout(() => setShowFeedback(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, hasUnsavedChanges, lastSaveTime, isOnline]);

  const getFeedbackContent = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Sem conexão - dados serão salvos quando reconectar',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10'
      };
    }

    if (isSaving) {
      return {
        icon: Loader,
        text: 'Salvando alterações...',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        spin: true
      };
    }

    if (lastSaveTime && !hasUnsavedChanges) {
      return {
        icon: CheckCircle,
        text: `Salvo às ${new Date(lastSaveTime).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10'
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: CheckCircle,
        text: 'Alterações não salvas',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10'
      };
    }

    return null;
  };

  const content = getFeedbackContent();

  if (!content || !showFeedback) return null;

  const Icon = content.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${content.bgColor} ${content.color} border border-current/20`}
      >
        <Icon 
          className={`h-3 w-3 ${content.spin ? 'animate-spin' : ''}`} 
        />
        <span>{content.text}</span>
      </motion.div>
    </AnimatePresence>
  );
};
