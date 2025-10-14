import { OpportunityCard } from './OpportunityCard';
import { Opportunity } from '@/hooks/networking/useOpportunities';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

interface OpportunityFeedProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onViewDetails: (opportunity: Opportunity) => void;
}

export const OpportunityFeed = ({ opportunities, isLoading, onViewDetails }: OpportunityFeedProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-4 p-6 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-16 w-full" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhuma oportunidade encontrada</h3>
        <p className="text-muted-foreground max-w-md">
          Seja o primeiro a postar uma oportunidade de negócio! Clique em "Postar Oportunidade" para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.id}
          opportunity={opportunity}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
