import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Lock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface SecurityEvent {
  id: string;
  timestamp: string;
  event_type: string;
  action: string;
  severity: string;
  details: any;
  user_id?: string;
}

export const SecurityMonitor = memo(() => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { isAdmin } = useAuth();
  const itemsPerPage = 10;

  const fetchSecurityEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .in('event_type', [
          'security_violation',
          'role_change_attempt', 
          'admin_access_attempt',
          'role_change_validation'
        ])
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSecurityEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos de segurança:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    
    if (!isAdmin) return;
    
    const loadEvents = async () => {
      await fetchSecurityEvents();
    };
    
    loadEvents();
    
    return () => { cancelled = true; };
  }, [isAdmin, fetchSecurityEvents]);

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  }, []);

  const getSeverityIcon = useCallback((severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Shield className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  }, []);

  // Paginação
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return securityEvents.slice(startIndex, endIndex);
  }, [securityEvents, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => 
    Math.ceil(securityEvents.length / itemsPerPage), 
    [securityEvents.length, itemsPerPage]
  );

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-lg">
          <div className="text-center text-muted-foreground">
            Acesso restrito a administradores
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Monitor de Segurança
          <Button 
            onClick={fetchSecurityEvents} 
            variant="outline" 
            size="sm"
            className="ml-auto"
          >
            <Eye className="h-4 w-4 mr-sm" />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground">
            Carregando eventos de segurança...
          </div>
        ) : securityEvents.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Nenhum evento de segurança registrado
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedEvents.map((event) => (
              <div
                key={event.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getSeverityColor(event.severity)}
                      className="flex items-center gap-1"
                    >
                      {getSeverityIcon(event.severity)}
                      {event.severity?.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{event.action}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <div className="text-sm space-y-xs">
                  <div><strong>Tipo:</strong> {event.event_type}</div>
                  {event.user_id && (
                    <div><strong>Usuário:</strong> {event.user_id}</div>
                  )}
                  
                  {event.details && Object.keys(event.details).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-primary hover:underline">
                        Ver detalhes
                      </summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({securityEvents.length} eventos)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});