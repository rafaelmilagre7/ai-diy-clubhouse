import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { MatchesGrid } from '@/components/networking/MatchesGrid';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';
import { NetworkingErrorBoundary } from '@/components/networking/NetworkingErrorBoundary';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Crown, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
import { usePremiumUpgradeModal } from '@/hooks/usePremiumUpgradeModal';
import { PremiumUpgradeModal } from '@/components/ui/premium-upgrade-modal';

const Networking = () => {
  const { hasFeatureAccess } = useFeatureAccess();
  const { modalState, showUpgradeModal, hideUpgradeModal } = usePremiumUpgradeModal();
  
  useDynamicSEO({
    title: 'Networking AI - Networking Inteligente',
    description: 'Encontre parcerias estratégicas e oportunidades de negócios com nossa IA especializada em networking empresarial.',
    keywords: 'networking AI, parcerias, IA, conexões empresariais, business matching'
  });

  // Por enquanto, assumindo que networking não tem restrições (pode ajustar depois)
  const hasAccess = hasFeatureAccess('networking') !== false; // Default true se não definido
  
  const handleClick = () => {
    if (!hasAccess) {
      showUpgradeModal('networking');
    }
  };

  return (
    <>
      <NetworkingErrorBoundary>
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
            <div className="container mx-auto py-8 space-y-8">
              {/* Header com glassmorphism */}
              <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-8 shadow-2xl shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
                <div className="relative">
                  <NetworkingHeader />
                </div>
              </div>
              
              {!hasAccess ? (
                <div 
                  className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 min-h-[500px] cursor-pointer"
                  onClick={handleClick}
                >
                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center space-y-3">
                      <div className="p-3 bg-gradient-to-r from-viverblue via-viverblue/90 to-viverblue/80 rounded-full w-fit mx-auto shadow-2xl">
                        <Crown className="h-8 w-8 text-white" />
                      </div>
                      <Badge className="bg-gradient-to-r from-viverblue via-viverblue/90 to-viverblue/80 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                        <Lock className="h-3 w-3 mr-2" />
                        PREMIUM
                      </Badge>
                      <p className="text-white/90 text-sm font-medium">Clique para fazer upgrade</p>
                    </div>
                  </div>
                  
                  {/* Premium Badge no topo */}
                  <Badge 
                    className="absolute top-4 right-4 bg-gradient-to-r from-viverblue via-viverblue/90 to-viverblue/80 text-white border-0 shadow-lg backdrop-blur-sm z-20"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    PREMIUM
                  </Badge>
                  
                  <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
                  <div className="relative p-6">
                    {/* Conteúdo simulado do networking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-muted/20 rounded-xl p-4 border border-border/30">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/20 rounded-full"></div>
                            <div className="space-y-1">
                              <div className="h-4 bg-muted-foreground/30 rounded w-24"></div>
                              <div className="h-3 bg-muted-foreground/20 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 min-h-[500px]">
                  <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
                  <div className="relative p-6">
                    <MatchesGrid />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ErrorBoundary>
      </NetworkingErrorBoundary>
      
      <PremiumUpgradeModal 
        open={modalState.open}
        onOpenChange={hideUpgradeModal}
        feature={modalState.feature}
        itemTitle={modalState.itemTitle}
      />
    </>
  );
};

export default Networking;