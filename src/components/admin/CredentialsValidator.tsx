import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface CredentialCheck {
  name: string;
  configured: boolean;
  length?: number;
  status: 'ok' | 'missing' | 'invalid';
  message: string;
}

interface ValidationResult {
  overall_status: 'healthy' | 'partial' | 'critical';
  credentials: CredentialCheck[];
  recommendations: string[];
  timestamp: string;
}

export const CredentialsValidator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const validateCredentials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-credentials');
      
      if (error) {
        throw error;
      }

      setResult(data);
      
      const statusMap = {
        healthy: { message: 'Todas as credenciais estão configuradas', type: 'default' as const },
        partial: { message: 'Algumas credenciais estão faltando', type: 'destructive' as const },
        critical: { message: 'Credenciais críticas estão faltando', type: 'destructive' as const }
      };

      const status = statusMap[data.overall_status];
      toast({
        title: 'Validação de Credenciais',
        description: status.message,
        variant: status.type
      });

    } catch (error: any) {
      console.error('Erro ao validar credenciais:', error);
      toast({
        title: 'Erro na Validação',
        description: error.message || 'Erro ao verificar credenciais',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-success/10 text-success border-success/30';
      case 'missing':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'invalid':
        return 'bg-warning/10 text-warning border-warning/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-success';
      case 'partial':
        return 'text-warning';
      case 'critical':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Validador de Credenciais
          </CardTitle>
          <Button 
            onClick={validateCredentials} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loading ? 'Validando...' : 'Validar Credenciais'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {result && (
          <>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status Geral:</span>
              <Badge variant="outline" className={getOverallStatusColor(result.overall_status)}>
                {result.overall_status === 'healthy' && '✅ Saudável'}
                {result.overall_status === 'partial' && '⚠️ Parcial'}
                {result.overall_status === 'critical' && '❌ Crítico'}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Credenciais:</h4>
              {result.credentials.map((credential) => (
                <div 
                  key={credential.name} 
                  className={`p-3 rounded-lg border ${getStatusColor(credential.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(credential.status)}
                      <span className="font-mono text-sm">{credential.name}</span>
                      {credential.length && (
                        <Badge variant="outline" className="text-xs">
                          {credential.length} chars
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{credential.message}</p>
                </div>
              ))}
            </div>

            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recomendações:</h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-operational">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Última verificação: {new Date(result.timestamp).toLocaleString('pt-BR')}
            </div>
          </>
        )}

        {!result && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Clique em "Validar Credenciais" para verificar a configuração dos Edge Function Secrets</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};