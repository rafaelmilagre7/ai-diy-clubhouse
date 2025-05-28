
import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AutoSaveFeedbackProps {
  isSaving?: boolean;
  lastSaveTime?: number | null;
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
  hasError?: boolean;
}

export const AutoSaveFeedback: React.FC<AutoSaveFeedbackProps> = ({ 
  isSaving, 
  lastSaveTime,
  hasUnsavedChanges = false,
  isOnline = true,
  hasError = false
}) => {
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Mostrar mensagem "salvo" temporariamente após salvar
  useEffect(() => {
    if (!isSaving && lastSaveTime) {
      setShowSavedMessage(true);
      const timer = setTimeout(() => {
        setShowSavedMessage(false);
      }, 2000); // Mostrar por 2 segundos
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaveTime]);

  // Não mostrar nada se não estiver salvando e não tiver mensagem para mostrar
  if (!isSaving && !showSavedMessage && !hasError) return null;

  return (
    <AnimatePresence>
      {(isSaving || showSavedMessage || hasError) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50"
        >
          {hasError ? (
            <>
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-red-400">Erro ao salvar</span>
            </>
          ) : isSaving ? (
            <>
              <Loader className="h-3 w-3 animate-spin text-viverblue" />
              <span className="text-gray-300">Salvando...</span>
            </>
          ) : showSavedMessage && lastSaveTime ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.3 }}
              >
                <CheckCircle className="h-3 w-3 text-green-500" />
              </motion.div>
              <span className="text-green-400">Salvo</span>
            </>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
