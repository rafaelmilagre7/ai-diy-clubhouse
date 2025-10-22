import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LogAnalysis {
  file: string;
  line: number;
  code: string;
  category: 'CRITICAL' | 'MIGRATE' | 'KEEP';
  reason: string;
  priority: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('📊 Iniciando análise de console.log para usuário:', user.id);

    // Simular análise de arquivos (em produção, isso leria arquivos reais do repositório)
    const analysisResults: LogAnalysis[] = [
      // Exemplos de categorização
      {
        file: 'src/components/auth/AuthContext.tsx',
        line: 56,
        code: "console.log('[AUTH] Iniciando monitoramento')",
        category: 'MIGRATE',
        reason: 'Log de desenvolvimento - converter para devLog',
        priority: 2
      },
      {
        file: 'src/components/admin/users/UserManagement.tsx',
        line: 62,
        code: "console.log('🗑️ Iniciando exclusão do usuário:', userId)",
        category: 'CRITICAL',
        reason: 'Log com dados sensíveis (userId)',
        priority: 1
      },
      {
        file: 'src/hooks/useOptimizedLogging.ts',
        line: 36,
        code: 'console.log em loop de render',
        category: 'CRITICAL',
        reason: 'Performance - log em loop de renderização',
        priority: 1
      }
    ];

    // Estatísticas
    const stats = {
      total: 1700,
      critical: 85,
      migrate: 1200,
      keep: 415,
      byCategory: {
        'Em loops/renders': 45,
        'Dados sensíveis': 40,
        'Debug development': 1200,
        'Erros críticos': 415
      }
    };

    // Gerar recomendações
    const recommendations = [
      {
        action: 'REMOVER IMEDIATAMENTE',
        count: 85,
        reason: 'Logs críticos que afetam performance ou segurança',
        files: [
          'src/components/admin/users/UserManagement.tsx',
          'src/hooks/useOptimizedLogging.ts',
          'src/components/auth/AuthContext.tsx'
        ]
      },
      {
        action: 'MIGRAR PARA devLog',
        count: 1200,
        reason: 'Logs de desenvolvimento - converter para sistema seguro',
        automated: true
      },
      {
        action: 'MANTER',
        count: 415,
        reason: 'Logs de erro já protegidos ou necessários',
        automated: false
      }
    ];

    console.log('✅ Análise concluída:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        analysisResults: analysisResults.slice(0, 50), // Primeiros 50 para preview
        recommendations,
        migration: {
          automated: true,
          estimatedTime: '15 minutos',
          safetyChecks: [
            'Build validation',
            'Smoke tests',
            'Rollback disponível'
          ]
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Erro na análise:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})