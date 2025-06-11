
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

interface AIMessageDisplayProps {
  message: string;
  isLoading?: boolean;
}

export const AIMessageDisplay: React.FC<AIMessageDisplayProps> = ({
  message,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-viverblue/20 p-2 rounded-full">
            <Bot className="w-5 h-5 text-viverblue animate-pulse" />
          </div>
          <Sparkles className="w-4 h-4 text-viverblue animate-pulse" />
          <span className="text-sm font-semibold text-viverblue">IA VIVER DE IA</span>
        </div>
        
        <div className="space-y-3">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-300/30 rounded w-full"></div>
            <div className="h-4 bg-slate-300/30 rounded w-5/6"></div>
            <div className="h-4 bg-slate-300/30 rounded w-4/6"></div>
          </div>
          <p className="text-sm text-slate-400 text-center">
            Analisando seu perfil e gerando mensagem personalizada...
          </p>
        </div>
      </motion.div>
    );
  }

  // Verificar se message existe e não é vazio antes de processar
  if (!message || typeof message !== 'string') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-viverblue/20 p-2 rounded-full">
            <Bot className="w-5 h-5 text-viverblue" />
          </div>
          <Sparkles className="w-4 h-4 text-viverblue" />
          <span className="text-sm font-semibold text-viverblue">IA VIVER DE IA</span>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="leading-relaxed text-slate-100">
            Aguardando mensagem...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="bg-viverblue/20 p-2 rounded-full">
          <Bot className="w-5 h-5 text-viverblue" />
        </div>
        <Sparkles className="w-4 h-4 text-viverblue animate-pulse" />
        <span className="text-sm font-semibold text-viverblue">IA VIVER DE IA</span>
      </div>
      
      <div className="prose prose-slate max-w-none">
        {message.split('\n\n').map((paragraph, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="leading-relaxed text-slate-100 mb-4 last:mb-0"
          >
            {paragraph}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
};
