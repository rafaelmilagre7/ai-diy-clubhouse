
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkMatches } from '@/hooks/networking/useNetworkMatches';
import { useNetworkingAccess } from '@/hooks/networking/useNetworkingAccess';
import { NetworkMatchCard } from './NetworkMatchCard';
import { NetworkingBlockedState } from './NetworkingBlockedState';
import { Card } from '@/components/ui/card';
import { Loader2, Users, RefreshCw, CheckCircle, PieChart, Zap } from 'lucide-react';
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
  const navigate = useNavigate();
  const { hasAccess, isLoading: accessLoading, needsOnboarding } = useNetworkingAccess();
  const { data: matches, isLoading, error, refetch } = useNetworkMatches(matchType);
  const generateMatches = useGenerateMatches();
  const queryClient = useQueryClient();

  const handleNavigateToOnboarding = () => {
    navigate('/onboarding-new');
  };

  const handleRegenerateMatches = async () => {
    try {
      toast.loading('Analisando perfis com IA...', {
        duration: 3000,
      });
      
      await generateMatches.mutateAsync({
        forceRegenerate: true
      });
      
      // Aguardar um pouco para a operação concluir
      setTimeout(async () => {
        await refetch();
        queryClient.invalidateQueries({ queryKey: ['network-matches'] });
        toast.success('Matches regenerados com IA!');
      }, 1000);
    } catch (error) {
      toast.error('Erro ao regenerar matches. Tente novamente.');
    }
  };

  // Se ainda está carregando verificação de acesso
  if (accessLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-viverblue" />
        <p className="text-muted-foreground">Verificando acesso...</p>
      </Card>
    );
  }

  // Se não tem acesso (onboarding incompleto) - PARA TODOS OS USUÁRIOS
  if (!hasAccess && needsOnboarding) {
    return <NetworkingBlockedState onNavigateToOnboarding={handleNavigateToOnboarding} />;
  }

  const expectedCount = matchType === 'customer' ? 5 : 3;

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

  if (!matches || matches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="bg-neutral-800/60 border border-neutral-700/40 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <Zap className="h-10 w-10 text-viverblue opacity-70" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Seu networking inteligente</h3>
        <p className="text-muted-foreground mb-4">
          {matchType === 'customer' 
            ? `Nossa IA gerará ${expectedCount} potenciais clientes compatíveis com seu perfil.`
            : `Nossa IA gerará ${expectedCount} potenciais fornecedores compatíveis com seu perfil.`
          }
        </p>
        <div className="space-y-2 mb-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 bg-neutral-800/50 border border-neutral-700/40 rounded-md p-3 text-left">
            <PieChart className="h-5 w-5 text-viverblue" />
            <div className="text-sm">
              <p className="font-medium">Análise de compatibilidade com IA</p>
              <p className="text-xs text-neutral-500 mt-0.5">Avaliamos múltiplos fatores para oferecer os melhores matches</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleRegenerateMatches} 
          disabled={generateMatches.isPending}
          className="gap-2 bg-viverblue hover:bg-viverblue/90"
        >
          {generateMatches.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Gerar Matches com IA Agora
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
            <Zap className="h-3 w-3" />
          )}
          Regenerar com IA
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
              🎯 A IA está analisando mais {expectedCount - matches.length} perfis compatíveis para você
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
              Os matches são atualizados durante o mês conforme novos perfis são analisados pela IA
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
