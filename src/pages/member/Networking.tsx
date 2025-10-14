import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { NetworkingTabs } from '@/components/networking/NetworkingTabs';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';
import { NetworkingErrorBoundary } from '@/components/networking/NetworkingErrorBoundary';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { usePremiumUpgradeModal } from '@/hooks/usePremiumUpgradeModal';
import { AuroraUpgradeModal } from '@/components/ui/aurora-upgrade-modal';
import { UnifiedContentBlock } from '@/components/ui/UnifiedContentBlock';
import { NetworkingOnboardingModal } from '@/components/networking/NetworkingOnboardingModal';
import { useNetworkingOnboarding } from '@/hooks/useNetworkingOnboarding';
import { useState } from 'react';

const Networking = () => {
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { modalState, showUpgradeModal, hideUpgradeModal } = usePremiumUpgradeModal();
  const { hasCompletedOnboarding, isLoading: onboardingLoading, prefilledData, markAsCompleted } = useNetworkingOnboarding();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  useDynamicSEO({
    title: 'Networking AI - Networking Inteligente',
    description: 'Encontre parcerias estratégicas e oportunidades de negócios com nossa IA especializada em networking empresarial.',
    keywords: 'networking AI, parcerias, IA, conexões empresariais, business matching'
  });

  // Usar sistema de permissões baseado no /admin/roles
  const hasNetworkingAccess = hasPermission('networking.access');
  
  const handleUpgradeClick = () => {
    showUpgradeModal('networking');
  };

  // Loading state enquanto verifica permissões
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Para usuários sem permissão, mostrar modal de upgrade
  if (!hasNetworkingAccess) {
    return (
      <>
        <NetworkingErrorBoundary>
          <ErrorBoundary>
            <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-primary/5">
              <div className="container mx-auto py-8 space-y-8">
                {/* Header Premium */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-xl border border-primary/20 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 via-transparent to-transparent rounded-full blur-3xl"></div>
                  <div className="relative p-8">
                    <NetworkingHeader />
                  </div>
                </div>
                
                {/* Conteúdo Principal Bloqueado */}
                <div className="relative rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 min-h-[600px] overflow-hidden">
                  <UnifiedContentBlock 
                    sectionName="o networking"
                    onClick={handleUpgradeClick}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 20px 20px, hsl(var(--primary)) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                      }}></div>
                    </div>
                    
                    {/* Conteúdo Simulado Premium */}
                    <div className="relative p-8 space-y-8">
                      {/* Barra de Busca Simulada */}
                      <div className="max-w-md mx-auto">
                        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
                          <div className="h-10 bg-muted-foreground/20 rounded-xl"></div>
                        </div>
                      </div>
                      
                      {/* Grid de Conexões Premium */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="group relative">
                            <div className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm rounded-2xl p-6 border border-border/30 group-hover:border-primary/20 transition-all duration-300">
                              {/* Avatar */}
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="relative">
                                  <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center">
                                    <div className="w-8 h-8 bg-primary/40 rounded-full"></div>
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500/80 rounded-full border-2 border-background"></div>
                                </div>
                                <div className="space-y-2">
                                  <div className="h-5 bg-muted-foreground/30 rounded-lg w-32"></div>
                                  <div className="h-4 bg-muted-foreground/20 rounded w-24"></div>
                                </div>
                              </div>
                              
                              {/* Compatibilidade */}
                              <div className="mb-4">
                                <div className="h-3 bg-muted-foreground/20 rounded-full w-20 mb-2"></div>
                                <div className="h-2 bg-gradient-to-r from-green-500/30 to-transparent rounded-full w-full"></div>
                              </div>
                              
                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {[1, 2, 3].map((tag) => (
                                  <div key={tag} className="h-6 bg-muted-foreground/20 rounded-full w-16"></div>
                                ))}
                              </div>
                              
                              {/* Action Button */}
                              <div className="h-10 bg-primary/20 rounded-xl w-full"></div>
                            </div>
                            
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur"></div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Features Premium */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/30">
                        {[
                          { icon: "🤖", title: "IA Match Score", desc: "Algoritmo inteligente de compatibilidade" },
                          { icon: "💬", title: "Chat Integrado", desc: "Converse diretamente na plataforma" },
                          { icon: "📊", title: "Analytics", desc: "Métricas de networking e crescimento" },
                          { icon: "🎯", title: "Filtros Avançados", desc: "Encontre exatamente quem procura" }
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 bg-muted/20 rounded-xl border border-border/30">
                            <div className="text-2xl">{feature.icon}</div>
                            <div>
                              <h4 className="font-semibold text-sm">{feature.title}</h4>
                              <p className="text-xs text-muted-foreground">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </UnifiedContentBlock>
                </div>
              </div>
            </div>
          </ErrorBoundary>
        </NetworkingErrorBoundary>
        
        <AuroraUpgradeModal 
          open={modalState.open}
          onOpenChange={hideUpgradeModal}
          itemTitle="Desbloquear Networking AI"
          feature="solutions"
        />
      </>
    );
  }

  // Usuário tem acesso - mostrar conteúdo real do networking
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
              
              {/* Sistema de Tabs com Conexões */}
              <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 min-h-[500px]">
                <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
                <div className="relative p-6">
                  <NetworkingTabs />
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </NetworkingErrorBoundary>
      
      {/* Modal de Onboarding Liquid Glass */}
      <NetworkingOnboardingModal
        open={!onboardingLoading && hasCompletedOnboarding === false && !showOnboardingModal}
        onComplete={() => {
          markAsCompleted();
          setShowOnboardingModal(true);
        }}
        prefilledData={prefilledData}
      />
      
      <AuroraUpgradeModal 
        open={modalState.open}
        onOpenChange={hideUpgradeModal}
        itemTitle="Desbloquear Networking AI"
        feature="solutions"
      />
    </>
  );
};

export default Networking;