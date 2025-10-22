import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle2, Database, FileText, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DuplicateResult {
  table: string;
  field: string;
  value: string;
  count: number;
  ids: string[];
  description: string;
}

interface AuditReport {
  summary: {
    totalTables: number;
    tablesWithDuplicates: number;
    totalDuplicates: number;
    highPriorityIssues: number;
  };
  duplicates: DuplicateResult[];
  recommendations: string[];
}

const DataAuditPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const { data, error } = await supabase.functions.invoke('audit-duplicates');
      
      if (error) {
        throw error;
      }

      setReport(data);
      
      if (data.duplicates.length === 0) {
        toast.success('✅ Nenhuma duplicata encontrada!');
      } else {
        toast.warning(`⚠️ ${data.duplicates.length} tipos de duplicatas encontrados`);
      }
      
    } catch (err: any) {
      console.error('❌ Erro na auditoria:', err);
      setError(err.message || 'Erro desconhecido na auditoria');
      toast.error('Erro ao executar auditoria');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (field: string) => {
    if (['email', 'code', 'key', 'slug'].includes(field)) {
      return 'bg-destructive/10 text-destructive border-destructive/30';
    }
    return 'bg-warning/10 text-warning border-warning/30';
  };

  const getPriorityLabel = (field: string) => {
    if (['email', 'code', 'key', 'slug'].includes(field)) {
      return 'Alta';
    }
    return 'Média';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Auditoria de Dados</h1>
        <p className="text-muted-foreground">
          Verificação automática de dados duplicados em toda a plataforma
        </p>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Executar Auditoria
          </CardTitle>
          <CardDescription>
            Analisa todas as tabelas principais em busca de registros duplicados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAudit} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isLoading ? 'Executando Auditoria...' : 'Iniciar Auditoria'}
          </Button>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Card className="border-status-error/20 bg-status-error/5">
          <CardHeader>
            <CardTitle className="text-status-error-dark flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Erro na Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-status-error-dark">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {report && (
        <>
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumo da Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-operational">
                    {report.summary.totalTables}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tabelas Verificadas
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-revenue">
                    {report.summary.tablesWithDuplicates}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Com Duplicatas
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {report.summary.totalDuplicates}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Registros Duplicados
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {report.summary.highPriorityIssues}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Alta Prioridade
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duplicatas Encontradas */}
          {report.duplicates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Duplicatas Encontradas
                </CardTitle>
                <CardDescription>
                  {report.duplicates.length} tipos de duplicatas identificados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.duplicates.map((duplicate, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {duplicate.table}.{duplicate.field}
                        </Badge>
                        <Badge className={getPriorityColor(duplicate.field)}>
                          {getPriorityLabel(duplicate.field)} Prioridade
                        </Badge>
                      </div>
                      <Badge variant="secondary">
                        {duplicate.count} registros
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {duplicate.description}
                    </p>
                    
                    <div className="bg-muted p-2 rounded text-sm">
                      <strong>Valor duplicado:</strong> "{duplicate.value}"
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <strong>IDs:</strong> {duplicate.ids.join(', ')}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {report.duplicates.length === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-status-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-revenue" />
                )}
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-status-info mt-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DataAuditPage;