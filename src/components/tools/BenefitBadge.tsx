
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BenefitType } from '@/types/toolTypes';
import { Gift, Trophy, Clock, Percent, Star } from 'lucide-react';

interface BenefitBadgeProps {
  type: BenefitType;
  className?: string;
}

export const BenefitBadge = ({ type, className = '' }: BenefitBadgeProps) => {
  // Configurações baseadas no tipo de benefício
  const config = {
    discount: {
      text: 'Desconto',
      icon: <Percent className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
    },
    exclusive: {
      text: 'Exclusivo',
      icon: <Trophy className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
    },
    free: {
      text: 'Gratuito',
      icon: <Gift className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
    },
    trial: {
      text: 'Trial',
      icon: <Clock className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
    },
    other: {
      text: 'Benefício',
      icon: <Star className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
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
