import { useState, useEffect } from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, isAfter, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Opportunity } from '@/hooks/networking/useOpportunities';
import { Briefcase, Package, Users, TrendingUp, Target, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
  isNew?: boolean;
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

export const OpportunityCard = ({ opportunity, onViewDetails, onEdit, onDelete, isNew }: OpportunityCardProps) => {
  const { user } = useAuth();
  const config = typeConfig[opportunity.opportunity_type];
  const Icon = config.icon;
  const author = opportunity.profiles;
  const isRecentlyCreated = isAfter(new Date(opportunity.created_at), subHours(new Date(), 24));
  const isOwner = user?.id === opportunity.user_id;
  
  // Badge "NOVA" com timeout de 30 segundos
  const [showNewBadge, setShowNewBadge] = useState(isNew || isRecentlyCreated);

  useEffect(() => {
    if (showNewBadge) {
      const timer = setTimeout(() => {
        setShowNewBadge(false);
      }, 30000); // 30 segundos

      return () => clearTimeout(timer);
    }
  }, [showNewBadge]);

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={isNew ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <LiquidGlassCard 
        variant="default" 
        hoverable={true}
        className="p-6 cursor-pointer group hover:border-primary/30 relative"
        onClick={() => onViewDetails(opportunity)}
      >
        {showNewBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute top-3 right-3 z-10"
          >
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none shadow-lg shadow-emerald-500/30">
              NOVA
            </Badge>
          </motion.div>
        )}
        
        {/* Dropdown de ações (apenas para o dono) */}
        {isOwner && onEdit && onDelete && (
          <div className="absolute top-3 right-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(opportunity);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(opportunity);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
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
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
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
        <div className="flex items-center justify-between pt-4 border-t border-border">
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
            variant="default"
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
    </motion.div>
  );
};
