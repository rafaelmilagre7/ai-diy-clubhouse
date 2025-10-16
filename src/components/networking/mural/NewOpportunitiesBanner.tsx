import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewOpportunitiesBannerProps {
  count: number;
  onViewClick: () => void;
  onDismiss: () => void;
}

export const NewOpportunitiesBanner: React.FC<NewOpportunitiesBannerProps> = ({
  count,
  onViewClick,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss após 10 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-gradient-to-r from-emerald-500/95 to-green-600/95 backdrop-blur-xl border border-emerald-400/30 shadow-2xl shadow-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">
                  🎉 {count} {count === 1 ? 'Nova oportunidade' : 'Novas oportunidades'}!
                </h3>
                <p className="text-emerald-50 text-xs mt-0.5">
                  {count === 1 ? 'Foi adicionada' : 'Foram adicionadas'} ao marketplace
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={onViewClick}
                  className="bg-white/20 hover:bg-white/30 text-white border-none text-xs h-8 px-3"
                >
                  Ver agora
                </Button>
                <button
                  onClick={handleDismiss}
                  className="text-white/70 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
