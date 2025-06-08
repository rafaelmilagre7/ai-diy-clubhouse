
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

interface AIMessageDisplayProps {
  message: string;
}

export const AIMessageDisplay = ({ message }: AIMessageDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="bg-viverblue/20 p-2 rounded-full">
          <Bot className="w-5 h-5 text-viverblue" />
        </div>
        <Sparkles className="w-4 h-4 text-viverblue animate-pulse" />
        <span className="text-sm font-semibold text-viverblue">IA VIVER DE IA</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {message}
      </p>
    </motion.div>
  );
};
