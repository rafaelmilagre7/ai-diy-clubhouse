import { useState } from 'react';
import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { MatchesGrid } from '@/components/networking/MatchesGrid';
import { ConnectionsGrid } from '@/components/networking/ConnectionsGrid';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';

const Networking = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'connections'>('matches');

  useDynamicSEO({
    title: 'Networking AI - Networking Inteligente',
    description: 'Encontre parcerias estratégicas e oportunidades de negócios com nossa IA especializada em networking empresarial.',
    keywords: 'networking AI, parcerias, IA, conexões empresariais, business matching'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header com glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-8 shadow-2xl shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="relative">
            <NetworkingHeader 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
        
        {/* Conteúdo */}
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 min-h-[500px]">
          <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
          <div className="relative p-6">
            {activeTab === 'matches' && <MatchesGrid />}
            {activeTab === 'connections' && <ConnectionsGrid />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Networking;