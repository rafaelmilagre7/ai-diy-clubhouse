import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, Brain, Compass, Inbox, Send, ArrowRight, Target, Shield, Zap, Award, TrendingUp } from 'lucide-react';
import { MyConnectionsGrid } from './MyConnectionsGrid';
import { PendingRequestsList } from './PendingRequestsList';
import { SentRequestsList } from './SentRequestsList';
import { DiscoverPeopleGrid } from './DiscoverPeopleGrid';
import { FeatureCard } from './FeatureCard';
import { StatsCard } from './StatsCard';
import { Badge } from '@/components/ui/badge';
import { useNetworkingStats } from '@/hooks/useNetworkingStats';
import { usePendingRequests } from '@/hooks/networking/usePendingRequests';
import { useSentRequests } from '@/hooks/networking/useSentRequests';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { connectionDesignTokens as tokens } from '@/styles/connection-design-tokens';

export const ConnectionsHub = () => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const urlSub = searchParams.get('sub');
  
  const [activeTab, setActiveTab] = useState<string>(urlTab || 'connections');
  const [pendingSubTab, setPendingSubTab] = useState<string>(urlSub || 'received');
  const { data: stats } = useNetworkingStats();
  const { pendingRequests } = usePendingRequests();
  const { sentRequests } = useSentRequests();
  const navigate = useNavigate();

  // Atualizar tabs quando URL mudar
  useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
    if (urlSub) setPendingSubTab(urlSub);
  }, [urlTab, urlSub]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className={tokens.tabs.list}>
            <motion.div
              layoutId="tab-indicator"
              className={tokens.tabs.indicator}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
            
            <TabsTrigger value="connections" className={tokens.tabs.trigger}>
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Conexões</span>
              {stats.connections > 0 && (
                <Badge className="ml-1.5 bg-white/20 text-white border-0 data-[state=inactive]:bg-primary/20 data-[state=inactive]:text-primary">
                  {stats.connections}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="pending" className={tokens.tabs.trigger}>
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pendentes</span>
              {stats.notifications > 0 && (
                <Badge className="ml-1.5 bg-white/20 text-white border-0 animate-pulse data-[state=inactive]:bg-operational/20 data-[state=inactive]:text-operational">
                  {stats.notifications}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="discover" className={tokens.tabs.trigger}>
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Descobrir</span>
            </TabsTrigger>
            
            <TabsTrigger value="ai" className={tokens.tabs.trigger}>
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">IA</span>
              {stats.matches > 0 && (
                <Badge className="ml-1.5 bg-white/20 text-white border-0 data-[state=inactive]:bg-aurora/20 data-[state=inactive]:text-aurora">
                  {stats.matches}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="connections" className="mt-0">
          <MyConnectionsGrid />
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <Tabs value={pendingSubTab} onValueChange={setPendingSubTab} className="w-full">
            <TabsList className={tokens.tabs.subList}>
              <TabsTrigger value="received" className={tokens.tabs.subTrigger}>
                <Inbox className="h-4 w-4" />
                Recebidas
                {pendingRequests.length > 0 && (
                  <Badge className="ml-1.5 bg-operational/20 text-operational border-operational/40">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className={tokens.tabs.subTrigger}>
                <Send className="h-4 w-4" />
                Enviadas
                {sentRequests.length > 0 && (
                  <Badge className="ml-1.5 bg-muted text-muted-foreground border-border/40">
                    {sentRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="received" className="mt-6">
                <motion.div
                  key="received"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PendingRequestsList />
                </motion.div>
              </TabsContent>

              <TabsContent value="sent" className="mt-6">
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SentRequestsList />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </TabsContent>

        <TabsContent value="discover" className="mt-0">
          <DiscoverPeopleGrid />
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="py-12 space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-aurora/20 via-aurora-primary/20 to-operational/20 border border-aurora/30 shadow-lg"
                >
                  <Brain className="w-12 h-12 text-aurora animate-pulse" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-aurora via-aurora-primary to-operational bg-clip-text text-transparent">
                    Networking Inteligente
                  </h2>
                  
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Nossa IA analisa <strong className="text-foreground">perfis compatíveis</strong> com base em seus{' '}
                    <strong className="text-foreground">interesses</strong>, <strong className="text-foreground">indústria</strong> e{' '}
                    <strong className="text-foreground">objetivos profissionais</strong>. 
                    Receba sugestões personalizadas de conexões que realmente fazem sentido para sua carreira.
                  </p>
                </motion.div>
              </div>

              {/* Stats Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
              >
                <StatsCard
                  icon={Users}
                  label="Matches Disponíveis"
                  value={stats.matches}
                  variant="primary"
                />
                <div className="text-center p-6 rounded-xl bg-system-healthy/10 border border-system-healthy/20">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-system-healthy/20 mb-2">
                    <Target className="w-5 h-5 text-system-healthy" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">85%</p>
                  <p className="text-xs text-muted-foreground">Taxa de Aceitação</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-aurora-primary/10 border border-aurora-primary/20">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-aurora-primary/20 mb-2">
                    <TrendingUp className="w-5 h-5 text-aurora-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">+32%</p>
                  <p className="text-xs text-muted-foreground">Crescimento</p>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center space-y-4"
              >
                <Button
                  onClick={() => navigate('/networking')}
                  size="lg"
                  className="gap-3 bg-gradient-to-r from-aurora via-aurora-primary to-operational hover:from-aurora/90 hover:via-aurora-primary/90 hover:to-operational/90 hover:scale-105 transition-all shadow-xl text-lg px-8 py-6 h-auto"
                >
                  <Brain className="h-6 w-6" />
                  Descobrir Conexões com IA
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                {stats.matches > 0 && (
                  <p className="text-sm text-muted-foreground">
                    <Badge className="bg-aurora/20 text-aurora border-aurora/40 mr-2">
                      {stats.matches} {stats.matches === 1 ? 'nova' : 'novas'}
                    </Badge>
                    sugestões esperando por você
                  </p>
                )}
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12"
              >
                <FeatureCard
                  icon={Target}
                  title="Matches Precisos"
                  description="Algoritmo analisa +20 critérios para encontrar conexões ideais"
                />
                <FeatureCard
                  icon={Shield}
                  title="Privacidade Garantida"
                  description="Seus dados são protegidos e nunca compartilhados sem permissão"
                />
                <FeatureCard
                  icon={Zap}
                  title="Atualização em Tempo Real"
                  description="Novas sugestões aparecem assim que perfis compatíveis entram"
                />
                <FeatureCard
                  icon={Award}
                  title="Qualidade Premium"
                  description="Apenas perfis verificados e ativos na plataforma"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};
