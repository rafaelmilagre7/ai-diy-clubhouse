
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageTransitionWithFallbackProps {
  children: React.ReactNode;
  className?: string;
  isVisible?: boolean;
  fallbackTimeout?: number;
  fallbackMessage?: string;
  onRetry?: () => void;
}

export const PageTransitionWithFallback: React.FC<PageTransitionWithFallbackProps> = ({
  children,
  className,
  isVisible = true,
  fallbackTimeout = 500,
  fallbackMessage = "Carregando conteúdo...",
  onRetry
}) => {
  const [showFallback, setShowFallback] = useState(false);
  const [contentFailedToLoad, setContentFailedToLoad] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Se o conteúdo deve estar visível, mas não apareceu após o timeout, mostrar fallback
    let fallbackTimer: number | null = null;
    
    if (isVisible) {
      fallbackTimer = window.setTimeout(() => {
        setShowFallback(true);
      }, fallbackTimeout);
      
      // Timeout mais longo para considerar falha no carregamento
      const failureTimer = window.setTimeout(() => {
        setContentFailedToLoad(true);
      }, fallbackTimeout * 6); // 3 segundos
      
      return () => {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        clearTimeout(failureTimer);
      };
    } else {
      setShowFallback(false);
      setContentFailedToLoad(false);
    }
  }, [isVisible, fallbackTimeout]);
  
  // Se o conteúdo demorar muito para carregar, dar ao usuário a opção de retry
  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Navigate to dashboard em vez de reload
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-content-min w-full">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={cn("w-full", className)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Fallback quando o conteúdo demora para aparecer */}
      <AnimatePresence>
        {!isVisible && showFallback && (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <Loader2 className="h-8 w-8 text-viverblue animate-spin mb-4" />
            <p className="text-center text-muted-foreground">{fallbackMessage}</p>
            
            {contentFailedToLoad && (
              <div className="mt-4">
                <p className="text-sm text-red-500 mb-2">
                  O conteúdo está demorando para carregar.
                </p>
                <button
                  onClick={handleReload}
                  className="px-4 py-2 text-sm bg-viverblue text-white rounded-md hover:bg-viverblue/90"
                >
                  Ir para Dashboard
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
