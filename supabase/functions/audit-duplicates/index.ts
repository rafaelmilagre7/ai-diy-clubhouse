import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DuplicateResult {
  table: string;
  field: string;
  value: string;
  count: number;
  ids: string[];
  description: string;
}

interface AuditReport {
  summary: {
    totalTables: number;
    tablesWithDuplicates: number;
    totalDuplicates: number;
    highPriorityIssues: number;
  };
  duplicates: DuplicateResult[];
  recommendations: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Iniciando auditoria de dados duplicados...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const duplicates: DuplicateResult[] = [];
    let totalTables = 0;
    let highPriorityIssues = 0;

    // Tabelas e campos a verificar
    const auditConfig = [
      // Categorias e taxonomias
      {
        table: 'suggestion_categories',
        checks: [
          { field: 'name', description: 'Categorias de sugestão com mesmo nome' },
          { field: 'slug', description: 'Categorias com mesmo slug' }
        ]
      },
      {
        table: 'community_categories', 
        checks: [
          { field: 'name', description: 'Categorias de comunidade com mesmo nome' },
          { field: 'slug', description: 'Categorias de comunidade com mesmo slug' }
        ]
      },
      
      // Usuários e perfis
      {
        table: 'profiles',
        checks: [
          { field: 'email', description: 'Perfis com mesmo email' },
          { field: 'name', description: 'Perfis com mesmo nome completo' }
        ]
      },
      {
        table: 'user_roles',
        checks: [
          { field: 'name', description: 'Papéis de usuário com mesmo nome' }
        ]
      },

      // Conteúdo
      {
        table: 'solutions',
        checks: [
          { field: 'title', description: 'Soluções com mesmo título' },
          { field: 'slug', description: 'Soluções com mesmo slug' }
        ]
      },
      {
        table: 'suggestions',
        checks: [
          { field: 'title', description: 'Sugestões com mesmo título exato' }
        ]
      },
      {
        table: 'community_topics',
        checks: [
          { field: 'title', description: 'Tópicos da comunidade com mesmo título' }
        ]
      },

      // Eventos e comunicações
      {
        table: 'events',
        checks: [
          { field: 'title', description: 'Eventos com mesmo título' }
        ]
      },
      {
        table: 'admin_communications',
        checks: [
          { field: 'title', description: 'Comunicações admin com mesmo título' }
        ]
      },

      // Configurações e metadados
      {
        table: 'admin_settings',
        checks: [
          { field: 'key', description: 'Configurações admin com mesma chave' }
        ]
      },
      {
        table: 'badges',
        checks: [
          { field: 'name', description: 'Badges com mesmo nome' }
        ]
      },

      // Cupons e benefícios
      {
        table: 'coupons',
        checks: [
          { field: 'code', description: 'Cupons com mesmo código' }
        ]
      }
    ];

    console.log(`📊 Verificando ${auditConfig.length} tabelas...`);

    for (const config of auditConfig) {
      totalTables++;
      console.log(`🔍 Auditando tabela: ${config.table}`);

      for (const check of config.checks) {
        try {
          // Buscar duplicatas agrupando por campo
          const { data, error } = await supabase
            .from(config.table)
            .select(`id, ${check.field}`)
            .not(check.field, 'is', null)
            .neq(check.field, '');

          if (error) {
            console.error(`❌ Erro ao verificar ${config.table}.${check.field}:`, error);
            continue;
          }

          if (!data || data.length === 0) {
            console.log(`✅ ${config.table}.${check.field}: Nenhum dado encontrado`);
            continue;
          }

          // Agrupar por valor do campo
          const groupedData = data.reduce((acc: any, row: any) => {
            const value = row[check.field];
            if (!value || typeof value !== 'string') return acc;
            
            const normalizedValue = value.trim().toLowerCase();
            if (!acc[normalizedValue]) {
              acc[normalizedValue] = {
                original: value,
                ids: []
              };
            }
            acc[normalizedValue].ids.push(row.id);
            return acc;
          }, {});

          // Identificar duplicatas
          for (const [normalizedValue, group] of Object.entries(groupedData) as any) {
            if (group.ids.length > 1) {
              const duplicate: DuplicateResult = {
                table: config.table,
                field: check.field,
                value: group.original,
                count: group.ids.length,
                ids: group.ids,
                description: check.description
              };

              duplicates.push(duplicate);

              // Marcar como alta prioridade se for campo crítico
              if (['email', 'code', 'key', 'slug'].includes(check.field)) {
                highPriorityIssues++;
              }

              console.log(`🚨 Duplicata encontrada: ${config.table}.${check.field} = "${group.original}" (${group.ids.length} registros)`);
            }
          }
        } catch (err) {
          console.error(`❌ Erro ao processar ${config.table}.${check.field}:`, err);
        }
      }
    }

    // Gerar recomendações
    const recommendations = [];
    
    if (duplicates.length === 0) {
      recommendations.push('🎉 Parabéns! Nenhuma duplicata foi encontrada na auditoria.');
    } else {
      recommendations.push(`📋 ${duplicates.length} tipos de duplicatas encontrados em ${duplicates.filter((d, i, arr) => arr.findIndex(x => x.table === d.table) === i).length} tabelas.`);
      
      if (highPriorityIssues > 0) {
        recommendations.push(`⚠️ ${highPriorityIssues} duplicatas de alta prioridade encontradas (emails, códigos, chaves únicas).`);
      }

      // Recomendações por tipo
      const tableGroups = duplicates.reduce((acc: any, dup) => {
        if (!acc[dup.table]) acc[dup.table] = [];
        acc[dup.table].push(dup);
        return acc;
      }, {});

      for (const [table, dups] of Object.entries(tableGroups) as any) {
        recommendations.push(`🔧 Tabela ${table}: ${dups.length} tipos de duplicatas. Revisar e consolidar registros.`);
      }

      recommendations.push('📝 Executar migration SQL para consolidar dados duplicados.');
      recommendations.push('🛡️ Adicionar constraints UNIQUE nos campos que devem ser únicos.');
      recommendations.push('🔍 Implementar validação de duplicatas na interface de cadastro.');
    }

    const report: AuditReport = {
      summary: {
        totalTables,
        tablesWithDuplicates: new Set(duplicates.map(d => d.table)).size,
        totalDuplicates: duplicates.reduce((sum, d) => sum + (d.count - 1), 0),
        highPriorityIssues
      },
      duplicates: duplicates.sort((a, b) => {
        // Ordenar por prioridade: email/código primeiro, depois por quantidade
        const aPriority = ['email', 'code', 'key'].includes(a.field) ? 1000 : 0;
        const bPriority = ['email', 'code', 'key'].includes(b.field) ? 1000 : 0;
        return (bPriority + b.count) - (aPriority + a.count);
      }),
      recommendations
    };

    console.log('✅ Auditoria concluída:', report.summary);

    return new Response(
      JSON.stringify(report),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('❌ Erro na auditoria:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({
        error: 'Erro interno na auditoria',
        details: errorDetails,
        summary: {
          totalTables: 0,
          tablesWithDuplicates: 0,
          totalDuplicates: 0,
          highPriorityIssues: 0
        },
        duplicates: [],
        recommendations: ['❌ Erro ao executar auditoria. Verificar logs do servidor.']
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});