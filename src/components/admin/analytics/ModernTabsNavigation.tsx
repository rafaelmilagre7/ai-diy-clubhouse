
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, FileText, GraduationCap, Activity } from 'lucide-react';

interface TabData {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  status?: 'active' | 'warning' | 'success' | 'error';
  description?: string;
}

interface ModernTabsNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  tabsData?: {
    totalUsers?: number;
    totalSolutions?: number;
    totalCourses?: number;
    activeImplementations?: number;
  };
}

export const ModernTabsNavigation = ({ 
  activeTab, 
  onTabChange,
  tabsData = {}
}: ModernTabsNavigationProps) => {
  const tabs: TabData[] = [
    {
      value: 'overview',
      label: 'Visão Geral',
      icon: BarChart3,
      description: 'Dashboard principal com métricas consolidadas',
      status: 'success'
    },
    {
      value: 'users',
      label: 'Usuários',
      icon: Users,
      count: tabsData.totalUsers,
      description: 'Analytics detalhado dos usuários da plataforma',
      status: 'active'
    },
    {
      value: 'solutions',
      label: 'Soluções',
      icon: FileText,
      count: tabsData.totalSolutions,
      description: 'Performance e métricas das soluções',
      status: 'success'
    },
    {
      value: 'learning',
      label: 'Aprendizado',
      icon: GraduationCap,
      count: tabsData.totalCourses,
      description: 'Métricas do sistema de aprendizado (LMS)',
      status: 'warning'
    }
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'bg-success/10 text-success border-success/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'active': return 'bg-operational/10 text-operational border-operational/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Modern Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="bg-card rounded-lg border border-border shadow-sm p-2">
          <TabsList className="grid grid-cols-4 w-full bg-muted/30 rounded-md p-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.value;
              
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`
                    relative flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-smooth rounded-sm
                    ${isActive 
                      ? 'bg-aurora-primary text-primary-foreground shadow-lg transform scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">{tab.label}</span>
                  
                  {/* Count Badge */}
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className={`
                        ml-1 text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center
                        ${isActive ? 'bg-surface-elevated/50 text-foreground border-border/30' : 'bg-muted text-muted-foreground border-muted'}
                      `}
                    >
                      {tab.count > 999 ? '999+' : tab.count}
                    </Badge>
                  )}

                  {/* Status Indicator */}
                  {tab.status && (
                    <div className={`
                      absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card
                      ${tab.status === 'active' && 'bg-operational animate-pulse'}
                      ${tab.status === 'success' && 'bg-success'}
                      ${tab.status === 'warning' && 'bg-warning'}
                      ${tab.status === 'error' && 'bg-destructive'}
                    `} />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </Tabs>

      {/* Tab Description */}
      <div className="px-1">
        {tabs.map((tab) => (
          activeTab === tab.value && tab.description && (
            <div key={tab.value} className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>{tab.description}</span>
              {tab.status && (
                <Badge variant="secondary" className={`text-xs ${getStatusColor(tab.status)}`}>
                  {tab.status === 'active' && 'Ativo'}
                  {tab.status === 'success' && 'Atualizado'}
                  {tab.status === 'warning' && 'Atenção'}
                  {tab.status === 'error' && 'Erro'}
                </Badge>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
};
