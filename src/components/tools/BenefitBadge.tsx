
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BenefitType } from '@/types/toolTypes';
import { Gift, Trophy, Clock, Percent, Star } from 'lucide-react';

interface BenefitBadgeProps {
  type: BenefitType;
  className?: string;
}

export const BenefitBadge = ({ type, className = '' }: BenefitBadgeProps) => {
  // Configurações baseadas no tipo de benefício com melhor contraste
  const config = {
    discount: {
      text: 'Desconto',
      icon: <Percent className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-amber-100 text-amber-800 border-amber-400 hover:bg-amber-200' // Melhor contraste
    },
    exclusive: {
      text: 'Exclusivo',
      icon: <Trophy className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-purple-100 text-purple-800 border-purple-400 hover:bg-purple-200' // Melhor contraste
    },
    free: {
      text: 'Gratuito',
      icon: <Gift className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-green-100 text-green-800 border-green-400 hover:bg-green-200' // Melhor contraste
    },
    trial: {
      text: 'Trial',
      icon: <Clock className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-blue-100 text-blue-800 border-blue-400 hover:bg-blue-200' // Melhor contraste
    },
    other: {
      text: 'Benefício',
      icon: <Star className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-gray-100 text-gray-800 border-gray-400 hover:bg-gray-200' // Melhor contraste
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
