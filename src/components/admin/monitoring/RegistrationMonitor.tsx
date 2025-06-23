
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface RegistrationAttempt {
  id: string;
  timestamp: string;
  action: string;
  details?: any;
  severity?: string;
  success: boolean;
}

export const RegistrationMonitor = () => {
  const [attempts, setAttempts] = useState<RegistrationAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    lastHour: 0
  });

  const loadRegistrationAttempts = async () => {
    try {
      setLoading(true);

      // Buscar logs de registro dos últimos 7 dias
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('event_type', 'user_registration')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(50);

      if (logs) {
        const mappedAttempts: RegistrationAttempt[] = logs.map(log => ({
          id: log.id,
          timestamp: log.timestamp,
          action: log.action,
          details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
          severity: log.severity,
          success: log.action.includes('success') || log.action.includes('complete')
        }));

        setAttempts(mappedAttempts);

        // Calcular estatísticas
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        
        const successful = mappedAttempts.filter(a => a.success).length;
        const failed = mappedAttempts.filter(a => !a.success).length;
        const lastHour = mappedAttempts.filter(a => new Date(a.timestamp) > oneHourAgo).length;

        setStats({
          total: mappedAttempts.length,
          successful,
          failed,
          lastHour
        });
      }
    } catch (error) {
      console.error('Erro ao carregar tentativas de registro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrationAttempts();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadRegistrationAttempts, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (attempt: RegistrationAttempt) => {
    if (attempt.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (attempt: RegistrationAttempt) => {
    if (attempt.success) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Sucesso</Badge>;
    }
    return <Badge variant="destructive">Falha</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitor de Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total (7 dias)</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Sucessos</p>
              <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Falhas</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Última hora</p>
              <p className="text-2xl font-bold text-purple-600">{stats.lastHour}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de tentativas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tentativas de Registro Recentes
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadRegistrationAttempts}>
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma tentativa de registro encontrada nos últimos 7 dias</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                  {getStatusIcon(attempt)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{attempt.action}</p>
                      {getStatusBadge(attempt)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{new Date(attempt.timestamp).toLocaleString('pt-BR')}</span>
                      {attempt.details?.email && (
                        <>
                          <span>•</span>
                          <span>{attempt.details.email}</span>
                        </>
                      )}
                    </div>
                    {attempt.details?.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          {attempt.details.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
