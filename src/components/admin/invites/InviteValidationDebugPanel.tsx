
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const InviteValidationDebugPanel = () => {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const validateToken = async () => {
    if (!token.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔍 Validando token:', token);
      
      // Buscar convite no banco
      const { data: inviteData, error: inviteError } = await supabase
        .from('invites')
        .select('*')
        .eq('token', token.toUpperCase().trim() as any)
        .maybeSingle();
      
      if (inviteError) {
        console.error('❌ Erro na consulta:', inviteError);
        throw inviteError;
      }
      
      // Verificar se inviteData existe e tem as propriedades necessárias
      const validation = {
        tokenExists: !!inviteData,
        isExpired: inviteData && inviteData.expires_at ? new Date(inviteData.expires_at) < new Date() : false,
        isUsed: inviteData && inviteData.used_at ? !!inviteData.used_at : false,
        isValid: inviteData && inviteData.expires_at ? new Date(inviteData.expires_at) > new Date() && !inviteData.used_at : false,
        rawData: inviteData
      };
      
      console.log('✅ Resultado da validação:', validation);
      
      // Log no audit_logs com casting para any
      try {
        await supabase
          .from('audit_logs')
          .insert({
            event_type: 'token_validation',
            action: 'validate_invite_token',
            details: {
              token: token.substring(0, 4) + '****',
              success: validation.isValid,
              timestamp: new Date().toISOString()
            }
          } as any);
      } catch (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      }
      
      setResult(validation);
      
    } catch (error: any) {
      console.error('❌ Erro na validação:', error);
      setResult({
        error: true,
        message: error.message,
        tokenExists: false,
        isValid: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Validação de Token de Convite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Digite o token do convite"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={validateToken}
            disabled={loading || !token.trim()}
          >
            {loading ? 'Validando...' : 'Validar'}
          </Button>
        </div>
        
        {result && (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {result.error ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : result.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                {result.error 
                  ? 'Erro na validação' 
                  : result.isValid 
                    ? 'Token válido' 
                    : 'Token inválido'
                }
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Token encontrado:</span>
                <Badge variant={result.tokenExists ? "default" : "secondary"}>
                  {result.tokenExists ? 'Sim' : 'Não'}
                </Badge>
              </div>
              {result.tokenExists && (
                <>
                  <div className="flex justify-between">
                    <span>Expirado:</span>
                    <Badge variant={result.isExpired ? "destructive" : "default"}>
                      {result.isExpired ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Usado:</span>
                    <Badge variant={result.isUsed ? "destructive" : "default"}>
                      {result.isUsed ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                </>
              )}
            </div>
            
            {result.message && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {result.message}
              </div>
            )}
            
            {result.rawData && (
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Dados brutos</summary>
                <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.rawData, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
