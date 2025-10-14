import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { NetworkingAnalytics } from '@/hooks/networking/useNetworkingAnalytics';
import { Progress } from '@/components/ui/progress';

interface TopIndustriesCardProps {
  analytics: NetworkingAnalytics;
}

export const TopIndustriesCard: React.FC<TopIndustriesCardProps> = ({ analytics }) => {
  const maxCount = Math.max(...analytics.topIndustries.map(i => i.count));

  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Top Indústrias
        </h3>
        <p className="text-sm text-muted-foreground">
          Setores mais conectados
        </p>
      </div>

      <div className="space-y-4">
        {analytics.topIndustries.map((industry, index) => {
          const percentage = (industry.count / maxCount) * 100;
          
          return (
            <div key={industry.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <span className="text-sm font-medium">{industry.name}</span>
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {industry.count} conexões
                </span>
              </div>
              
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
