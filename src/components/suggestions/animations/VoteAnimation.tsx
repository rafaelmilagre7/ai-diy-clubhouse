
import React from 'react';
import { motion } from 'framer-motion';

interface VoteAnimationProps {
  children: React.ReactNode;
  isVoting?: boolean;
}

export const VoteAnimation: React.FC<VoteAnimationProps> = ({ 
  children, 
  isVoting = false 
}) => {
  return (
    <motion.div
      animate={isVoting ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};
