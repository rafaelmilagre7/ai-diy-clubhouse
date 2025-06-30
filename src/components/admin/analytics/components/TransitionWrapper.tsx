
import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransitionWrapperProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingSkeleton?: ReactNode;
  className?: string;
  animationType?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
};

export const TransitionWrapper = ({
  children,
  isLoading = false,
  loadingSkeleton,
  className = '',
  animationType = 'fade',
  duration = 0.3
}: TransitionWrapperProps) => {
  const animation = animations[animationType];

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          {...animation}
          transition={{ duration }}
          className={className}
        >
          {loadingSkeleton || (
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          {...animation}
          transition={{ duration }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const TabTransition = ({ 
  children, 
  tabKey, 
  className = '' 
}: {
  children: ReactNode;
  tabKey: string;
  className?: string;
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
