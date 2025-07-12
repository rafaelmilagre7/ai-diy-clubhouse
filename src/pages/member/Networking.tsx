import { useState } from 'react';
import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { NetworkingDashboard } from '@/components/networking/NetworkingDashboard';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';

const Networking = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'connections' | 'goals'>('matches');

  useDynamicSEO({
    title: 'Conecta AI - Networking Inteligente',
    description: 'Encontre parcerias estratégicas e oportunidades de negócios com nossa IA especializada em networking empresarial.',
    keywords: 'networking, parcerias, IA, conexões empresariais, business matching'
  });

  return (
    <div className="space-y-6">
      <NetworkingHeader 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <NetworkingDashboard activeTab={activeTab} />
    </div>
  );
};

export default Networking;