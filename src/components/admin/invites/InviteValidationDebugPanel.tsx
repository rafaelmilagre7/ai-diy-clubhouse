
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ValidationResult {
  isValid: boolean;
  invite?: any;
  error?: string;
  debugInfo?: any;
}

export const InviteValidationDebugPanel = () => {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  const validateToken = async () => {
    if (!token.trim()) {
      toast.error('Por favor, insira um token de convite');
      return;
    }

    setIsValidating(true);
    setResult(null);

    try {
      // Buscar convite diretamente
      const { data: invite, error } = await supabase
        .from('invites')
        .select('*')
        .eq('token', token.trim())
        .single();

      if (error) {
        setResult({
          isValid: false,
          error: error.message,
          debugInfo: error
        });
      } else {
        setResult({
          isValid: true,
          invite,
          debugInfo: {
            expires_at: invite.expires_at,
            used_at: invite.used_at,
            isExpired: new Date(invite.expires_at) < new Date(),
            isUsed: !!invite.used_at
          }
        });
      }

      // Log da tentativa
      await supabase
        .from('audit_logs')
        .insert({
          event_type: 'invite_validation' as any,
          action: 'debug_check',
          details: {
            token: token.trim(),
            success: !error,
            timestamp: new Date().toISOString()
          }
        });

      // Buscar tentativas recentes
      const { data: attempts } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('event_type', 'invite_validation' as any)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (attempts) {
        setRecentAttempts(attempts);
      }

    } catch (error: any) {
      setResult({
        isValid: false,
        error: error.message,
        debugInfo: error
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusBadge = (result: ValidationResult) => {
    if (result.isValid && result.invite) {
      const isExpired = new Date(result.invite.expires_at) < new Date();
      const isUsed = !!result.invite.used_at;

      if (isUsed) {
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><X className="w-3 h-3 mr-1" />Já Usado</Badge>;
      }
      if (isExpired) {
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Expirado</Badge>;
      }
      return <Badge variant="default" className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Válido</Badge>;
    }
    return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Inválido</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Debug de Token de Convite
          </CardTitle>
          <CardDescription>
            Ferramenta para validar e debugar tokens de convite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Token de Convite</Label>
            <div className="flex gap-2">
              <Input
                id="token"
                placeholder="Digite o token do convite..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && validateToken()}
              />
              <Button 
                onClick={validateToken} 
                disabled={isValidating || !token.trim()}
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Validar
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Resultado da Validação</h3>
                {getStatusBadge(result)}
              </div>

              {result.invite ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {result.invite.email}
                  </div>
                  <div>
                    <span className="font-medium">Token:</span> {result.invite.token}
                  </div>
                  <div>
                    <span className="font-medium">Criado em:</span> {new Date(result.invite.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div>
                    <span className="font-medium">Expira em:</span> {new Date(result.invite.expires_at).toLocaleDateString('pt-BR')}
                  </div>
                  {result.invite.used_at && (
                    <div>
                      <span className="font-medium">Usado em:</span> {new Date(result.invite.used_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Tentativas de Envio:</span> {result.invite.send_attempts || 0}
                  </div>
                </div>
              ) : (
                <div className="text-red-600">
                  <strong>Erro:</strong> {result.error}
                </div>
              )}

              {result.debugInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Debug Info</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tentativas Recentes</CardTitle>
            <CardDescription>Últimas 10 validações realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAttempts.map((attempt, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-mono">
                    {attempt.details?.token || 'N/A'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={attempt.details?.success ? "default" : "destructive"}>
                      {attempt.details?.success ? 'Sucesso' : 'Falha'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(attempt.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InviteValidationDebugPanel;
