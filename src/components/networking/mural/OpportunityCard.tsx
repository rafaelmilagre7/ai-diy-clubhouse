import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Opportunity } from '@/hooks/networking/useOpportunities';
import { Briefcase, Package, Users, TrendingUp, Target } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: (opportunity: Opportunity) => void;
}

const typeConfig = {
  parceria: {
    label: 'Parceria',
    icon: Users,
    colors: 'bg-viverblue/10 text-viverblue border-viverblue/30',
  },
  fornecedor: {
    label: 'Fornecedor',
    icon: Package,
    colors: 'bg-operational/10 text-operational border-operational/30',
  },
  cliente: {
    label: 'Cliente',
    icon: Briefcase,
    colors: 'bg-aurora/10 text-aurora border-aurora/30',
  },
  investimento: {
    label: 'Investimento',
    icon: TrendingUp,
    colors: 'bg-revenue/10 text-revenue border-revenue/30',
  },
  outro: {
    label: 'Outro',
    icon: Target,
    colors: 'bg-strategy/10 text-strategy border-strategy/30',
  },
};

export const OpportunityCard = ({ opportunity, onViewDetails }: OpportunityCardProps) => {
  const config = typeConfig[opportunity.opportunity_type];
  const Icon = config.icon;
  const author = opportunity.profiles;

  return (
    <LiquidGlassCard 
      variant="default" 
      hoverable={true}
      className="p-6 cursor-pointer group relative overflow-hidden"
      onClick={() => onViewDetails(opportunity)}
    >
      {/* Blob decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute w-32 h-32 bg-aurora/3 rounded-full blur-2xl -top-10 -right-10 group-hover:bg-aurora/5 transition-all duration-500" />
      </div>
      
      <div className="space-y-4">
        {/* Header com tipo */}
        <div className="flex items-start justify-between gap-3">
          <Badge variant="outline" className={`${config.colors} border flex items-center gap-1.5 px-3 py-1`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(opportunity.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>

        {/* Título e descrição */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-aurora transition-colors">
            {opportunity.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {opportunity.description}
          </p>
        </div>

        {/* Tags */}
        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {opportunity.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {opportunity.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{opportunity.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer com autor e botão */}
        <div className="flex items-center justify-between pt-4 border-t border-aurora/10">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={author?.avatar_url || ''} alt={author?.name || 'Usuário'} />
              <AvatarFallback className="text-xs">
                {(author?.name || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{author?.name || 'Usuário'}</span>
              {author?.company_name && (
                <span className="text-xs text-muted-foreground truncate">{author.company_name}</span>
              )}
            </div>
          </div>

          <Button
            variant="aurora"
            size="sm"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(opportunity);
            }}
          >
            Ver mais
          </Button>
        </div>
      </div>
    </LiquidGlassCard>
  );
};
