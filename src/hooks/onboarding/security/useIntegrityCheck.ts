
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface IntegrityResult {
  checkId: string;
  status: 'passed' | 'issues_found';
  issuesCount: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
  }>;
  autoCorrections: Array<{
    type: string;
    action: string;
  }>;
  correctionsApplied: boolean;
}

export const useIntegrityCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkIntegrity = useCallback(async (userId: string): Promise<IntegrityResult | null> => {
    setIsChecking(true);
    
    try {
      console.log('🔍 Iniciando verificação de integridade para usuário:', userId);

      const { data, error } = await supabase.rpc('check_onboarding_integrity', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao verificar integridade:', error);
        toast.error('Erro na verificação de integridade');
        return null;
      }

      const result = data as IntegrityResult;
      
      console.log('✅ Verificação de integridade concluída:', {
        status: result.status,
        issuesFound: result.issuesCount,
        correctionsApplied: result.correctionsApplied
      });

      // Mostrar resultados ao usuário
      if (result.status === 'passed') {
        console.log('✅ Verificação de integridade: PASSOU');
      } else {
        console.warn('⚠️ Verificação de integridade encontrou problemas:', result.issues);
        
        if (result.correctionsApplied) {
          toast.success('Problemas detectados e corrigidos automaticamente', {
            description: `${result.autoCorrections.length} correções aplicadas`
          });
        } else if (result.issuesCount > 0) {
          const criticalIssues = result.issues.filter(issue => issue.severity === 'critical');
          if (criticalIssues.length > 0) {
            toast.error('Problemas críticos detectados', {
              description: 'Entre em contato com o suporte'
            });
          }
        }
      }

      return result;
    } catch (error: any) {
      console.error('❌ Exceção na verificação de integridade:', error);
      toast.error('Erro na verificação de integridade');
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkIntegrity,
    isChecking
  };
};
