import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles } from 'lucide-react';
import { Opportunity } from '@/hooks/networking/useOpportunities';
import { OpportunityCard } from './OpportunityCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface OpportunityFeedProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onViewDetails: (opportunity: Opportunity) => void;
  newOpportunityIds?: string[];
  onPostClick?: () => void;
}

export const OpportunityFeed: React.FC<OpportunityFeedProps> = ({
  opportunities,
  isLoading,
  onViewDetails,
  newOpportunityIds = [],
  onPostClick,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-4 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-lg loading-skeleton" />
              <Skeleton className="h-4 w-24 loading-skeleton" />
            </div>
            <Skeleton className="h-6 w-3/4 loading-skeleton" />
            <Skeleton className="h-20 w-full loading-skeleton" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 loading-skeleton" />
              <Skeleton className="h-6 w-20 loading-skeleton" />
            </div>
            <Skeleton className="h-10 w-full loading-skeleton" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Nenhuma oportunidade encontrada</h3>
            <p className="text-muted-foreground">
              Seja o primeiro a compartilhar uma oportunidade de negócio!
            </p>
          </div>

          {onPostClick && (
            <Button
              onClick={onPostClick}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Postar primeira oportunidade
            </Button>
          )}

          <div className="mt-8 p-4 bg-muted/30 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">
              💡 Dica: Compartilhe oportunidades de parcerias, clientes, fornecedores ou projetos inovadores
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {opportunities.map((opportunity, index) => (
        <motion.div
          key={opportunity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <OpportunityCard
            opportunity={opportunity}
            onViewDetails={onViewDetails}
            isNew={newOpportunityIds.includes(opportunity.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
