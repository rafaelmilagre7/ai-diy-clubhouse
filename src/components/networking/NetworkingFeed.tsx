
import React from 'react';
import { useNetworkMatches } from '@/hooks/networking/useNetworkMatches';
import { NetworkMatchCard } from './NetworkMatchCard';
import { Card } from '@/components/ui/card';
import { Loader2, Users, RefreshCw, CheckCircle } from 'lucide-react';
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
  const { data: matches, isLoading, error, refetch } = useNetworkMatches(matchType);
  const generateMatches = useGenerateMatches();
  const queryClient = useQueryClient();

  const handleRegenerateMatches = async () => {
    try {
      console.log('🔄 Regenerando matches...');
      await generateMatches.mutateAsync({
        forceRegenerate: true
      });
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['network-matches'] });
      toast.success('Matches regenerados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao regenerar matches:', error);
      toast.error('Erro ao regenerar matches. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-viverblue" />
        <p className="text-muted-foreground">Carregando seus matches...</p>
        <p className="text-xs text-muted-foreground mt-2">
          Nossa IA está analisando os melhores perfis para você
        </p>
      </Card>
    );
  }

  if (error) {
    console.error('❌ Erro no componente NetworkingFeed:', error);
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <p className="font-medium">Erro ao carregar matches</p>
          <p className="text-sm mt-1">{error?.message || 'Erro desconhecido'}</p>
        </div>
        <Button onClick={handleRegenerateMatches} disabled={generateMatches.isPending} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>
      </Card>
    );
  }

  const expectedCount = matchType === 'customer' ? 5 : 3;

  if (!matches || matches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Nenhum match encontrado</h3>
        <p className="text-muted-foreground mb-4">
          {matchType === 'customer' 
            ? `Vamos gerar ${expectedCount} potenciais clientes para você este mês.`
            : `Vamos gerar ${expectedCount} potenciais fornecedores para você este mês.`
          }
        </p>
        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground">
            💡 Nossa IA precisa de mais dados para gerar matches perfeitos
          </p>
          <p className="text-xs text-muted-foreground">
            🔍 Verifique se seu perfil está completo para melhores resultados
          </p>
        </div>
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
          Gerar Matches Agora
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>
            {matches.length} de {expectedCount} matches mensais
          </span>
          {matches.length >= expectedCount && (
            <span className="text-green-600 font-medium">✨ Completo!</span>
          )}
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
          Atualizar
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

      {matches.length < expectedCount && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              🎯 Ainda estamos gerando {expectedCount - matches.length} matches adicionais para você
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
              Os matches são atualizados durante o mês conforme novos perfis são analisados
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
