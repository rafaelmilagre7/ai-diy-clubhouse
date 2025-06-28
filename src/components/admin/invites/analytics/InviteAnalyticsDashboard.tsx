
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAdvancedInviteAnalytics } from '@/hooks/admin/invites/useAdvancedInviteAnalytics';
import { FunnelChart } from './components/FunnelChart';
import { ConversionChart } from './components/ConversionChart';
import { TimeAnalysisChart } from './components/TimeAnalysisChart';
import { RoleSegmentationTable } from './components/RoleSegmentationTable';

export const InviteAnalyticsDashboard = () => {
  const { analytics, loading, fetchAnalytics } = useAdvancedInviteAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Convites</h2>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho dos convites
          </p>
        </div>
        
        <Button 
          onClick={fetchAnalytics} 
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={analytics.channelPerformance} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionChart data={analytics.channelPerformance} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise Temporal</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeAnalysisChart data={analytics.timeBasedAnalytics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segmentação por Papel</CardTitle>
          </CardHeader>
          <CardContent>
            <RoleSegmentationTable data={analytics.roleBasedAnalytics} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteAnalyticsDashboard;
