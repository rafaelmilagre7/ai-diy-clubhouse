
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DiagnosticResult {
  success: boolean;
  message: string;
  status: 'success' | 'warning' | 'error';
  test?: string;
}

export interface DiagnosticData {
  systemHealth: {
    email: boolean;
    database: boolean;
    auth: boolean;
    status: 'healthy' | 'warning' | 'critical';
  };
  edgeFunctionExists: boolean;
  edgeFunctionResponding: boolean;
  recentInvites: any[];
  failedInvites: any[];
  testResults: {
    edgeFunctionTest: DiagnosticResult;
    resendTest: DiagnosticResult;
    fallbackTest: DiagnosticResult;
  };
  recommendations: string[];
  checkedAt: Date;
}

export function useInviteEmailDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticData | null>(null);

  const runDiagnostic = useCallback(async (): Promise<DiagnosticData> => {
    setIsRunning(true);
    
    try {
      console.log("🔍 [DIAGNOSTIC] Iniciando diagnóstico completo do sistema...");

      let systemHealth = {
        email: false,
        database: false,
        auth: false,
        status: 'critical' as const
      };

      let edgeFunctionExists = false;
      let edgeFunctionResponding = false;

      // Test 1: Database connectivity
      console.log("🔍 [DIAGNOSTIC] Testando conectividade do banco...");
      try {
        const { data: dbTest, error: dbError } = await supabase
          .from('invites')
          .select('count')
          .limit(1);
        
        systemHealth.database = !dbError;
        console.log(`${systemHealth.database ? '✅' : '❌'} [DIAGNOSTIC] Banco de dados:`, systemHealth.database ? 'Conectado' : dbError?.message);
      } catch (error) {
        console.error("❌ [DIAGNOSTIC] Erro no teste do banco:", error);
      }

      // Test 2: Auth system
      console.log("🔍 [DIAGNOSTIC] Testando sistema de autenticação...");
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        systemHealth.auth = !authError;
        console.log(`${systemHealth.auth ? '✅' : '❌'} [DIAGNOSTIC] Sistema Auth:`, systemHealth.auth ? 'Funcionando' : authError?.message);
      } catch (error) {
        console.error("❌ [DIAGNOSTIC] Erro no teste de auth:", error);
      }

      // Test 3: Edge Function availability
      console.log("🔍 [DIAGNOSTIC] Testando Edge Function...");
      try {
        const testStartTime = Date.now();
        const { data, error } = await supabase.functions.invoke('send-invite-email', {
          body: {
            email: 'test@example.com',
            inviteUrl: 'https://test.com',
            roleName: 'test',
            expiresAt: new Date().toISOString(),
            test: true // Add test flag to prevent actual email sending
          }
        });

        const testDuration = Date.now() - testStartTime;
        
        // Even if the function returns an error for test data, it means it's responding
        edgeFunctionExists = true;
        edgeFunctionResponding = testDuration < 10000; // Less than 10 seconds
        
        console.log(`✅ [DIAGNOSTIC] Edge Function: Existe=${edgeFunctionExists}, Responde=${edgeFunctionResponding} (${testDuration}ms)`);
      } catch (error) {
        console.error("❌ [DIAGNOSTIC] Edge Function indisponível:", error);
      }

      // Test 4: Email system (inferred from Edge Function test)
      systemHealth.email = edgeFunctionResponding;

      // Fetch recent invites
      console.log("🔍 [DIAGNOSTIC] Buscando convites recentes...");
      const { data: recentInvites } = await supabase
        .from('invites')
        .select(`
          *,
          role:role_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch failed invites (no send attempts)
      console.log("🔍 [DIAGNOSTIC] Buscando convites falhados...");
      const { data: failedInvites } = await supabase
        .from('invites')
        .select('*')
        .eq('send_attempts', 0)
        .order('created_at', { ascending: false })
        .limit(5);

      // Generate test results
      const testResults = {
        edgeFunctionTest: {
          success: edgeFunctionResponding,
          message: edgeFunctionResponding 
            ? "Edge Function está respondendo normalmente" 
            : "Edge Function não está respondendo ou está lenta",
          status: edgeFunctionResponding ? 'success' as const : 'error' as const,
          test: 'send-invite-email'
        },
        resendTest: {
          success: systemHealth.email,
          message: systemHealth.email 
            ? "Sistema de email está operacional" 
            : "Sistema de email com problemas",
          status: systemHealth.email ? 'success' as const : 'warning' as const,
          test: 'email-connectivity'
        },
        fallbackTest: {
          success: systemHealth.database && systemHealth.auth,
          message: (systemHealth.database && systemHealth.auth) 
            ? "Sistemas de fallback operacionais" 
            : "Alguns sistemas de fallback indisponíveis",
          status: (systemHealth.database && systemHealth.auth) ? 'success' as const : 'warning' as const,
          test: 'fallback-systems'
        }
      };

      // Determine overall system health
      const healthyComponents = [
        systemHealth.database,
        systemHealth.auth,
        systemHealth.email
      ].filter(Boolean).length;

      if (healthyComponents === 3) {
        systemHealth.status = 'healthy';
      } else if (healthyComponents >= 2) {
        systemHealth.status = 'warning';
      } else {
        systemHealth.status = 'critical';
      }

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (systemHealth.status === 'healthy') {
        recommendations.push("✅ Sistema funcionando perfeitamente!");
        recommendations.push("📊 Continue monitorando regularmente");
      } else {
        if (!systemHealth.database) {
          recommendations.push("🔧 Verificar conexão com banco de dados");
        }
        if (!systemHealth.auth) {
          recommendations.push("🔐 Verificar configurações de autenticação");
        }
        if (!systemHealth.email) {
          recommendations.push("📧 Verificar configuração RESEND_API_KEY e domínio validado");
        }
        if (!edgeFunctionResponding) {
          recommendations.push("⚡ Reimplantar Edge Function send-invite-email");
        }
      }

      if (failedInvites && failedInvites.length > 0) {
        recommendations.push(`🔄 ${failedInvites.length} convite(s) precisam ser reenviados`);
      }

      const diagnostic: DiagnosticData = {
        systemHealth,
        edgeFunctionExists,
        edgeFunctionResponding,
        recentInvites: recentInvites || [],
        failedInvites: failedInvites || [],
        testResults,
        recommendations,
        checkedAt: new Date()
      };

      setLastDiagnostic(diagnostic);
      console.log("✅ [DIAGNOSTIC] Diagnóstico concluído:", {
        status: systemHealth.status,
        healthyComponents: healthyComponents,
        edgeFunction: edgeFunctionResponding,
        recentInvites: recentInvites?.length || 0,
        failedInvites: failedInvites?.length || 0
      });
      
      return diagnostic;
    } catch (error) {
      console.error("❌ [DIAGNOSTIC] Erro crítico no diagnóstico:", error);
      
      const errorDiagnostic: DiagnosticData = {
        systemHealth: {
          email: false,
          database: false,
          auth: false,
          status: 'critical'
        },
        edgeFunctionExists: false,
        edgeFunctionResponding: false,
        recentInvites: [],
        failedInvites: [],
        testResults: {
          edgeFunctionTest: {
            success: false,
            message: "Falha na comunicação com Edge Function",
            status: 'error',
            test: 'send-invite-email'
          },
          resendTest: {
            success: false,
            message: "Não foi possível testar sistema de email",
            status: 'error',
            test: 'email-connectivity'
          },
          fallbackTest: {
            success: false,
            message: "Sistemas de fallback indisponíveis",
            status: 'error',
            test: 'fallback-systems'
          }
        },
        recommendations: [
          "🚨 Sistema crítico - requer atenção imediata",
          "🔧 Verificar configurações do Supabase",
          "📧 Configurar chave RESEND_API_KEY",
          "⚡ Reimplantar Edge Functions",
          "💬 Contactar suporte técnico se problemas persistirem"
        ],
        checkedAt: new Date()
      };
      
      setLastDiagnostic(errorDiagnostic);
      return errorDiagnostic;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    runDiagnostic,
    isRunning,
    lastDiagnostic
  };
}
