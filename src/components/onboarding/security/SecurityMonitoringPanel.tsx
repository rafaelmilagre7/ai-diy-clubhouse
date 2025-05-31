
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, RefreshCw, Eye, Clock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  step_name?: string;
  data_snapshot?: any;
  error_details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface IntegrityCheck {
  id: string;
  user_id: string;
  check_type: string;
  status: string;
  issues_found: any[];
  auto_corrected: boolean;
  created_at: string;
}

interface RateLimit {
  id: string;
  user_id: string;
  attempt_count: number;
  is_blocked: boolean;
  blocked_until?: string;
  last_attempt_at: string;
}

export const SecurityMonitoringPanel: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [integrityChecks, setIntegrityChecks] = useState<IntegrityCheck[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const loadData = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      // Carregar logs de auditoria
      const { data: logs } = await supabase
        .from('onboarding_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Carregar verificações de integridade
      const { data: checks } = await supabase
        .from('onboarding_integrity_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Carregar rate limits ativos
      const { data: limits } = await supabase
        .from('onboarding_rate_limits')
        .select('*')
        .or('is_blocked.eq.true,attempt_count.gt.1')
        .order('last_attempt_at', { ascending: false })
        .limit(50);

      setAuditLogs(logs || []);
      setIntegrityChecks(checks || []);
      setRateLimits(limits || []);
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            Acesso restrito a administradores
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActionTypeBadge = (actionType: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      'completion_success': 'default',
      'completion_success_secure': 'default',
      'completion_error': 'destructive',
      'completion_error_secure': 'destructive',
      'completion_blocked': 'destructive',
      'completion_blocked_rate_limit': 'destructive',
      'duplicate_attempt': 'secondary'
    };

    return (
      <Badge variant={variants[actionType] || 'outline'}>
        {actionType.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      'passed': 'default',
      'issues_found': 'destructive',
      'pending': 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Monitoramento de Segurança</h2>
          <p className="text-gray-400">Logs e métricas de segurança do onboarding</p>
        </div>
        <Button onClick={loadData} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Verificações OK</p>
                <p className="text-2xl font-bold text-white">
                  {integrityChecks.filter(c => c.status === 'passed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Problemas Detectados</p>
                <p className="text-2xl font-bold text-white">
                  {integrityChecks.filter(c => c.status === 'issues_found').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Rate Limits Ativos</p>
                <p className="text-2xl font-bold text-white">
                  {rateLimits.filter(r => r.is_blocked).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Total de Logs</p>
                <p className="text-2xl font-bold text-white">
                  {auditLogs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria Recentes</CardTitle>
          <CardDescription>
            Últimas atividades de segurança no sistema de onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      {getActionTypeBadge(log.action_type)}
                      {log.step_name && (
                        <Badge variant="outline">{log.step_name}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Usuário: {log.user_id.slice(0, 8)}...
                    </p>
                    {log.error_details && (
                      <p className="text-sm text-red-400 mt-1">
                        Erro: {log.error_details}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verificações de Integridade */}
      <Card>
        <CardHeader>
          <CardTitle>Verificações de Integridade</CardTitle>
          <CardDescription>
            Status das verificações automáticas de integridade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrityChecks.slice(0, 5).map((check) => (
              <div key={check.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(check.status)}
                      <Badge variant="outline">{check.check_type}</Badge>
                      {check.auto_corrected && (
                        <Badge variant="default">Auto-corrigido</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Usuário: {check.user_id.slice(0, 8)}...
                    </p>
                    {check.issues_found?.length > 0 && (
                      <p className="text-sm text-yellow-400 mt-1">
                        {check.issues_found.length} problema(s) encontrado(s)
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {new Date(check.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
