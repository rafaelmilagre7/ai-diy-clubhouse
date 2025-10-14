import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { NetworkingTabs } from '@/components/networking/NetworkingTabs';
import { ChatInterface } from '@/components/networking/chat/ChatInterface';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';
import { NetworkingErrorBoundary } from '@/components/networking/NetworkingErrorBoundary';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { usePremiumUpgradeModal } from '@/hooks/usePremiumUpgradeModal';
import { AuroraUpgradeModal } from '@/components/ui/aurora-upgrade-modal';
import { UnifiedContentBlock } from '@/components/ui/UnifiedContentBlock';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStrategicMatches } from '@/hooks/useStrategicMatches';

const Networking = () => {
  const { user } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { modalState, showUpgradeModal, hideUpgradeModal } = usePremiumUpgradeModal();
  const [chatOpen, setChatOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { matches, isLoading: matchesLoading, refetch: refetchMatches } = useStrategicMatches();
  
  useDynamicSEO({
    title: 'Networking AI - Networking Inteligente',
    description: 'Encontre parcerias estratégicas e oportunidades de negócios com nossa IA especializada em networking empresarial.',
    keywords: 'networking AI, parcerias, IA, conexões empresariais, business matching'
  });

  const hasNetworkingAccess = hasPermission('networking.access');
  
  const handleUpgradeClick = () => {
    showUpgradeModal('networking');
  };

  // Inicializar perfil de networking automaticamente se necessário
  useEffect(() => {
    const initializeNetworkingIfNeeded = async () => {
      if (!user?.id || !hasNetworkingAccess) return;
      
      try {
        // Verificar se já tem perfil v2
        const { data: profile } = await supabase
          .from('networking_profiles_v2')
          .select('id, profile_completed_at')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!profile?.profile_completed_at) {
          console.log('🚀 [NETWORKING] Inicializando perfil automaticamente...');
          setIsInitializing(true);
          setInitError(null);
          
          // Chamar edge function de inicialização
          const { data, error } = await supabase.functions.invoke(
            'initialize-networking-profile',
            { body: {} }
          );
          
          if (error) throw error;
          
          if (data?.success) {
            console.log('✅ [NETWORKING] Perfil inicializado com sucesso');
            toast.success('Seu perfil de networking foi configurado!');
            
            // Recarregar dados
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        }
      } catch (error: any) {
        console.error('❌ [NETWORKING] Erro na inicialização:', error);
        setInitError(error.message || 'Erro ao inicializar networking');
        toast.error('Não foi possível inicializar seu perfil de networking');
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeNetworkingIfNeeded();
  }, [user, hasNetworkingAccess]);

  // Detectar se perfil existe mas matches não e iniciar geração
  useEffect(() => {
    const generateMatches = async () => {
      if (!user?.id || !hasNetworkingAccess || isGenerating) return;
      
      try {
        // Verificar se tem perfil v2 completo
        const { data: profile } = await supabase
          .from('networking_profiles_v2')
          .select('id, profile_completed_at')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!profile?.profile_completed_at) return;
        
        // Verificar se tem matches
        const { data: matchesData } = await supabase
          .from('strategic_matches_v2')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (!matchesData || matchesData.length === 0) {
          console.log('🔄 [NETWORKING] Iniciando geração de matches...');
          setIsGenerating(true);
          setGenerationProgress(10);
          
          // Chamar função de geração
          const { data: generateData, error: generateError } = await supabase.functions.invoke(
            'generate-strategic-matches-v2',
            { body: { user_id: user.id } }
          );
          
          if (generateError) {
            console.error('❌ [NETWORKING] Erro ao gerar matches:', generateError);
            setIsGenerating(false);
            setInitError('Erro ao gerar conexões estratégicas');
            toast.error('Não foi possível gerar suas conexões. Tente novamente.');
            return;
          }
          
          console.log('✅ [NETWORKING] Geração iniciada com sucesso');
          setGenerationProgress(30);
          
          // Polling para verificar se matches foram criados
          const pollInterval = setInterval(async () => {
            const { data } = await supabase
              .from('strategic_matches_v2')
              .select('id')
              .eq('user_id', user.id)
              .limit(1);
            
            if (data && data.length > 0) {
              setIsGenerating(false);
              setGenerationProgress(100);
              clearInterval(pollInterval);
              refetchMatches();
              toast.success('Conexões estratégicas geradas com sucesso!', {
                description: `${data.length} conexões encontradas para você`
              });
            }
          }, 3000);
          
          // Simular progresso gradual
          let progress = 30;
          const progressInterval = setInterval(() => {
            progress += 8;
            setGenerationProgress(Math.min(progress, 95));
            
            if (progress >= 95) {
              clearInterval(progressInterval);
            }
          }, 2000);
          
          // Timeout de 90 segundos
          setTimeout(() => {
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            if (isGenerating) {
              setIsGenerating(false);
              setInitError('Timeout ao gerar matches');
              toast.error('A geração está demorando mais que o esperado.', {
                description: 'Por favor, recarregue a página ou tente novamente.'
              });
            }
          }, 90000);
          
          return () => {
            clearInterval(pollInterval);
            clearInterval(progressInterval);
          };
        }
      } catch (error: any) {
        console.error('❌ [NETWORKING] Erro crítico:', error);
        setIsGenerating(false);
        setInitError(error.message || 'Erro desconhecido');
        toast.error('Erro ao processar networking');
      }
    };
    
    generateMatches();
  }, [user, hasNetworkingAccess, matchesLoading]);

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
              {/* Banner de inicialização */}
              {isInitializing && (
                <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex items-center gap-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <div>
                      <h3 className="font-semibold">Preparando seu networking...</h3>
                      <p className="text-sm text-muted-foreground">
                        Estamos analisando seu perfil e buscando as melhores conexões para você
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Banner de Geração de Matches */}
              {isGenerating && (
                <Card className="relative overflow-hidden p-6 bg-gradient-to-r from-aurora/10 via-primary/5 to-aurora/5 border-aurora/20">
                  <div className="absolute inset-0 aurora-gradient opacity-10 animate-pulse"></div>
                  <div className="relative space-y-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-aurora animate-pulse" />
                      <div>
                        <h3 className="font-semibold aurora-text-gradient">
                          Gerando suas conexões estratégicas...
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Nossa IA está analisando perfis e criando matches personalizados para você
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={generationProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {generationProgress}% concluído
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Banner de erro */}
              {initError && (
                <Card className="p-6 bg-destructive/10 border-destructive/20">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-destructive">Erro ao Gerar Conexões</h3>
                      <p className="text-sm text-muted-foreground">{initError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setInitError(null);
                          setIsGenerating(false);
                          setGenerationProgress(0);
                          window.location.reload();
                        }}
                      >
                        Tentar Novamente
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Header com glassmorphism */}
              <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-8 shadow-2xl shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
                <div className="relative">
                  <NetworkingHeader onOpenChat={() => setChatOpen(true)} />
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
      
      {/* Chat Interface */}
      <ChatInterface
        open={chatOpen}
        onOpenChange={setChatOpen}
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