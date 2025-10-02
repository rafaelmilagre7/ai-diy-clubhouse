import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CSVRow {
  usuario_master: string;
  usuario_adicional: string;
}

interface SyncStats {
  masters_processed: number;
  members_processed: number;
  organizations_created: number;
  errors: number;
  warnings: number;
  masters_not_found: number;
  members_not_found: number;
}

interface SyncLog {
  master_email: string;
  member_email?: string;
  operation: string;
  status: string;
  message?: string;
}

const BATCH_SIZE = 20;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============================================
    // FASE 2: Logs detalhados e validação de CSV
    // ============================================
    console.log('[SYNC] ========================================');
    console.log('[SYNC] 🚀 INICIANDO SINCRONIZAÇÃO MASTER/MEMBROS');
    console.log('[SYNC] Timestamp:', new Date().toISOString());
    console.log('[SYNC] ========================================');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Validar body recebido
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('[SYNC] ❌ ERRO: Não foi possível fazer parse do JSON');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Body da requisição inválido' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { csvData, dryRun = false } = requestBody;

    // ✅ VALIDAÇÃO CRÍTICA: Verificar se CSV foi recebido
    if (!csvData || !Array.isArray(csvData)) {
      console.error('[SYNC] ❌ ERRO CRÍTICO: CSV vazio ou não recebido');
      console.error('[SYNC] csvData type:', typeof csvData);
      console.error('[SYNC] csvData:', csvData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'CSV não recebido ou está vazio',
          details: 'O campo csvData deve ser um array válido'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (csvData.length === 0) {
      console.error('[SYNC] ❌ ERRO: CSV sem dados');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'CSV não contém nenhum dado válido'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[SYNC] ✅ CSV recebido com sucesso`);
    console.log(`[SYNC] 📊 Total de registros CSV: ${csvData.length}`);
    console.log(`[SYNC] 🔍 Modo: ${dryRun ? 'DRY-RUN (simulação)' : 'REAL'}`);

    // ============================================
    // ETAPA 1: Coletar todos os masters únicos
    // ============================================
    const masterEmails = new Set<string>();
    const masterGroups = new Map<string, string[]>();
    
    // Primeira passagem: identificar todos os masters
    for (const row of csvData as CSVRow[]) {
      let masterEmail = row.usuario_master?.toLowerCase().trim();
      let memberEmail = row.usuario_adicional?.toLowerCase().trim();
      
      // Se usuario_master vazio, usuario_adicional é o master
      if (!masterEmail && memberEmail) {
        masterEmail = memberEmail;
        memberEmail = '';
      }
      
      if (!masterEmail) continue;
      
      // Adicionar ao conjunto de masters
      masterEmails.add(masterEmail);
      
      // Inicializar grupo se não existir
      if (!masterGroups.has(masterEmail)) {
        masterGroups.set(masterEmail, []);
      }
      
      // Adicionar membro se existir e for diferente do master
      if (memberEmail && memberEmail !== masterEmail) {
        masterGroups.get(masterEmail)!.push(memberEmail);
      }
    }

    const totalMasters = masterGroups.size;
    const totalMembers = Array.from(masterGroups.values())
      .reduce((sum, members) => sum + members.length, 0);

    console.log(`[SYNC] 👥 Masters únicos identificados: ${totalMasters}`);
    console.log(`[SYNC] 👤 Membros únicos identificados: ${totalMembers}`);
    console.log('[SYNC] ========================================');
    console.log('[SYNC] 📋 LISTA DE MASTERS E MEMBROS:');
    
    // Log detalhado de cada master
    let logIndex = 0;
    for (const [masterEmail, members] of masterGroups) {
      logIndex++;
      console.log(`[SYNC] ${logIndex}. Master: ${masterEmail}`);
      console.log(`[SYNC]    └─ Membros (${members.length}): ${members.join(', ')}`);
    }
    console.log('[SYNC] ========================================');

    const stats: SyncStats = {
      masters_processed: 0,
      members_processed: 0,
      organizations_created: 0,
      errors: 0,
      warnings: 0,
      masters_not_found: 0,
      members_not_found: 0
    };

    const logs: SyncLog[] = [];
    
    // Processar em batches
    const masterEntries = Array.from(masterGroups.entries());
    
    for (let i = 0; i < masterEntries.length; i += BATCH_SIZE) {
      const batch = masterEntries.slice(i, i + BATCH_SIZE);
      console.log(`[SYNC] 📦 Processando batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(masterEntries.length / BATCH_SIZE)}`);
      
      for (const [masterEmail, memberEmails] of batch) {
        try {
          // 1. Buscar perfil do master
          let { data: masterProfile, error: masterProfileError } = await supabase
            .from('profiles')
            .select('id, email, name, organization_id, is_master_user')
            .eq('email', masterEmail)
            .maybeSingle();

          if (masterProfileError) throw masterProfileError;

          if (!masterProfile) {
            console.log(`[SYNC] ⚠️  Master não encontrado: ${masterEmail}`);
            logs.push({
              master_email: masterEmail,
              operation: 'find_master',
              status: 'warning',
              message: 'Perfil do master não existe no sistema - ignorando'
            });
            stats.warnings++;
            stats.masters_not_found++;
            continue;
          }

          console.log(`[SYNC] ✅ Master encontrado: ${masterEmail} (${masterProfile.name || 'Sem nome'})`);

          // 2. Criar ou atualizar organization
          let organizationId = masterProfile.organization_id;

          if (!organizationId) {
            if (!dryRun) {
              const { data: newOrg, error: orgError } = await supabase
                .from('organizations')
                .insert({
                  name: `Organização ${masterProfile.name || masterEmail}`,
                  master_user_id: masterProfile.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single();

              if (orgError) throw orgError;
              organizationId = newOrg.id;
              
              console.log(`[SYNC] 🏢 Organization criada para ${masterEmail}`);
            } else {
              console.log(`[SYNC] 🏢 [DRY-RUN] Organization seria criada para ${masterEmail}`);
            }
            
            stats.organizations_created++;
            
            logs.push({
              master_email: masterEmail,
              operation: 'create_organization',
              status: 'success',
              message: dryRun ? 'Simulação: organization criada' : 'Organization criada'
            });
          } else {
            console.log(`[SYNC] 🏢 Organization já existe para ${masterEmail}`);
          }

          // 3. Atualizar perfil do master
          if (!dryRun && (!masterProfile.is_master_user || !masterProfile.organization_id)) {
            const { error: updateMasterError } = await supabase
              .from('profiles')
              .update({
                is_master_user: true,
                organization_id: organizationId,
                updated_at: new Date().toISOString()
              })
              .eq('id', masterProfile.id);

            if (updateMasterError) throw updateMasterError;
            console.log(`[SYNC] 👤 Master atualizado: ${masterEmail}`);
          } else if (dryRun) {
            console.log(`[SYNC] 👤 [DRY-RUN] Master seria atualizado: ${masterEmail}`);
          }

          stats.masters_processed++;
          
          logs.push({
            master_email: masterEmail,
            operation: 'configure_master',
            status: 'success',
            message: `Master configurado com ${memberEmails.length} membros`
          });

          // 4. Processar membros
          for (const memberEmail of memberEmails) {
            try {
              const { data: memberProfile, error: memberError } = await supabase
                .from('profiles')
                .select('id, email, name')
                .eq('email', memberEmail)
                .maybeSingle();

              if (memberError) throw memberError;

              if (!memberProfile) {
                console.log(`[SYNC] ⚠️  Membro não encontrado: ${memberEmail}`);
                logs.push({
                  master_email: masterEmail,
                  member_email: memberEmail,
                  operation: 'find_member',
                  status: 'warning',
                  message: 'Perfil do membro não existe - ignorando'
                });
                stats.warnings++;
                stats.members_not_found++;
                continue;
              }

              if (!dryRun) {
                const { error: updateMemberError } = await supabase
                  .from('profiles')
                  .update({
                    organization_id: organizationId,
                    master_email: masterEmail,
                    is_master_user: false,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', memberProfile.id);

                if (updateMemberError) throw updateMemberError;
                console.log(`[SYNC] 👤 Membro associado: ${memberEmail} -> ${masterEmail}`);
              } else {
                console.log(`[SYNC] 👤 [DRY-RUN] Membro seria associado: ${memberEmail} -> ${masterEmail}`);
              }

              stats.members_processed++;
              
              logs.push({
                master_email: masterEmail,
                member_email: memberEmail,
                operation: 'associate_member',
                status: 'success',
                message: dryRun ? 'Simulação: membro associado' : 'Membro associado'
              });

            } catch (memberError) {
              console.error(`[SYNC] ❌ Erro ao processar membro ${memberEmail}:`, memberError);
              const errorMessage = memberError instanceof Error ? memberError.message : String(memberError);
              logs.push({
                master_email: masterEmail,
                member_email: memberEmail,
                operation: 'associate_member',
                status: 'error',
                message: errorMessage
              });
              stats.errors++;
            }
          }

        } catch (masterError) {
          console.error(`[SYNC] ❌ Erro ao processar master ${masterEmail}:`, masterError);
          const errorMessage = masterError instanceof Error ? masterError.message : String(masterError);
          logs.push({
            master_email: masterEmail,
            operation: 'process_master',
            status: 'error',
            message: errorMessage
          });
          stats.errors++;
        }
      }
    }

    // Salvar logs no banco (apenas em modo real)
    let logsSaved = 0;
    if (!dryRun && logs.length > 0) {
      try {
        const logBatches = [];
        for (let i = 0; i < logs.length; i += 100) {
          logBatches.push(logs.slice(i, i + 100));
        }

        for (const logBatch of logBatches) {
          const { error: logError, count } = await supabase
            .from('master_member_sync_log')
            .insert(
              logBatch.map(log => ({
                master_email: log.master_email,
                member_email: log.member_email,
                operation: log.operation,
                sync_status: log.status,
                message: log.message,
                synced_at: new Date().toISOString()
              }))
            )
            .select('*', { count: 'exact', head: true });

          if (logError) {
            console.error(`[SYNC] ❌ ERRO ao salvar logs:`, logError);
            throw new Error(`Falha ao salvar logs: ${logError.message}`);
          }
          
          logsSaved += logBatch.length;
        }
        
        console.log(`[SYNC] 💾 ${logsSaved} logs salvos com sucesso no banco`);
      } catch (logError) {
        console.error('[SYNC] ❌ ERRO CRÍTICO ao salvar logs:', logError);
        // Não falhar a sincronização, mas avisar
        stats.errors++;
      }
    }

    console.log('[SYNC] ========================================');
    console.log('[SYNC] ✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log(`[SYNC] 📊 Masters processados: ${stats.masters_processed}`);
    console.log(`[SYNC] 👥 Membros processados: ${stats.members_processed}`);
    console.log(`[SYNC] 🏢 Organizations criadas: ${stats.organizations_created}`);
    console.log('[SYNC] ========================================');
    console.log(`[SYNC] ⚠️  Masters não encontrados: ${stats.masters_not_found}`);
    console.log(`[SYNC] ⚠️  Membros não encontrados: ${stats.members_not_found}`);
    console.log(`[SYNC] ⚠️  Total de warnings: ${stats.warnings}`);
    console.log(`[SYNC] ❌ Erros críticos: ${stats.errors}`);
    console.log(`[SYNC] 📝 Total de logs: ${logs.length}`);
    console.log('[SYNC] ========================================');

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        stats,
        logs: logs.slice(0, 100),
        totalLogs: logs.length,
        logsSavedToDb: dryRun ? 0 : logsSaved
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[SYNC] ❌ Erro fatal:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});