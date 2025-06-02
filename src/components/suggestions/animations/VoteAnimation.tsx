
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

interface VoteAnimationProps {
  type: 'upvote' | 'downvote';
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const VoteAnimation: React.FC<VoteAnimationProps> = ({
  type,
  isActive,
  onClick,
  disabled = false
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setIsClicked(true);
    onClick();
    setTimeout(() => setIsClicked(false), 600);
  };

  const Icon = type === 'upvote' ? ThumbsUp : ThumbsDown;
  const baseColor = type === 'upvote' ? 'text-green-600' : 'text-red-600';
  const activeColor = type === 'upvote' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative p-3 rounded-xl border-2 transition-all duration-300
        ${isActive 
          ? `${activeColor} border-current shadow-lg` 
          : 'bg-white/50 backdrop-blur-sm border-gray-200 hover:border-gray-300 hover:bg-white/70'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <motion.div
        animate={isClicked ? { 
          scale: [1, 1.3, 1],
          rotate: [0, 10, -10, 0]
        } : {}}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <Icon className={`h-5 w-5 ${isActive ? 'text-current' : baseColor}`} />
      </motion.div>

      {/* Particles Animation */}
      <AnimatePresence>
        {isClicked && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${type === 'upvote' ? 'bg-green-400' : 'bg-red-400'}`}
                initial={{ 
                  opacity: 1,
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i * 60) * Math.PI / 180) * 30,
                  y: Math.sin((i * 60) * Math.PI / 180) * 30
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
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
        {isClicked && (
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
