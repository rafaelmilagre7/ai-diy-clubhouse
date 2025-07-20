import { Brain, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNetworkingStats } from '@/hooks/useNetworkingStats';
import { cn } from '@/lib/utils';

interface NetworkingHeaderProps {
  activeTab: 'matches' | 'connections';
  onTabChange: (tab: 'matches' | 'connections') => void;
}

export const NetworkingHeader = ({
  activeTab,
  onTabChange,
}: NetworkingHeaderProps) => {
  const { data: stats } = useNetworkingStats();

  const tabs = [
    { id: 'matches', label: 'Matches IA', icon: Brain, count: stats?.matches || 0 },
    { id: 'connections', label: 'Conexões', icon: Users, count: stats?.connections || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <Brain className="relative h-8 w-8 text-primary" />
            </div>
            Networking AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Sua IA especialista em networking empresarial e parcerias estratégicas
          </p>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-primary/10 backdrop-blur border border-primary/30 rounded-xl px-4 py-2">
            <div className="flex items-center gap-2 text-primary font-medium">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              ✨ Powered by AI
            </div>
          </div>
        </div>
      </div>

      {/* Tabs com VIA Aurora Style */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl p-1.5 shadow-xl">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group/tab"
                >
                  <button
                    onClick={() => onTabChange(tab.id as any)}
                    data-tab={tab.id}
                    className={cn(
                      "relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap",
                      "transform-gpu will-change-transform",
                      isActive 
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-102"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                    
                    {tab.count !== null && (
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300",
                        isActive 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {tab.count}
                      </div>
                    )}
                    
                    {/* Indicador de foco */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-foreground/50 to-transparent rounded-full"></div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};