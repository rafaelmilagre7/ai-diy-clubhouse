
import React from 'react';
import { motion } from 'framer-motion';

interface MilagrinhoAssistantProps {
  userName: string;
  message: string;
}

const MilagrinhoAssistant: React.FC<MilagrinhoAssistantProps> = ({ userName, message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-viverblue/20 to-purple-600/20 rounded-2xl p-6 mb-8 border border-viverblue/30"
    >
      <div className="flex items-start space-x-4">
        <div className="bg-viverblue rounded-full p-3 flex-shrink-0">
          <div className="text-2xl">🤖</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white">Milagrinho</h3>
            <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            <span className="text-viverblue font-medium">{userName}</span>, {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MilagrinhoAssistant;
