
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BenefitType } from '@/types/toolTypes';
import { Gift, Trophy, Clock, Percent, Star } from 'lucide-react';

interface BenefitBadgeProps {
  type: BenefitType;
  className?: string;
}

export const BenefitBadge = ({ type, className = '' }: BenefitBadgeProps) => {
  // Configurações baseadas no tipo de benefício para o tema escuro
  const config = {
    discount: {
      text: 'Desconto',
      icon: <Percent className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-amber-900/30 text-amber-300 border-amber-700/50 hover:bg-amber-800/40'
    },
    exclusive: {
      text: 'Exclusivo',
      icon: <Trophy className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-purple-900/30 text-purple-300 border-purple-700/50 hover:bg-purple-800/40'
    },
    free: {
      text: 'Gratuito',
      icon: <Gift className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-green-900/30 text-green-300 border-green-700/50 hover:bg-green-800/40'
    },
    trial: {
      text: 'Trial',
      icon: <Clock className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-blue-900/30 text-blue-300 border-blue-700/50 hover:bg-blue-800/40'
    },
    other: {
      text: 'Benefício',
      icon: <Star className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-gray-900/30 text-gray-300 border-gray-700/50 hover:bg-gray-800/40'
    }
  };

  const { text, icon, baseClassName } = config[type];

  return (
    <Badge 
      variant="outline" 
      className={`text-xs flex items-center ${baseClassName} ${className}`}
    >
      {icon}
      {text}
    </Badge>
  );
};
