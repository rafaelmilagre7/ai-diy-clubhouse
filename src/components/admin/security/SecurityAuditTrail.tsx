
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  timestamp: string;
  user_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

interface SecurityAuditTrailProps {
  events: SecurityEvent[];
}

export const SecurityAuditTrail = ({ events }: SecurityAuditTrailProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    const matchesType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'auth': return <User className="h-4 w-4" />;
      case 'access': return <Shield className="h-4 w-4" />;
      case 'data': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Trilha de Auditoria de Segurança
          <Badge variant="secondary">{filteredEvents.length} eventos</Badge>
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por ação, recurso ou detalhes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="auth">Autenticação</SelectItem>
              <SelectItem value="access">Acesso</SelectItem>
              <SelectItem value="data">Dados</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
              <SelectItem value="security">Segurança</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum evento encontrado com os filtros aplicados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleEventExpansion(event.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.event_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(event.severity) as any}>
                          {event.severity}
                        </Badge>
                        <Badge variant="outline">
                          {event.event_type}
                        </Badge>
                        {event.resource_type && (
                          <span className="text-sm text-muted-foreground">
                            → {event.resource_type}
                          </span>
                        )}
                      </div>
                      
                      <p className="font-medium text-sm mb-1">
                        {event.action}
                      </p>
                      
                      <div className="flex items-center text-xs text-muted-foreground gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.timestamp).toLocaleString('pt-BR')}
                        </div>
                        {event.ip_address && (
                          <span>IP: {event.ip_address}</span>
                        )}
                        {event.user_id && (
                          <span>User: {event.user_id.substring(0, 8)}...</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {expandedEvent === event.id ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Detalhes Expandidos */}
                {expandedEvent === event.id && (
                  <div className="border-t bg-muted/30 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Informações do Evento</h4>
                        <div className="space-y-1">
                          <div><strong>ID:</strong> {event.id}</div>
                          <div><strong>Timestamp:</strong> {event.timestamp}</div>
                          {event.resource_id && (
                            <div><strong>Resource ID:</strong> {event.resource_id}</div>
                          )}
                          {event.user_agent && (
                            <div><strong>User Agent:</strong> {event.user_agent.substring(0, 100)}...</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Detalhes Técnicos</h4>
                        <pre className="bg-background p-2 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
