
import React from 'react';
import { useNetworkMatches } from '@/hooks/networking/useNetworkMatches';
import { NetworkMatchCard } from './NetworkMatchCard';
import { Card } from '@/components/ui/card';
import { Loader2, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGenerateMatches } from '@/hooks/networking/useNetworkingAdmin';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface NetworkingFeedProps {
  matchType: 'customer' | 'supplier';
}

export const NetworkingFeed: React.FC<NetworkingFeedProps> = ({
  matchType
}) => {
  const { data: matches, isLoading, error } = useNetworkMatches(matchType);
  const generateMatches = useGenerateMatches();
  const queryClient = useQueryClient();

  const handleRegenerateMatches = async () => {
    try {
      await generateMatches.mutateAsync({
        forceRegenerate: true
      });
      queryClient.invalidateQueries({ queryKey: ['network-matches'] });
      toast.success('Matches regenerados com sucesso!');
    } catch (error) {
      console.error('Erro ao regenerar matches:', error);
      toast.error('Erro ao regenerar matches. Tente novamente.');
    }
  };

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
        <p className="text-red-500 mb-4">Erro ao carregar matches.</p>
        <Button onClick={handleRegenerateMatches} disabled={generateMatches.isPending}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </Card>
    );
  }

  if (!matches || matches.length === 0) {
    const expectedCount = matchType === 'customer' ? 5 : 3;
    return (
      <Card className="p-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Nenhum match encontrado</h3>
        <p className="text-muted-foreground mb-4">
          {matchType === 'customer' 
            ? `Esperamos gerar ${expectedCount} potenciais clientes este mês.`
            : `Esperamos gerar ${expectedCount} potenciais fornecedores este mês.`
          }
        </p>
        <Button 
          onClick={handleRegenerateMatches} 
          disabled={generateMatches.isPending}
          className="gap-2"
        >
          {generateMatches.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Gerar Matches
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {matches.length} de {matchType === 'customer' ? '5' : '3'} matches mensais
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRegenerateMatches}
          disabled={generateMatches.isPending}
          className="gap-2"
        >
          {generateMatches.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Regenerar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <NetworkMatchCard 
            key={match.id} 
            match={match} 
            matchType={matchType}
          />
        ))}
      </div>
    </div>
  );
};
