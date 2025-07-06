import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trophy, Star, Zap, Target, Sparkles } from 'lucide-react';

export interface Badge {
  id: string;
  type: 'milestone' | 'achievement' | 'streak' | 'special';
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'zap' | 'target' | 'sparkles';
  color: 'gold' | 'silver' | 'bronze' | 'viverblue' | 'green';
  earned: boolean;
  progress?: number; // 0-100 for progress badges
}

interface GamificationBadgeProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  sparkles: Sparkles,
};

const colorMap = {
  gold: {
    bg: 'from-yellow-400 to-yellow-600',
    border: 'border-yellow-400/50',
    shadow: 'shadow-yellow-400/25',
    text: 'text-yellow-400',
  },
  silver: {
    bg: 'from-slate-300 to-slate-500',
    border: 'border-slate-400/50',
    shadow: 'shadow-slate-400/25',
    text: 'text-slate-400',
  },
  bronze: {
    bg: 'from-orange-400 to-orange-600',
    border: 'border-orange-400/50',
    shadow: 'shadow-orange-400/25',
    text: 'text-orange-400',
  },
  viverblue: {
    bg: 'from-viverblue to-viverblue-light',
    border: 'border-viverblue/50',
    shadow: 'shadow-viverblue/25',
    text: 'text-viverblue',
  },
  green: {
    bg: 'from-green-400 to-green-600',
    border: 'border-green-400/50',
    shadow: 'shadow-green-400/25',
    text: 'text-green-400',
  },
};

const sizeMap = {
  sm: {
    container: 'w-12 h-12',
    icon: 'w-6 h-6',
    text: 'text-xs',
  },
  md: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
    text: 'text-sm',
  },
  lg: {
    container: 'w-20 h-20',
    icon: 'w-10 h-10',
    text: 'text-base',
  },
};

export const GamificationBadge: React.FC<GamificationBadgeProps> = ({
  badge,
  size = 'md',
  showProgress = false,
  animated = true,
  onClick
}) => {
  const IconComponent = iconMap[badge.icon];
  const colors = colorMap[badge.color];
  const sizes = sizeMap[size];

  const badgeContent = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-300",
        sizes.container,
        badge.earned
          ? [
              `bg-gradient-to-br ${colors.bg}`,
              colors.border,
              `shadow-lg ${colors.shadow}`,
              onClick && "cursor-pointer hover:scale-110"
            ]
          : [
              "bg-slate-700/30 border border-slate-600",
              "grayscale opacity-50",
              onClick && "cursor-pointer hover:opacity-70"
            ]
      )}
      onClick={onClick}
    >
      <IconComponent 
        className={cn(
          sizes.icon,
          badge.earned ? "text-white" : "text-slate-500"
        )} 
      />
      
      {/* Progress ring for progress badges */}
      {showProgress && badge.progress !== undefined && (
        <svg
          className="absolute inset-0 transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-600"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${badge.progress * 2.83} 283`}
            className={colors.text}
          />
        </svg>
      )}

      {/* Shine effect for earned badges */}
      {badge.earned && animated && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
    </div>
  );

  return animated && badge.earned ? (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: 0.2 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {badgeContent}
    </motion.div>
  ) : (
    badgeContent
  );
};

// Predefined badge sets
export const createProfileBadges = (data: any): Badge[] => [
  {
    id: 'profile-started',
    type: 'milestone',
    title: 'Primeira Impressão',
    description: 'Iniciou seu perfil personalizado',
    icon: 'sparkles',
    color: 'bronze',
    earned: !!data.name,
  },
  {
    id: 'professional-info',
    type: 'milestone', 
    title: 'Profissional',
    description: 'Compartilhou seu contexto de trabalho',
    icon: 'target',
    color: 'silver',
    earned: !!(data.position && data.businessSector),
  },
  {
    id: 'ai-explorer',
    type: 'achievement',
    title: 'Explorador de IA',
    description: 'Revelou sua experiência com IA',
    icon: 'zap',
    color: 'viverblue',
    earned: !!data.aiKnowledgeLevel,
  },
  {
    id: 'goal-setter',
    type: 'achievement',
    title: 'Visionário',
    description: 'Definiu objetivos claros',
    icon: 'star',
    color: 'green',
    earned: !!data.mainObjective,
  },
  {
    id: 'profile-master',
    type: 'special',
    title: 'Perfil Completo',
    description: 'Completou 100% do perfil!',
    icon: 'trophy',
    color: 'gold',
    earned: !!(data.name && data.position && data.aiKnowledgeLevel && data.mainObjective && data.weeklyLearningTime),
  },
];