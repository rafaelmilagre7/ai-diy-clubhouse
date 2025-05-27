
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Clock, 
  X, 
  CheckCircle, 
  Info,
  Trash2,
  Filter
} from 'lucide-react';
import { PerformanceAlert } from '@/types/performanceTypes';

interface AlertsPanelProps {
  alerts: PerformanceAlert[];
  onClearAlerts: () => void;
  criticalCount: number;
  warningCount: number;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onClearAlerts,
  criticalCount,
  warningCount
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'performance' | 'memory' | 'network' | 'error' | 'warning'>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    if (selectedType !== 'all' && alert.type !== selectedType) return false;
    return true;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'low': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Clock className="w-4 h-4" />;
      case 'error': return <X className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'memory': return <AlertTriangle className="w-4 h-4" />;
      case 'network': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora mesmo';
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas dos Alertas */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                <div className="text-sm text-muted-foreground">Críticos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
                <div className="text-sm text-muted-foreground">Avisos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles e Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alertas de Performance</CardTitle>
              <CardDescription>
                Monitoramento de alertas e problemas de performance
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAlerts}
              disabled={alerts.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Tabs value={selectedSeverity} onValueChange={(value: any) => setSelectedSeverity(value)}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="high">Críticos</TabsTrigger>
                <TabsTrigger value="medium">Médios</TabsTrigger>
                <TabsTrigger value="low">Baixos</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="error">Erros</TabsTrigger>
                <TabsTrigger value="warning">Avisos</TabsTrigger>
                <TabsTrigger value="memory">Memória</TabsTrigger>
                <TabsTrigger value="network">Rede</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Lista de Alertas */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium">Nenhum alerta encontrado</h3>
                <p className="text-muted-foreground">
                  {alerts.length === 0 
                    ? 'Não há alertas de performance no momento.'
                    : 'Nenhum alerta corresponde aos filtros selecionados.'
                  }
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  variant={alert.severity === 'high' ? 'destructive' : 'default'}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(alert.severity)}
                      {getTypeIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                      
                      <AlertDescription className="text-sm">
                        {alert.message}
                      </AlertDescription>
                      
                      {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            Detalhes técnicos
                          </summary>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(alert.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPanel;
