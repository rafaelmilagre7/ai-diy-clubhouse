import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ValidationIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
}

interface ValidationResult {
  user_id: string;
  validation_timestamp: string;
  has_issues: boolean;
  issues_count: number;
  issues: ValidationIssue[];
  onboarding_data: any;
  profile_data: any;
}

export const OnboardingDiagnostic: React.FC = () => {
  const { user } = useAuth();
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 [DIAGNOSTIC] Executando diagnóstico para usuário:', user.id);
      
      const { data, error: funcError } = await supabase.rpc('validate_onboarding_state', {
        p_user_id: user.id
      });

      if (funcError) {
        console.error('❌ [DIAGNOSTIC] Erro na função de validação:', funcError);
        setError('Erro ao executar diagnóstico: ' + funcError.message);
        return;
      }

      console.log('✅ [DIAGNOSTIC] Resultado:', data);
      setValidation(data);
    } catch (err) {
      console.error('❌ [DIAGNOSTIC] Erro inesperado:', err);
      setError('Erro inesperado durante o diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, [user?.id]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Diagnóstico do Onboarding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={runDiagnostic}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Executando...' : 'Executar Diagnóstico'}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {validation && (
          <div className="space-y-4">
            {/* Status Geral */}
            <div className="flex items-center gap-2">
              {validation.has_issues ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <span className="font-medium">
                {validation.has_issues 
                  ? `${validation.issues_count} problema(s) encontrado(s)`
                  : 'Nenhum problema encontrado'
                }
              </span>
            </div>

            {/* Lista de Problemas */}
            {validation.issues && validation.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Problemas Detectados:</h4>
                {validation.issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 border rounded-md">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={getSeverityColor(issue.severity) as any}
                          className="text-xs"
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{issue.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dados do Onboarding */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-md">
                <h4 className="font-medium mb-2">Status do Onboarding</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Existe:</strong> {validation.onboarding_data?.exists ? 'Sim' : 'Não'}</p>
                  {validation.onboarding_data?.exists && (
                    <>
                      <p><strong>Step Atual:</strong> {validation.onboarding_data.current_step}</p>
                      <p><strong>Completo:</strong> {validation.onboarding_data.is_completed ? 'Sim' : 'Não'}</p>
                      <p><strong>Status:</strong> {validation.onboarding_data.status}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 border rounded-md">
                <h4 className="font-medium mb-2">Status do Perfil</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Existe:</strong> {validation.profile_data?.exists ? 'Sim' : 'Não'}</p>
                  {validation.profile_data?.exists && (
                    <>
                      <p><strong>Nome:</strong> {validation.profile_data.name || 'Não definido'}</p>
                      <p><strong>Email:</strong> {validation.profile_data.email || 'Não definido'}</p>
                      <p><strong>Onboarding Completo:</strong> {validation.profile_data.onboarding_completed ? 'Sim' : 'Não'}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Última validação: {new Date(validation.validation_timestamp).toLocaleString('pt-BR')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};