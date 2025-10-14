import { useState } from 'react';
import { useStrategicMatches } from '@/hooks/useStrategicMatches';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';
import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { DiscoverMatchCard } from '@/components/networking/discover/DiscoverMatchCard';
import { DiscoverFilters } from '@/components/networking/discover/DiscoverFilters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NetworkingDiscover = () => {
  const { matches, isLoading, error } = useStrategicMatches();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'opportunities' | 'partnerships' | 'knowledge'>('all');

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
        {/* Back Button */}
        <Link to="/networking">
          <Button variant="ghost" className="aurora-text-gradient hover:bg-aurora/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Networking
          </Button>
        </Link>

        {/* Header Aurora */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-elevated border border-aurora/20 p-8 shadow-aurora">
          <div className="absolute inset-0 aurora-gradient opacity-5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-aurora/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-aurora" />
              <h1 className="text-3xl font-bold aurora-text-gradient">Descobrir Matches</h1>
            </div>
            <p className="text-text-muted">
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
