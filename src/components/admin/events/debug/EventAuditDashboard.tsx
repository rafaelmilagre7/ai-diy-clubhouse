import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Shield, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';

interface DataInconsistency {
  type: 'missing_role' | 'orphaned_access' | 'invalid_event' | 'user_without_role';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affected_item: string;
  suggested_action: string;
  data: any;
}

export const EventAuditDashboard = () => {
  const [inconsistencies, setInconsistencies] = useState<DataInconsistency[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    publicEvents: 0,
    restrictedEvents: 0,
    totalUsers: 0,
    usersWithoutRole: 0,
    orphanedAccessControls: 0
  });

  const runAuditCheck = async () => {
    setLoading(true);
    const foundInconsistencies: DataInconsistency[] = [];

    try {
      // 1. Verificar usuários sem role_id
      const { data: usersWithoutRole } = await supabase
        .from('profiles')
        .select('id, email, name')
        .is('role_id', null);

      usersWithoutRole?.forEach(user => {
        foundInconsistencies.push({
          type: 'user_without_role',
          severity: 'high',
          description: `Usuário "${user.email}" não possui role_id definido`,
          affected_item: user.email,
          suggested_action: 'Atribuir um role padrão ao usuário',
          data: user
        });
      });

      // 2. Verificar roles inexistentes referenciados por usuários
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, email, role_id')
        .not('role_id', 'is', null);

      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('id');

      const existingRoleIds = existingRoles?.map(r => r.id) || [];

      allUsers?.forEach(user => {
        if (user.role_id && !existingRoleIds.includes(user.role_id)) {
          foundInconsistencies.push({
            type: 'missing_role',
            severity: 'high',
            description: `Usuário "${user.email}" referencia role inexistente`,
            affected_item: user.email,
            suggested_action: 'Corrigir role_id do usuário ou criar o role faltante',
            data: { user, missingRoleId: user.role_id }
          });
        }
      });

      // 3. Verificar controles de acesso órfãos (referenciando eventos inexistentes)
      const { data: accessControls } = await supabase
        .from('event_access_control')
        .select('event_id, role_id');

      const { data: existingEvents } = await supabase
        .from('events')
        .select('id');

      const existingEventIds = existingEvents?.map(e => e.id) || [];

      accessControls?.forEach(ac => {
        if (!existingEventIds.includes(ac.event_id)) {
          foundInconsistencies.push({
            type: 'orphaned_access',
            severity: 'medium',
            description: `Controle de acesso referencia evento inexistente`,
            affected_item: ac.event_id,
            suggested_action: 'Remover controle de acesso órfão',
            data: ac
          });
        }

        if (!existingRoleIds.includes(ac.role_id)) {
          foundInconsistencies.push({
            type: 'orphaned_access',
            severity: 'medium',
            description: `Controle de acesso referencia role inexistente`,
            affected_item: ac.role_id,
            suggested_action: 'Remover controle de acesso órfão ou corrigir role_id',
            data: ac
          });
        }
      });

      // 4. Calcular estatísticas
      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      const { data: eventsWithAccess } = await supabase
        .from('event_access_control')
        .select('event_id');

      const uniqueEventIds = [...new Set(eventsWithAccess?.map(item => item.event_id) || [])];
      const restrictedEventsCount = uniqueEventIds.length;
      const publicEventsCount = (totalEvents || 0) - restrictedEventsCount;

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: orphanedAccessCount } = await supabase
        .from('event_access_control')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalEvents: totalEvents || 0,
        publicEvents: publicEventsCount,
        restrictedEvents: restrictedEventsCount,
        totalUsers: totalUsers || 0,
        usersWithoutRole: usersWithoutRole?.length || 0,
        orphanedAccessControls: foundInconsistencies.filter(i => i.type === 'orphaned_access').length
      });

      setInconsistencies(foundInconsistencies);

      if (foundInconsistencies.length === 0) {
        toast.success('Nenhuma inconsistência encontrada!');
      } else {
        toast.warning(`${foundInconsistencies.length} inconsistências encontradas`);
      }

    } catch (error) {
      console.error('Erro ao executar auditoria:', error);
      toast.error('Erro ao executar auditoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAuditCheck();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Auditoria de Integridade de Dados
            </div>
            <Button 
              onClick={runAuditCheck} 
              disabled={loading}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Auditando...' : 'Executar Auditoria'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.totalEvents}</div>
              <div className="text-xs text-muted-foreground">Total Eventos</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-system-healthy">{stats.publicEvents}</div>
              <div className="text-xs text-muted-foreground">Eventos Públicos</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-status-warning">{stats.restrictedEvents}</div>
              <div className="text-xs text-muted-foreground">Eventos Restritos</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Total Usuários</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-severity-critical">{stats.usersWithoutRole}</div>
              <div className="text-xs text-muted-foreground">Sem Role</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-severity-high">{stats.orphanedAccessControls}</div>
              <div className="text-xs text-muted-foreground">Controles Órfãos</div>
            </div>
          </div>

          {/* Lista de Inconsistências */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Inconsistências Encontradas ({inconsistencies.length})
            </h4>
            
            {inconsistencies.length === 0 ? (
              <div className="text-center py-8 text-system-healthy">
                <Shield className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Tudo certo!</p>
                <p className="text-sm text-muted-foreground">Nenhuma inconsistência encontrada nos dados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inconsistencies.map((inconsistency, index) => (
                  <Card key={index} className={`border-l-4 ${
                    inconsistency.severity === 'high' ? 'border-l-severity-critical' :
                    inconsistency.severity === 'medium' ? 'border-l-severity-medium' :
                    'border-l-severity-low'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getSeverityIcon(inconsistency.severity)}</span>
                            <Badge variant={getSeverityColor(inconsistency.severity) as any}>
                              {inconsistency.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {inconsistency.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="font-medium mb-1">{inconsistency.description}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Item afetado:</strong> {inconsistency.affected_item}
                          </p>
                          <p className="text-sm text-system-healthy bg-system-healthy/10 p-2 rounded">
                            <strong>Ação sugerida:</strong> {inconsistency.suggested_action}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};