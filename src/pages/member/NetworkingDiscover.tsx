import { useState } from 'react';
import { useStrategicMatches } from '@/hooks/useStrategicMatches';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { DiscoverMatchCard } from '@/components/networking/discover/DiscoverMatchCard';
import { DiscoverFilters } from '@/components/networking/discover/DiscoverFilters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const NetworkingDiscover = () => {
  const { user } = useAuth();
  const { matches, isLoading, error, refetch } = useStrategicMatches();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'opportunities' | 'partnerships' | 'knowledge'>('all');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateMatches = async () => {
    if (!user?.id || isRegenerating) return;
    
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-strategic-matches-v2',
        { body: { user_id: user.id, force_regenerate: true } }
      );
      
      if (error) throw error;
      
      toast.success('Matches regenerados!', {
        description: 'Novas conexões estratégicas foram criadas'
      });
      
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao regenerar:', error);
      toast.error('Erro ao regenerar matches', {
        description: error.message
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  useDynamicSEO({
    title: 'Descobrir Matches - Networking AI',
    description: 'Descubra conexões estratégicas personalizadas pela IA para impulsionar seu negócio.',
    keywords: 'matches, networking, IA, conexões, parcerias'
  });

  // Filtrar matches baseado no tipo selecionado
  const filteredMatches = matches?.filter(match => {
    if (selectedFilter === 'all') return true;
    
    const opportunities = match.opportunities || [];
    
    if (selectedFilter === 'opportunities') {
      return opportunities.some(opp => 
        opp.toLowerCase().includes('cliente') || 
        opp.toLowerCase().includes('venda') ||
        opp.toLowerCase().includes('comercial')
      );
    }
    
    if (selectedFilter === 'partnerships') {
      return opportunities.some(opp => 
        opp.toLowerCase().includes('parceria') || 
        opp.toLowerCase().includes('colaboração') ||
        opp.toLowerCase().includes('aliança')
      );
    }
    
    if (selectedFilter === 'knowledge') {
      return opportunities.some(opp => 
        opp.toLowerCase().includes('conhecimento') || 
        opp.toLowerCase().includes('expertise') ||
        opp.toLowerCase().includes('aprend')
      );
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header com Back e Actions */}
        <div className="flex items-center justify-between">
          <Link to="/networking">
            <Button variant="ghost" className="text-text-muted hover:text-aurora hover:bg-aurora/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRegenerateMatches}
            disabled={isRegenerating}
            className="border-border/50 hover:border-aurora/40 hover:bg-aurora/5"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerar Matches
          </Button>
        </div>

        {/* Header Principal */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-elevated to-surface border border-border/30 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-aurora/5 via-transparent to-viverblue/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-aurora/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-aurora/10 border border-aurora/20">
                <Sparkles className="w-6 h-6 text-aurora" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-aurora via-primary to-viverblue bg-clip-text text-transparent">
                Descobrir Matches
              </h1>
            </div>
            <p className="text-text-muted text-lg">
              Conexões estratégicas selecionadas pela IA especialmente para você
            </p>
          </div>
        </div>

        {/* Filtros */}
        <DiscoverFilters 
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          matchCount={filteredMatches?.length || 0}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-text-muted">Analisando matches estratégicos...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertDescription className="text-destructive">
              Erro ao carregar matches: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredMatches?.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-aurora/10 border border-aurora/20">
              <Sparkles className="w-8 h-8 text-aurora" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary">Nenhum match encontrado</h3>
            <p className="text-text-muted max-w-md mx-auto">
              {selectedFilter === 'all' 
                ? 'Complete seu onboarding para receber sugestões personalizadas.'
                : 'Tente ajustar os filtros para encontrar mais conexões.'}
            </p>
          </div>
        )}

        {/* Matches Grid */}
        {!isLoading && !error && filteredMatches && filteredMatches.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <DiscoverMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkingDiscover;
