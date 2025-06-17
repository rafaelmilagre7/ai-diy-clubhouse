
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Activity, Server, Users, AlertTriangle, CheckCircle, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatus {
  component: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  incidents: number;
}

interface OperationalMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface OperationalCommandProps {
  timeRange: string;
}

export const OperationalCommand: React.FC<OperationalCommandProps> = ({ timeRange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const systemComponents: SystemStatus[] = [
    {
      component: 'API Gateway',
      status: 'healthy',
      uptime: 99.98,
      responseTime: 145,
      lastCheck: '30s ago',
      incidents: 0
    },
    {
      component: 'Database',
      status: 'healthy',
      uptime: 99.95,
      responseTime: 89,
      lastCheck: '15s ago',
      incidents: 0
    },
    {
      component: 'Authentication',
      status: 'warning',
      uptime: 99.87,
      responseTime: 234,
      lastCheck: '45s ago',
      incidents: 1
    },
    {
      component: 'File Storage',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 67,
      lastCheck: '22s ago',
      incidents: 0
    },
    {
      component: 'Email Service',
      status: 'critical',
      uptime: 98.45,
      responseTime: 456,
      lastCheck: '1m ago',
      incidents: 3
    },
    {
      component: 'Analytics Engine',
      status: 'healthy',
      uptime: 99.92,
      responseTime: 123,
      lastCheck: '10s ago',
      incidents: 0
    }
  ];

  const operationalMetrics: OperationalMetric[] = [
    {
      name: 'Concurrent Users',
      current: 342,
      target: 400,
      unit: 'users',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'API Requests/min',
      current: 1247,
      target: 1000,
      unit: 'req/min',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Error Rate',
      current: 0.23,
      target: 0.5,
      unit: '%',
      trend: 'down',
      status: 'good'
    },
    {
      name: 'Response Time',
      current: 156,
      target: 200,
      unit: 'ms',
      trend: 'stable',
      status: 'good'
    },
    {
      name: 'Memory Usage',
      current: 67.5,
      target: 80,
      unit: '%',
      trend: 'up',
      status: 'warning'
    },
    {
      name: 'Disk Usage',
      current: 45.2,
      target: 70,
      unit: '%',
      trend: 'stable',
      status: 'good'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'maintenance': return <Server className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <Activity className="h-4 w-4 text-green-500 rotate-0" />;
      case 'down': return <Activity className="h-4 w-4 text-red-500 rotate-180" />;
      case 'stable': return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getMetricStatus = (current: number, target: number, unit: string) => {
    if (unit === '%' || unit === 'ms') {
      return current <= target ? 'good' : current <= target * 1.2 ? 'warning' : 'critical';
    }
    return current >= target * 0.8 ? 'good' : current >= target * 0.6 ? 'warning' : 'critical';
  };

  const overallHealth = systemComponents.filter(c => c.status === 'healthy').length / systemComponents.length * 100;

  return (
    <div className="space-y-6">
      {/* Header do Centro de Comando */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Centro de Comando Operacional</h2>
            <p className="text-gray-600">
              Monitoramento em tempo real • {currentTime.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Auto-refresh
          </Button>
          <Badge className={cn(
            "text-sm",
            overallHealth >= 90 ? "bg-green-100 text-green-800" :
            overallHealth >= 70 ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          )}>
            Saúde Geral: {overallHealth.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Status dos Sistemas */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-6 w-6 text-blue-500" />
            Status dos Sistemas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemComponents.map((component, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{component.component}</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(component.status)}
                    <Badge className={cn("text-xs", getStatusColor(component.status))}>
                      {component.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium">{component.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response:</span>
                    <span className="font-medium">{component.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Check:</span>
                    <span className="font-medium">{component.lastCheck}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Incidents:</span>
                    <span className={cn(
                      "font-medium",
                      component.incidents === 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {component.incidents}
                    </span>
                  </div>
                </div>

                {component.status !== 'healthy' && (
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas Operacionais */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-green-500" />
            Métricas Operacionais em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operationalMetrics.map((metric, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{metric.name}</h4>
                  {getTrendIcon(metric.trend)}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.current.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Meta: {metric.target.toLocaleString()} {metric.unit}</span>
                  <Badge className={cn(
                    "text-xs",
                    getMetricStatus(metric.current, metric.target, metric.unit) === 'good' ? "bg-green-100 text-green-800" :
                    getMetricStatus(metric.current, metric.target, metric.unit) === 'warning' ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  )}>
                    {getMetricStatus(metric.current, metric.target, metric.unit).toUpperCase()}
                  </Badge>
                </div>

                <Progress
                  value={Math.min((metric.current / metric.target) * 100, 100)}
                  className="mt-2 h-2"
                  indicatorClassName={cn(
                    getMetricStatus(metric.current, metric.target, metric.unit) === 'good' ? "bg-green-500" :
                    getMetricStatus(metric.current, metric.target, metric.unit) === 'warning' ? "bg-yellow-500" :
                    "bg-red-500"
                  )}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticos */}
      <Card className="border-l-4 border-l-red-500 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-6 w-6" />
            Alertas Críticos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800">Email Service Degraded</h4>
                  <p className="text-sm text-red-600">Response time above threshold (456ms)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800 text-xs">CRÍTICO</Badge>
                <Button size="sm" variant="outline">
                  Resolver
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-800">Memory Usage High</h4>
                  <p className="text-sm text-yellow-600">67.5% usage, approaching limit</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">AVISO</Badge>
                <Button size="sm" variant="outline">
                  Monitorar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
