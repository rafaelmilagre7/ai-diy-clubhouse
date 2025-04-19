
import { BenefitType } from "@/types/toolTypes";
import { Badge } from "@/components/ui/badge";
import { Gift, Percent, Clock, Star, Tag } from "lucide-react";

interface BenefitBadgeProps {
  type: BenefitType;
  className?: string;
}

const getBenefitConfig = (type: BenefitType) => {
  switch (type) {
    case 'discount':
      return {
        icon: Percent,
        label: 'Desconto Exclusivo',
        className: 'bg-[#10b981] text-white'
      };
    case 'exclusive':
      return {
        icon: Star,
        label: 'Acesso Exclusivo',
        className: 'bg-purple-600 text-white'
      };
    case 'free':
      return {
        icon: Gift,
        label: 'Versão Gratuita',
        className: 'bg-blue-600 text-white'
      };
    case 'trial':
      return {
        icon: Clock,
        label: 'Trial Estendido',
        className: 'bg-orange-600 text-white'
      };
    default:
      return {
        icon: Tag,
        label: 'Benefício Especial',
        className: 'bg-gray-600 text-white'
      };
  }
};

export const BenefitBadge = ({ type, className }: BenefitBadgeProps) => {
  const config = getBenefitConfig(type);
  const Icon = config.icon;

  return (
    <Badge className={`flex items-center gap-1 ${config.className} ${className}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};
