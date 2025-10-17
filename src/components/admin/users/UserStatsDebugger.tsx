/**
 * Componente de debug para verificar estatísticas de usuários em tempo real
 * Usado para troubleshooting e validação dos dados
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Bug, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DebugStats {
  enhanced_stats: any;
  manual_counts: {
    total_profiles: number;
    total_organizations: number;
    masters_count: number;
    team_members_count: number;
  };
  filter_test: {
    all_users: number;
    masters_filter: number;
    team_filter: number;
  };
}

export const UserStatsDebugger = () => {
  const [debugData, setDebugData] = useState<DebugStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const runDebugTests = async () => {
    setLoading(true);
    console.log('🔍 Iniciando testes de debug...');
    
    try {
      // 1. Buscar estatísticas da função SQL
      const { data: enhancedStats, error: enhancedError } = await supabase
        .rpc('get_enhanced_user_stats_public');
      
      if (enhancedError) {
        throw new Error(`Erro nas estatísticas: ${enhancedError.message}`);
      }

      // 2. Buscar contagens manuais para comparação
      const [
        { count: totalProfiles },
        { count: totalOrganizations },
        { count: mastersCount },
        { count: teamMembersCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_master_user', true),
        supabase.from('profiles')
          .select('*, user_roles!inner(*)', { count: 'exact', head: true })
          .in('user_roles.name', ['team_member', 'membro_equipe', 'equipe'])
      ]);

      // 3. Testar filtros
      const [
        { data: allUsers },
        { data: mastersFilter },
        { data: teamFilter }
      ] = await Promise.all([
        supabase.rpc('get_users_with_advanced_filters_public', { p_limit: 1 }),
        supabase.rpc('get_users_with_advanced_filters_public', { p_limit: 10, p_user_type: 'master' }),
        supabase.rpc('get_users_with_advanced_filters_public', { p_limit: 10, p_user_type: 'team_member' })
      ]);

      const debugResults: DebugStats = {
        enhanced_stats: enhancedStats,
        manual_counts: {
          total_profiles: totalProfiles || 0,
          total_organizations: totalOrganizations || 0,
          masters_count: mastersCount || 0,
          team_members_count: teamMembersCount || 0
        },
        filter_test: {
          all_users: parseInt(allUsers?.[0]?.total_count || '0'),
          masters_filter: mastersFilter?.length || 0,
          team_filter: teamFilter?.length || 0
        }
      };

      setDebugData(debugResults);
      setLastUpdate(new Date());
      
      console.log('✅ Testes de debug concluídos:', debugResults);
      toast.success('Testes de debug executados com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Erro nos testes de debug:', error);
      toast.error('Erro ao executar testes de debug', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Executar testes automaticamente ao montar o componente
    runDebugTests();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-operational" />
    ) : (
      <XCircle className="h-4 w-4 text-status-error" />
    );
  };

  const getConsistencyStatus = () => {
    if (!debugData) return null;
    
    const { enhanced_stats, manual_counts } = debugData;
    
    const totalConsistent = enhanced_stats.total_users === manual_counts.total_profiles;
    const orgConsistent = enhanced_stats.organizations === manual_counts.total_organizations;
    const mastersConsistent = Math.abs(enhanced_stats.masters - manual_counts.masters_count) <= 2;
    
    return { totalConsistent, orgConsistent, mastersConsistent };
  };

  const consistency = getConsistencyStatus();

  if (!debugData) {
    return (
      <Card className="border-status-warning/30 bg-status-warning/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug de Estatísticas de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className={`h-8 w-8 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
            <span className="ml-2 text-muted-foreground">
              {loading ? 'Executando testes...' : 'Carregando...'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-operational/30 bg-operational/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug de Estatísticas de Usuários
            </CardTitle>
            <Button
              onClick={runDebugTests}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Executar Testes
            </Button>
          </div>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Última atualização: {lastUpdate.toLocaleString('pt-BR')}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status geral */}
          <Alert className={consistency?.totalConsistent && consistency?.orgConsistent ? 'border-operational/30 bg-operational/10' : 'border-status-warning/30 bg-status-warning/10'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Status geral: {consistency?.totalConsistent && consistency?.orgConsistent ? 
                '✅ Dados consistentes' : 
                '⚠️ Inconsistências detectadas'
              }
            </AlertDescription>
          </Alert>

          {/* Comparação de dados */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estatísticas da Função SQL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total de usuários:</span>
                  <Badge variant="outline">{debugData.enhanced_stats.total_users}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Masters:</span>
                  <Badge variant="outline">{debugData.enhanced_stats.masters}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Membros de equipe:</span>
                  <Badge variant="outline">{debugData.enhanced_stats.team_members}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Organizações:</span>
                  <Badge variant="outline">{debugData.enhanced_stats.organizations}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Usuários individuais:</span>
                  <Badge variant="outline">{debugData.enhanced_stats.individual_users}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Usuários ativos:</span>
                  <Badge variant="outline">{debugData.enhanced_stats.active_users}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contagens Manuais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Profiles:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{debugData.manual_counts.total_profiles}</Badge>
                    {getStatusIcon(consistency?.totalConsistent || false)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Masters (is_master_user):</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{debugData.manual_counts.masters_count}</Badge>
                    {getStatusIcon(consistency?.mastersConsistent || false)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Team members:</span>
                  <Badge variant="outline">{debugData.manual_counts.team_members_count}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Organizações:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{debugData.manual_counts.total_organizations}</Badge>
                    {getStatusIcon(consistency?.orgConsistent || false)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teste de filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teste de Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Total via filtro:</span>
                <Badge variant="outline">{debugData.filter_test.all_users}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Masters via filtro:</span>
                <Badge variant="outline">{debugData.filter_test.masters_filter}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Team via filtro:</span>
                <Badge variant="outline">{debugData.filter_test.team_filter}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Dados brutos (para debug avançado) */}
          <details className="border rounded p-3">
            <summary className="cursor-pointer font-medium">
              Dados brutos (para desenvolvedores)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};