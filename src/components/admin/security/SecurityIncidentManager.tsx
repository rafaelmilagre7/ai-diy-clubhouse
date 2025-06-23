
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Users, TrendingUp } from 'lucide-react';

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  created_by: string;
  created_at: string;
  resolved_at?: string;
  metadata?: any;
}

interface SecurityIncidentManagerProps {
  incidents: SecurityIncident[];
}

export const SecurityIncidentManager: React.FC<SecurityIncidentManagerProps> = ({ incidents }) => {
  const openIncidents = incidents.filter(incident => incident.status !== 'resolved');
  const criticalIncidents = incidents.filter(incident => incident.severity === 'critical');
  const recentIncidents = incidents.slice(0, 5);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'default';
      case 'resolved': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Incidentes Abertos</p>
                <p className="text-2xl font-bold">{openIncidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Críticos</p>
                <p className="text-2xl font-bold">{criticalIncidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Incidentes</p>
                <p className="text-2xl font-bold">{incidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Taxa de Resolução</p>
                <p className="text-2xl font-bold">
                  {incidents.length > 0 ? Math.round(((incidents.length - openIncidents.length) / incidents.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Incidentes Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Incidentes Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentIncidents.length > 0 ? (
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{incident.title}</h4>
                      <Badge variant={getSeverityColor(incident.severity) as any}>
                        {incident.severity}
                      </Badge>
                      <Badge variant={getStatusColor(incident.status) as any}>
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{incident.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Criado em {new Date(incident.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum incidente de segurança registrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
