
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X, Sparkles } from 'lucide-react';

interface CustomToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
}

export const CustomToast: React.FC<CustomToastProps> = ({
  type,
  title,
  description,
  action,
  onClose
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
  };

  const colors = {
    success: 'from-green-500 to-emerald-500',
    error: 'from-red-500 to-pink-500',
    info: 'from-blue-500 to-cyan-500',
    warning: 'from-orange-500 to-yellow-500'
  };

  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-orange-50 border-orange-200'
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`
        relative overflow-hidden rounded-2xl backdrop-blur-lg border shadow-2xl max-w-md w-full
        ${backgrounds[type]}
      `}
    >
      {/* Animated gradient background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${colors[type]} opacity-5`}
        animate={{ 
          x: [-100, 100, -100],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`p-2 rounded-xl bg-gradient-to-br ${colors[type]} text-white shadow-lg`}
          >
            <Icon className="h-5 w-5" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.h4
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="font-bold text-gray-900 text-sm"
            >
              {title}
            </motion.h4>
            
            {description && (
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-gray-600 mt-1"
              >
                {description}
              </motion.p>
            )}

            {action && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3"
              >
                {action}
              </motion.div>
            )}
          </div>

          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-200/50 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      <motion.div
        className={`h-1 bg-gradient-to-r ${colors[type]}`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4, ease: "linear" }}
      />
    </motion.div>
  );
};

// Enhanced toast functions
export const enhancedToast = {
  success: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast
        type="success"
        title={title}
        description={description}
        onClose={() => toast.dismiss(t)}
      />
    ));
  },

  error: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast
        type="error"
        title={title}
        description={description}
        onClose={() => toast.dismiss(t)}
      />
    ));
  },

  info: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast
        type="info"
        title={title}
        description={description}
        onClose={() => toast.dismiss(t)}
      />
    ));
  },

  voting: (action: 'upvote' | 'downvote') => {
    const title = action === 'upvote' ? 'Voto de apoio registrado!' : 'Voto registrado!';
    const description = action === 'upvote' 
      ? 'Obrigado por apoiar esta sugestão!' 
      : 'Seu feedback foi registrado.';

    toast.custom((t) => (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative"
      >
        <CustomToast
          type={action === 'upvote' ? 'success' : 'info'}
          title={title}
          description={description}
          onClose={() => toast.dismiss(t)}
        />
        
        {/* Celebratory particles for upvotes */}
        {action === 'upvote' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: `${50 + Math.cos((i * 45) * Math.PI / 180) * 100}%`,
                  y: `${50 + Math.sin((i * 45) * Math.PI / 180) * 100}%`,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    ));
  }
};
