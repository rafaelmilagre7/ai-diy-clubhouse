import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Brain } from 'lucide-react';

interface BuilderValidationAnimationProps {
  status: 'validating' | 'success' | 'error';
  message?: string;
}

export const BuilderValidationAnimation: React.FC<BuilderValidationAnimationProps> = ({ 
  status,
  message 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="flex flex-col items-center gap-6 px-8 py-12 max-w-md"
      >
        {/* Ícone animado */}
        {status === 'validating' && (
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
            className="p-8 rounded-full bg-gradient-to-br from-aurora-primary/20 to-aurora-primary/5 border-2 border-aurora-primary/30"
          >
            <Brain className="h-16 w-16 text-aurora-primary" />
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="p-8 rounded-full bg-gradient-to-br from-green-500/20 to-green-400/5 border-2 border-green-500/30"
          >
            <CheckCircle className="h-16 w-16 text-green-500" />
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="p-8 rounded-full bg-gradient-to-br from-red-500/20 to-red-400/5 border-2 border-red-500/30"
          >
            <XCircle className="h-16 w-16 text-red-500" />
          </motion.div>
        )}

        {/* Texto */}
        <div className="text-center">
          {status === 'validating' && (
            <>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Analisando viabilidade...
              </h3>
              <p className="text-muted-foreground text-sm">
                Verificando se sua ideia pode ser executada com IA
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-green-500 mb-2"
              >
                Ideia validada com sucesso! ✨
              </motion.h3>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-sm"
              >
                {message || 'Sua ideia é viável e pode ser implementada com IA'}
              </motion.p>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-red-500 mb-2"
              >
                Ideia não viável
              </motion.h3>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-sm"
              >
                {message || 'Infelizmente, não é possível desenvolver esse projeto usando IA no nosso fluxo atual'}
              </motion.p>
            </>
          )}
        </div>

        {/* Barra de progresso para validating */}
        {status === 'validating' && (
          <motion.div 
            className="w-full h-1 bg-surface-elevated rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-aurora-primary to-cyan-400"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
