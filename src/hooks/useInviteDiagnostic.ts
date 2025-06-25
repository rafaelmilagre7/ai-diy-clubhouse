
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface DiagnosticResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
}

export const useInviteDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostic = async (token: string) => {
    setIsRunning(true);
    setResults([]);
    const diagnostics: DiagnosticResult[] = [];

    logger.info('[INVITE-DIAGNOSTIC] 🔬 Iniciando diagnóstico completo:', {
      token: token.substring(0, 8) + '***'
    });

    // Teste 1: Verificar se token existe
    try {
      const start = Date.now();
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('token', token)
        .maybeSingle();
      
      const duration = Date.now() - start;
      
      diagnostics.push({
        step: '1. Buscar convite por token',
        success: !error && !!data,
        data: data ? {
          email: data.email,
          used_at: data.used_at,
          expires_at: data.expires_at,
          role_id: data.role_id
        } : null,
        error: error?.message,
        duration
      });

      // Teste 2: Verificar role se encontrou convite
      if (data && data.role_id) {
        try {
          const roleStart = Date.now();
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('id', data.role_id)
            .single();
          
          diagnostics.push({
            step: '2. Buscar dados do role',
            success: !roleError && !!roleData,
            data: roleData,
            error: roleError?.message,
            duration: Date.now() - roleStart
          });
        } catch (roleErr: any) {
          diagnostics.push({
            step: '2. Buscar dados do role',
            success: false,
            error: roleErr.message,
            duration: 0
          });
        }
      }

      // Teste 3: Verificar validade
      if (data) {
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        const isExpired = now > expiresAt;
        const isUsed = data.used_at !== null;

        diagnostics.push({
          step: '3. Verificar validade',
          success: !isExpired && !isUsed,
          data: {
            is_expired: isExpired,
            is_used: isUsed,
            expires_at: data.expires_at,
            used_at: data.used_at
          },
          error: isExpired ? 'Convite expirado' : isUsed ? 'Convite já utilizado' : undefined,
          duration: 0
        });
      }

    } catch (err: any) {
      diagnostics.push({
        step: '1. Buscar convite por token',
        success: false,
        error: err.message,
        duration: 0
      });
    }

    setResults(diagnostics);
    setIsRunning(false);

    // Log consolidado
    logger.info('[INVITE-DIAGNOSTIC] 📋 Diagnóstico completo:', {
      token: token.substring(0, 8) + '***',
      results: diagnostics
    });

    return diagnostics;
  };

  return {
    runDiagnostic,
    isRunning,
    results
  };
};
