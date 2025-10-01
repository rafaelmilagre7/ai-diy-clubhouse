import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Users, UserPlus, Building } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SyncStats {
  masters_processed: number;
  members_processed: number;
  organizations_created: number;
  errors: number;
  warnings: number;
  masters_not_found: number;
  members_not_found: number;
}

interface SyncLog {
  master_email: string;
  member_email?: string;
  operation: string;
  status: string;
  message?: string;
}

interface SyncResult {
  success: boolean;
  dryRun?: boolean;
  stats: SyncStats;
  logs: SyncLog[];
  totalLogs: number;
}

interface DryRunResultsProps {
  result: SyncResult;
}

export const DryRunResults: React.FC<DryRunResultsProps> = ({ result }) => {
  const errorLogs = result.logs.filter(log => log.status === 'error');
  const warningLogs = result.logs.filter(log => log.status === 'warning');
  const successLogs = result.logs.filter(log => log.status === 'success');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.dryRun ? (
            <>
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Resultado da Simulação (Dry-Run)
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              Resultado da Sincronização
            </>
          )}
        </CardTitle>
        <CardDescription>
          {result.dryRun 
            ? 'Visualização do que aconteceria se a sincronização fosse executada'
            : 'Sincronização executada com sucesso no banco de dados'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas - Linha 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{result.stats.masters_processed}</div>
              <div className="text-sm text-muted-foreground">Masters</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <UserPlus className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{result.stats.members_processed}</div>
              <div className="text-sm text-muted-foreground">Membros</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Building className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">{result.stats.organizations_created}</div>
              <div className="text-sm text-muted-foreground">Organizations</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{result.stats.errors}</div>
              <div className="text-sm text-muted-foreground">Erros Críticos</div>
            </div>
          </div>
        </div>

        {/* Estatísticas - Linha 2: Warnings e Não Encontrados */}
        {(result.stats.warnings > 0 || result.stats.masters_not_found > 0 || result.stats.members_not_found > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{result.stats.warnings}</div>
                <div className="text-sm text-muted-foreground">Avisos</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{result.stats.masters_not_found}</div>
                <div className="text-sm text-muted-foreground">Masters Ausentes</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <UserPlus className="w-8 h-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">{result.stats.members_not_found}</div>
                <div className="text-sm text-muted-foreground">Membros Ausentes</div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {result.dryRun && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ℹ️ Esta foi uma simulação. Nenhuma alteração foi feita no banco de dados.
              Para executar a sincronização real, clique no botão <strong>"Sincronizar (Real)"</strong>.
            </AlertDescription>
          </Alert>
        )}

        {!result.dryRun && result.stats.errors === 0 && result.stats.warnings === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              ✅ Sincronização concluída com sucesso! Todos os dados foram processados corretamente.
            </AlertDescription>
          </Alert>
        )}

        {!result.dryRun && result.stats.errors === 0 && result.stats.warnings > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              ✅ Sincronização concluída com {result.stats.warnings} aviso(s).
              {result.stats.masters_not_found > 0 && ` ${result.stats.masters_not_found} master(s) não foram encontrados no sistema e foram ignorados.`}
              {result.stats.members_not_found > 0 && ` ${result.stats.members_not_found} membro(s) não foram encontrados.`}
            </AlertDescription>
          </Alert>
        )}

        {result.stats.errors > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ {result.stats.errors} erro(s) crítico(s) encontrado(s) durante o processamento.
              Verifique os logs abaixo para mais detalhes.
            </AlertDescription>
          </Alert>
        )}

        {/* Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Logs de Operação</h3>
            <Badge variant="outline">
              {result.totalLogs} operações totais
            </Badge>
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-2">
              {errorLogs.length > 0 && (
                <>
                  <div className="text-sm font-semibold text-red-600 mb-2">
                    ❌ Erros Críticos ({errorLogs.length})
                  </div>
                  {errorLogs.map((log, index) => (
                    <div key={`error-${index}`} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1 flex-1">
                          <div className="text-sm font-medium">{log.operation}</div>
                          <div className="text-xs text-muted-foreground">
                            Master: {log.master_email}
                            {log.member_email && ` → Membro: ${log.member_email}`}
                          </div>
                          {log.message && (
                            <div className="text-xs text-red-600">{log.message}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-b my-4" />
                </>
              )}

              {warningLogs.length > 0 && (
                <>
                  <div className="text-sm font-semibold text-yellow-600 mb-2">
                    ⚠️ Avisos ({warningLogs.length})
                  </div>
                  {warningLogs.slice(0, 20).map((log, index) => (
                    <div key={`warning-${index}`} className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5 flex-1">
                          <div className="text-xs font-medium">{log.operation}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.master_email}
                            {log.member_email && ` → ${log.member_email}`}
                          </div>
                          {log.message && (
                            <div className="text-xs text-yellow-700">{log.message}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {warningLogs.length > 20 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      ... e mais {warningLogs.length - 20} avisos
                    </div>
                  )}
                  <div className="border-b my-4" />
                </>
              )}

              {successLogs.slice(0, 50).map((log, index) => (
                <div key={`success-${index}`} className="p-2 rounded-lg bg-muted/50 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {log.operation}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{log.master_email}</span>
                      </div>
                      {log.member_email && (
                        <div className="text-xs text-muted-foreground ml-6">
                          → {log.member_email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {successLogs.length > 50 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  ... e mais {successLogs.length - 50} operações bem-sucedidas
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
