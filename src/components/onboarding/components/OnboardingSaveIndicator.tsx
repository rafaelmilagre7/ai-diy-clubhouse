
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Cloud, CloudOff, Loader2, AlertTriangle } from 'lucide-react';

interface OnboardingSaveIndicatorProps {
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  syncStatus: {
    isSyncing: boolean;
    lastSyncTime: string | null;
    syncError: string | null;
  };
}

export const OnboardingSaveIndicator: React.FC<OnboardingSaveIndicatorProps> = ({
  hasUnsavedChanges,
  lastSaved,
  syncStatus
}) => {
  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (syncStatus.syncError) {
      return <CloudOff className="w-4 h-4 text-orange-500" />;
    }
    
    if (hasUnsavedChanges) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    
    if (lastSaved) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    return <Cloud className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Salvando...';
    }
    
    if (syncStatus.syncError) {
      return 'Salvo localmente';
    }
    
    if (hasUnsavedChanges) {
      return 'Salvo ao avançar etapa';
    }
    
    if (lastSaved) {
      const timeAgo = Math.round((Date.now() - lastSaved.getTime()) / 1000);
      if (timeAgo < 60) {
        return 'Salvo agora';
      } else if (timeAgo < 3600) {
        return `Salvo há ${Math.round(timeAgo / 60)}min`;
      } else {
        return `Salvo há ${Math.round(timeAgo / 3600)}h`;
      }
    }
    
    return 'Não salvo';
  };

  const shouldShow = hasUnsavedChanges || syncStatus.isSyncing || lastSaved || syncStatus.syncError;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 flex items-center space-x-2 text-sm">
            {getStatusIcon()}
            <span className="text-gray-700 dark:text-gray-300">
              {getStatusText()}
            </span>
            {syncStatus.syncError && (
              <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
