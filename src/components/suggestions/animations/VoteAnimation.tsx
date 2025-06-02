
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

interface VoteAnimationProps {
  type: 'upvote' | 'downvote';
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const VoteAnimation: React.FC<VoteAnimationProps> = ({
  type,
  isActive,
  onClick,
  disabled = false
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    setIsClicked(true);
    onClick(e);
    setTimeout(() => setIsClicked(false), 600);
  };

  const Icon = type === 'upvote' ? ThumbsUp : ThumbsDown;
  const baseColor = type === 'upvote' ? 'text-green-600' : 'text-red-600';
  const activeColor = type === 'upvote' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300';

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative p-2 rounded-lg border transition-all duration-200
        ${isActive 
          ? activeColor 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <motion.div
        animate={isClicked ? { 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ duration: 0.4, type: "spring" }}
      >
        <Icon className={`h-4 w-4 ${isActive ? 'text-current' : baseColor}`} />
      </motion.div>

      {/* Particles Animation - Simplified */}
      <AnimatePresence>
        {isClicked && type === 'upvote' && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-green-400"
                initial={{ 
                  opacity: 1,
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i * 120) * Math.PI / 180) * 20,
                  y: Math.sin((i * 120) * Math.PI / 180) * 20
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Success Sparkle */}
      <AnimatePresence>
        {isClicked && type === 'upvote' && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Sparkles className="h-3 w-3 text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
