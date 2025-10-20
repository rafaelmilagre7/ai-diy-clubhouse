
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  isVisible?: boolean;
  showLoader?: boolean;
  loadingDelay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  isVisible = true,
  showLoader = true,
  loadingDelay = 300
}) => {
  const [showLoading, setShowLoading] = useState(false);
  
  // Mostrar loading apenas após um curto delay para evitar flashes
  useEffect(() => {
    let timer: number | null = null;
    
    if (!isVisible && showLoader) {
      timer = window.setTimeout(() => {
        setShowLoading(true);
      }, loadingDelay);
    } else {
      setShowLoading(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, showLoader, loadingDelay]);
  
  return (
    <div className="relative min-h-transition">
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
        
        {!isVisible && showLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <Loader2 className="h-6 w-6 text-viverblue animate-spin" />
            <span className="mt-2 text-sm text-muted-foreground">Carregando...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
