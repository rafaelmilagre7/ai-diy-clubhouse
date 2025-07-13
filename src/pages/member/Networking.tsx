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
    <div className="space-y-6">
      <NetworkingHeader 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="min-h-[400px]">
        {activeTab === 'matches' && <MatchesGrid />}
        {activeTab === 'connections' && <ConnectionsGrid />}
      </div>
    </div>
  );
};

export default Networking;