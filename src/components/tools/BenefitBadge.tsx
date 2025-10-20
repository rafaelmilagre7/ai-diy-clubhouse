
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BenefitType } from '@/types/toolTypes';
import { Gift, Trophy, Clock, Percent, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BenefitBadgeProps {
  type: BenefitType;
  className?: string;
}

export const BenefitBadge = ({ type, className = '' }: BenefitBadgeProps) => {
  // Configurações baseadas no tipo de benefício com melhor contraste para modo escuro
  const config = {
    discount: {
      text: 'Desconto',
      icon: <Percent className="h-3 w-3 mr-1" />,
      baseClassName: 'badge-dark-warning' // Contraste melhorado para modo escuro
    },
    exclusive: {
      text: 'Exclusivo',
      icon: <Trophy className="h-3 w-3 mr-1" />,
      baseClassName: 'bg-strategy/40 text-strategy-light border-strategy' // Contraste melhorado
    },
    free: {
      text: 'Gratuito',
      icon: <Gift className="h-3 w-3 mr-1" />,
      baseClassName: 'badge-dark-success' // Contraste melhorado para modo escuro
    },
    trial: {
      text: 'Trial',
      icon: <Clock className="h-3 w-3 mr-1" />,
      baseClassName: 'badge-dark-info' // Contraste melhorado para modo escuro
    },
    other: {
      text: 'Benefício',
      icon: <Star className="h-3 w-3 mr-1" />,
      baseClassName: 'badge-dark-neutral' // Contraste melhorado para modo escuro
    }
  };

  const { text, icon, baseClassName } = config[type];

  return (
    <Badge 
      variant="outline" 
      className={cn(`text-xs flex items-center font-medium ${baseClassName}`, className)}
    >
      {icon}
      {text}
    </Badge>
  );
};
