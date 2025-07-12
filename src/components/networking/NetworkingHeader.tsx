import { Brain, Users, Bell, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNetworkingStats } from '@/hooks/useNetworkingStats';

interface NetworkingHeaderProps {
  activeTab: 'matches' | 'connections' | 'notifications' | 'preferences' | 'analytics';
  onTabChange: (tab: 'matches' | 'connections' | 'notifications' | 'preferences' | 'analytics') => void;
}

export const NetworkingHeader = ({
  activeTab,
  onTabChange,
}: NetworkingHeaderProps) => {
  const { data: stats } = useNetworkingStats();

  const tabs = [
    { id: 'matches', label: 'Matches IA', icon: Brain, count: stats?.matches || 0 },
    { id: 'connections', label: 'Conexões', icon: Users, count: stats?.connections || 0 },
    { id: 'notifications', label: 'Notificações', icon: Bell, count: stats?.notifications || 0 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
    { id: 'preferences', label: 'Configurações', icon: Settings, count: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
            <Brain className="h-6 w-6 text-viverblue" />
            Networking AI
          </h1>
          <p className="text-textSecondary mt-1">
            Sua IA especialista em networking empresarial e parcerias estratégicas
          </p>
        </div>
        <Badge className="bg-viverblue/10 text-viverblue border-viverblue/30 w-fit">
          ✨ Powered by AI
        </Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={isActive ? "default" : "outline"}
                onClick={() => onTabChange(tab.id as any)}
                className={`
                  flex items-center gap-2 whitespace-nowrap
                  ${isActive 
                    ? 'bg-viverblue hover:bg-viverblue/90 text-white' 
                    : 'border-white/10 text-textSecondary hover:text-textPrimary hover:bg-backgroundLight'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== null && (
                  <Badge 
                    variant="secondary" 
                    className={`
                      ml-1 text-xs
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-backgroundLight text-textSecondary'
                      }
                    `}
                  >
                    {tab.count}
                  </Badge>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};