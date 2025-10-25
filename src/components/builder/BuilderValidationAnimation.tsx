import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface BuilderValidationAnimationProps {
  status: 'validating' | 'success' | 'error' | 'loading-questions';
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
        className="flex flex-col items-center gap-6 px-8 py-12 max-w-2xl"
      >
        {/* Animação geométrica elegante */}
        {(status === 'validating' || status === 'loading-questions') && (
          <div className="relative w-32 h-32">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: 'transparent',
                  borderTopColor: status === 'loading-questions' 
                    ? 'hsl(142 76% 36%)' 
                    : 'hsl(var(--aurora-primary))',
                  borderRightColor: status === 'loading-questions'
                    ? 'hsl(142 76% 36% / 0.5)'
                    : 'hsl(var(--aurora-primary) / 0.5)',
                }}
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  rotate: { duration: status === 'loading-questions' ? 2 + i : 3 + i, repeat: Infinity, ease: "linear" },
                  scale: { duration: status === 'loading-questions' ? 1.5 + i * 0.5 : 2 + i * 0.5, repeat: Infinity },
                  opacity: { duration: status === 'loading-questions' ? 1.5 + i * 0.5 : 2 + i * 0.5, repeat: Infinity }
                }}
              />
            ))}
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="p-8 rounded-full bg-gradient-to-br from-status-success/20 to-status-success/5 border-2 border-status-success/30"
          >
            <CheckCircle className="h-16 w-16 text-status-success" />
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="p-8 rounded-full bg-gradient-to-br from-status-error/20 to-status-error/5 border-2 border-status-error/30"
          >
            <XCircle className="h-16 w-16 text-status-error" />
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

          {status === 'loading-questions' && (
            <>
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                Gerando perguntas de qualificação
              </motion.h3>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-sm"
              >
                Preparando as perguntas certas para sua solução
              </motion.p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-status-success mb-2"
              >
                Sua ideia é viável!
              </motion.h3>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-sm"
              >
                Vamos começar a qualificação da sua solução
              </motion.p>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-status-error mb-2"
              >
                Ideia não viável
              </motion.h3>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-sm max-w-lg text-left leading-relaxed"
              >
                {message || 'Infelizmente, não é possível desenvolver esse projeto usando IA no nosso fluxo atual'}
              </motion.p>
            </>
          )}
        </div>

        {/* Barra de progresso para validating e loading-questions */}
        {(status === 'validating' || status === 'loading-questions') && (
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
