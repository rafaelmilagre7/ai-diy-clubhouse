
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

  // Transform analytics data to match component expectations
  const funnelData = {
    sent: analytics.totalInvites,
    delivered: analytics.totalInvites - analytics.expiredInvites,
    opened: Math.floor(analytics.totalInvites * 0.7), // Mock data
    clicked: Math.floor(analytics.totalInvites * 0.5), // Mock data
    registered: analytics.usedInvites,
    active: Math.floor(analytics.usedInvites * 0.8) // Mock data
  };

  const channelPerformanceData = {
    email: {
      conversionRate: analytics.channelPerformance.find(c => c.channel === 'email')?.conversionRate || 0,
      avgAcceptanceTime: analytics.averageTimeToAccept,
      cost: 2.5, // Mock data
      roi: 15.2 // Mock data
    },
    whatsapp: {
      conversionRate: analytics.channelPerformance.find(c => c.channel === 'whatsapp')?.conversionRate || 0,
      avgAcceptanceTime: analytics.averageTimeToAccept * 0.8,
      cost: 1.8, // Mock data
      roi: 18.5 // Mock data
    }
  };

  const timeAnalysisData = [9, 10, 11, 14, 15, 16]; // Mock optimal hours

  const roleSegmentationData = analytics.roleBasedAnalytics.map(role => ({
    roleId: `role-${role.roleName.toLowerCase()}`,
    roleName: role.roleName,
    conversionRate: role.conversionRate,
    avgOnboardingTime: 4.5, // Mock data in hours
    retentionRate: 85.2 // Mock data
  }));

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
            <FunnelChart data={funnelData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionChart data={channelPerformanceData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise Temporal</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeAnalysisChart data={timeAnalysisData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segmentação por Papel</CardTitle>
          </CardHeader>
          <CardContent>
            <RoleSegmentationTable data={roleSegmentationData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteAnalyticsDashboard;
