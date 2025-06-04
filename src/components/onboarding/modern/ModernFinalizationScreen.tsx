
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface ModernFinalizationScreenProps {
  isCompleting: boolean;
  retryCount: number;
  onFinish: () => void;
}

export const ModernFinalizationScreen: React.FC<ModernFinalizationScreenProps> = ({
  isCompleting,
  retryCount,
  onFinish
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Finalizando Configuração
          </h1>
          <p className="text-xl text-gray-300 max-w-lg mx-auto">
            Estamos processando suas informações para personalizar sua experiência na plataforma
          </p>
        </motion.div>

        {/* Progress Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          <div className="relative">
            {/* Main Circle */}
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
              {isCompleting ? (
                <Loader2 className="h-16 w-16 text-white animate-spin" />
              ) : (
                <CheckCircle className="h-16 w-16 text-white" />
              )}
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 max-w-md mx-auto">
              {['Salvando dados pessoais', 'Configurando perfil', 'Liberando acesso'].map((step, index) => (
                <div key={step} className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: isCompleting 
                          ? index < 2 ? "100%" : "60%" 
                          : "100%" 
                      }}
                      transition={{ 
                        delay: 0.6 + (index * 0.3), 
                        duration: 0.8,
                        ease: "easeOut"
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-300 min-w-0 flex-shrink-0">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Status Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-4"
        >
          {isCompleting && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                <div>
                  <p className="text-blue-400 font-medium">Finalizando configuração...</p>
                  <p className="text-blue-300 text-sm">
                    Salvando suas informações e liberando acesso às funcionalidades
                  </p>
                </div>
              </div>
            </div>
          )}

          {retryCount > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                Tentativa {retryCount}/3 - Processando novamente...
              </p>
            </div>
          )}

          {!isCompleting && (
            <motion.button
              onClick={onFinish}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Finalizar Configuração
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          )}
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-8"
        >
          <p className="text-gray-500 text-sm">
            Este processo pode levar alguns segundos. Por favor, não feche esta página.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
