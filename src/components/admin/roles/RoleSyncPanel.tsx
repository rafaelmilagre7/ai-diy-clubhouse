
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const RoleSyncPanel = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runAudit = async () => {
    setLoading(true);
    try {
      // Chama a função RPC do banco para auditoria
      const { data, error } = await supabase.rpc('audit_role_assignments');
      
      if (error) throw error;
      
      // Cast para contornar problema de tipos
      const auditResults = data as any;
      
      setResults({
        success: true,
        data: auditResults,
        totalChecked: Array.isArray(auditResults) ? auditResults.length : 0,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Auditoria concluída",
        description: `Verificação de ${Array.isArray(auditResults) ? auditResults.length : 0} registros realizada com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro na auditoria:', error);
      setResults({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Erro na auditoria",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fixIssues = async () => {
    if (!results?.data) return;
    
    setLoading(true);
    try {
      // Implementar correções automáticas baseadas nos resultados
      let fixedCount = 0;
      
      for (const issue of results.data) {
        try {
          // Exemplo de correção: atualizar perfis com role_id null
          if (issue.issue_type === 'missing_role_id') {
            await supabase
              .from('profiles')
              .update({ role_id: issue.suggested_role_id })
              .eq('id', issue.user_id as any);
            fixedCount++;
          }
        } catch (fixError) {
          console.error(`Erro ao corrigir ${issue.id}:`, fixError);
        }
      }
      
      toast({
        title: "Correções aplicadas",
        description: `${fixedCount} problemas foram corrigidos automaticamente.`,
      });
      
      // Executar auditoria novamente para verificar
      await runAudit();
    } catch (error: any) {
      console.error('Erro nas correções:', error);
      toast({
        title: "Erro nas correções",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Correção Sistêmica de Papéis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta ferramenta verifica e corrige inconsistências no sistema de papéis e permissões.
            Execute a auditoria primeiro para identificar problemas.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button 
            onClick={runAudit} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Executando Auditoria...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Executar Auditoria
              </>
            )}
          </Button>
          
          {results?.data?.length > 0 && (
            <Button 
              onClick={fixIssues} 
              disabled={loading}
              variant="destructive"
            >
              Corrigir Problemas
            </Button>
          )}
        </div>

        {results && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {results.success ? 'Auditoria Concluída' : 'Erro na Auditoria'}
              </span>
              <Badge variant="outline">
                {new Date(results.timestamp).toLocaleString('pt-BR')}
              </Badge>
            </div>

            {results.success && (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Registros verificados:</strong> {results.totalChecked}
                </div>
                
                {Array.isArray(results.data) && results.data.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-red-600">
                      Problemas encontrados: {results.data.length}
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {results.data.map((issue: any, index: number) => (
                        <div key={index} className="text-xs p-2 bg-red-50 border border-red-200 rounded">
                          <div><strong>Tipo:</strong> {issue.issue_type}</div>
                          <div><strong>Usuário:</strong> {issue.user_email}</div>
                          <div><strong>Descrição:</strong> {issue.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-green-600">
                    ✅ Nenhum problema encontrado! O sistema está íntegro.
                  </div>
                )}
              </div>
            )}

            {!results.success && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {results.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
