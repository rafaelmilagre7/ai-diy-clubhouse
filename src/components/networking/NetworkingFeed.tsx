
import React from 'react';
import { useNetworkMatches } from '@/hooks/networking/useNetworkMatches';
import { NetworkMatchCard } from './NetworkMatchCard';
import { Card } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';

interface NetworkingFeedProps {
  matchType: 'customer' | 'supplier';
  filters: {
    sector: string;
    companySize: string;
    location: string;
    status: string;
  };
}

export const NetworkingFeed: React.FC<NetworkingFeedProps> = ({
  matchType,
  filters
}) => {
  const { data: matches, isLoading, error } = useNetworkMatches(matchType);

  // Aplicar filtros localmente
  const filteredMatches = matches?.filter(match => {
    if (filters.status !== 'all' && match.status !== filters.status) return false;
    
    // Implementar outros filtros baseados nos dados do usuário matched
    // Por enquanto, mantemos todos os matches
    return true;
  }) || [];

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando matches...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-500">Erro ao carregar matches. Tente novamente.</p>
      </Card>
    );
  }

  if (filteredMatches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Nenhum match encontrado</h3>
        <p className="text-muted-foreground">
          {matchType === 'customer' 
            ? 'Não há potenciais clientes disponíveis no momento.'
            : 'Não há potenciais fornecedores disponíveis no momento.'
          }
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMatches.map((match) => (
        <NetworkMatchCard 
          key={match.id} 
          match={match} 
          matchType={matchType}
        />
      ))}
    </div>
  );
};
