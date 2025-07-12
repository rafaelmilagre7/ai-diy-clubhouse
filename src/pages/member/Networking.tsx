import { useState } from 'react';
import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { NetworkingDashboard } from '@/components/networking/NetworkingDashboard';
import { ConnectionNotifications } from '@/components/networking/ConnectionNotifications';
import { NetworkingPreferences } from '@/components/networking/NetworkingPreferences';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';

const Networking = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'connections' | 'notifications' | 'preferences'>('matches');

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
      {activeTab === 'notifications' ? (
        <ConnectionNotifications />
      ) : activeTab === 'preferences' ? (
        <NetworkingPreferences />
      ) : (
        <NetworkingDashboard activeTab={activeTab} />
      )}
    </div>
  );
};

export default Networking;