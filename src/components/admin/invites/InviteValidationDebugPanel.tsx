
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Bug,
  FileText
} from 'lucide-react';
import { useInviteValidation } from '@/hooks/admin/invites/useInviteValidation';
import { supabase } from '@/lib/supabase';

export const InviteValidationDebugPanel = () => {
  const [testToken, setTestToken] = useState('');
  const [validationResults, setValidationResults] = useState<any>(null);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { validateToken } = useInviteValidation();

  const handleTestValidation = async () => {
    if (!testToken.trim()) return;
    
    setLoading(true);
    try {
      const result = await validateToken(testToken.trim());
      setValidationResults(result);
      
      // Buscar logs relacionados
      await fetchDebugLogs(testToken.trim());
    } catch (error) {
      console.error('Erro na validação:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDebugLogs = async (token: string) => {
    try {
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('event_type', 'invite_validation')
        .ilike('resource_id', `%${token.substring(0, 6)}%`)
        .order('timestamp', { ascending: false })
        .limit(10);
      
      setDebugLogs(logs || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  const getValidationStatusIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="h-5 w-5 text-status-success" />
    ) : (
      <XCircle className="h-5 w-5 text-status-error" />
    );
  };

  const getLogStatusBadge = (action: string) => {
    switch (action) {
      case 'validation_success':
        return <Badge className="bg-status-success-lighter text-status-success border-status-success/20">Sucesso</Badge>;
      case 'validation_failed':
        return <Badge variant="destructive">Falha</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Debug de Validação de Convites
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="test" className="space-y-4">
          <TabsList>
            <TabsTrigger value="test">Testar Token</TabsTrigger>
            <TabsTrigger value="logs">Logs de Debug</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Cole aqui o token do convite para testar..."
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleTestValidation}
                disabled={loading || !testToken.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Testando...' : 'Testar'}
              </Button>
            </div>

            {validationResults && (
              <div className="space-y-4">
                <Alert className={validationResults.isValid ? 'border-status-success bg-status-success-lighter' : 'border-status-error bg-status-error-lighter'}>
                  <div className="flex items-center gap-2">
                    {getValidationStatusIcon(validationResults.isValid)}
                    <AlertDescription className="flex-1">
                      <strong>Status:</strong> {validationResults.isValid ? 'Válido' : 'Inválido'}
                      {validationResults.error && (
                        <div className="mt-1 text-sm">
                          <strong>Erro:</strong> {validationResults.error}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>

                {validationResults.invite && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Dados do Convite</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div><strong>Email:</strong> {validationResults.invite.email}</div>
                      <div><strong>Token:</strong> {validationResults.invite.token?.substring(0, 8)}***</div>
                      <div><strong>Expira em:</strong> {new Date(validationResults.invite.expires_at).toLocaleString('pt-BR')}</div>
                      <div><strong>Usado em:</strong> {validationResults.invite.used_at ? new Date(validationResults.invite.used_at).toLocaleString('pt-BR') : 'Não usado'}</div>
                    </CardContent>
                  </Card>
                )}

                {validationResults.suggestions && validationResults.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Sugestões
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        {validationResults.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {validationResults.debugInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Informações de Debug</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                        {JSON.stringify(validationResults.debugInfo, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Logs de Validação Recentes</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDebugLogs(testToken)}
                disabled={!testToken.trim()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Atualizar Logs
              </Button>
            </div>

            {debugLogs.length > 0 ? (
              <div className="space-y-3">
                {debugLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        {getLogStatusBadge(log.action)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div><strong>Token:</strong> {log.details?.token_preview || 'N/A'}</div>
                        {log.details?.error_message && (
                          <div><strong>Erro:</strong> {log.details.error_message}</div>
                        )}
                        <div><strong>Comprimento:</strong> {log.details?.token_length || 'N/A'}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log encontrado</p>
                <p className="text-sm">Teste um token para ver os logs de validação</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
