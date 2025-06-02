
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  gradient?: 'blue' | 'purple' | 'green' | 'orange';
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  className = '',
  delay = 0,
  gradient = 'blue'
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const gradientClasses = {
    blue: 'from-blue-50/30 via-white/20 to-cyan-50/30 border-blue-200/30',
    purple: 'from-purple-50/30 via-white/20 to-pink-50/30 border-purple-200/30',
    green: 'from-green-50/30 via-white/20 to-emerald-50/30 border-green-200/30',
    orange: 'from-orange-50/30 via-white/20 to-yellow-50/30 border-orange-200/30'
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className={`
        relative overflow-hidden rounded-2xl backdrop-blur-lg bg-gradient-to-br
        ${gradientClasses[gradient]}
        border shadow-xl hover:shadow-2xl
        transition-all duration-500 ease-out
        ${className}
      `}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            animate={{
              y: [0, -100],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${20 + i * 30}%`,
              top: '100%'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
