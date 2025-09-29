import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRow {
  usuario_master: string;
  usuario_adicional?: string;
}

interface SyncResult {
  success: boolean;
  stats: {
    masters_processed: number;
    members_processed: number;
    organizations_created: number;
    errors: number;
  };
  logs: Array<{
    master_email: string;
    member_email?: string;
    operation: string;
    status: string;
    message?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autenticação do usuário
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se é admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role_id, user_roles:role_id(name)')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.user_roles && 
      typeof profile.user_roles === 'object' && 
      'name' in profile.user_roles && 
      profile.user_roles.name === 'admin';

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Apenas admins podem executar sincronização' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { csvData } = await req.json();

    if (!csvData || !Array.isArray(csvData)) {
      return new Response(
        JSON.stringify({ error: 'Dados do CSV inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Iniciando sincronização de ${csvData.length} linhas do CSV`);

    const result: SyncResult = {
      success: true,
      stats: {
        masters_processed: 0,
        members_processed: 0,
        organizations_created: 0,
        errors: 0
      },
      logs: []
    };

    // Extrair masters únicos
    const uniqueMasters = [...new Set(csvData.map((row: CSVRow) => row.usuario_master?.toLowerCase().trim()).filter(Boolean))];
    console.log(`👥 Encontrados ${uniqueMasters.length} masters únicos`);

    // Buscar role de master_user e membro_adicional
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('id, name')
      .in('name', ['master_user', 'membro_adicional', 'member']);

    const masterRoleId = roles?.find(r => r.name === 'master_user')?.id;
    const memberRoleId = roles?.find(r => r.name === 'membro_adicional')?.id || roles?.find(r => r.name === 'member')?.id;

    if (!masterRoleId || !memberRoleId) {
      return new Response(
        JSON.stringify({ error: 'Roles não encontradas no sistema' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar cada master
    for (const masterEmail of uniqueMasters) {
      try {
        console.log(`\n🔄 Processando master: ${masterEmail}`);
        
        // Buscar ou criar perfil do master
        let { data: masterProfile, error: masterError } = await supabaseClient
          .from('profiles')
          .select('id, organization_id, is_master_user')
          .eq('email', masterEmail)
          .maybeSingle();

        if (masterError) {
          console.error(`❌ Erro ao buscar master ${masterEmail}:`, masterError);
          result.logs.push({
            master_email: masterEmail,
            operation: 'master_lookup',
            status: 'error',
            message: masterError.message
          });
          result.stats.errors++;
          continue;
        }

        let organizationId = masterProfile?.organization_id;

        // Se o perfil não existe, criar
        if (!masterProfile) {
          console.log(`➕ Criando perfil para master: ${masterEmail}`);
          
          const { data: newMaster, error: createError } = await supabaseClient
            .from('profiles')
            .insert({
              email: masterEmail,
              name: masterEmail.split('@')[0],
              role_id: masterRoleId,
              is_master_user: true,
              plan_type: 'team'
            })
            .select()
            .single();

          if (createError) {
            console.error(`❌ Erro ao criar master ${masterEmail}:`, createError);
            result.logs.push({
              master_email: masterEmail,
              operation: 'master_create',
              status: 'error',
              message: createError.message
            });
            result.stats.errors++;
            continue;
          }

          masterProfile = newMaster;
          result.logs.push({
            master_email: masterEmail,
            operation: 'master_created',
            status: 'success'
          });
        } else if (!masterProfile.is_master_user) {
          // Atualizar para master se não for
          await supabaseClient
            .from('profiles')
            .update({ 
              is_master_user: true,
              role_id: masterRoleId,
              plan_type: 'team'
            })
            .eq('id', masterProfile.id);

          result.logs.push({
            master_email: masterEmail,
            operation: 'master_updated',
            status: 'success'
          });
        }

        // Criar organization se não existir
        if (!organizationId) {
          console.log(`🏢 Criando organização para master: ${masterEmail}`);
          
          if (!masterProfile?.id) {
            console.error(`❌ Master profile sem ID: ${masterEmail}`);
            continue;
          }

          const { data: newOrg, error: orgError } = await supabaseClient
            .from('organizations')
            .insert({
              name: `Equipe ${masterEmail.split('@')[0]}`,
              master_user_id: masterProfile.id,
              max_users: 50 // Limite padrão
            })
            .select()
            .single();

          if (orgError) {
            console.error(`❌ Erro ao criar organization para ${masterEmail}:`, orgError);
            result.logs.push({
              master_email: masterEmail,
              operation: 'organization_create',
              status: 'error',
              message: orgError.message
            });
            result.stats.errors++;
            continue;
          }

          organizationId = newOrg.id;

          // Atualizar perfil do master com organization_id
          await supabaseClient
            .from('profiles')
            .update({ organization_id: organizationId })
            .eq('id', masterProfile.id);

          result.stats.organizations_created++;
          result.logs.push({
            master_email: masterEmail,
            operation: 'organization_created',
            status: 'success'
          });
        }

        result.stats.masters_processed++;

        // Processar membros deste master
        const memberRows = csvData.filter(
          (row: CSVRow) => row.usuario_master?.toLowerCase().trim() === masterEmail && row.usuario_adicional
        );

        console.log(`👤 Processando ${memberRows.length} membros para ${masterEmail}`);

        for (const row of memberRows) {
          const memberEmail = row.usuario_adicional?.toLowerCase().trim();
          if (!memberEmail) continue;

          try {
            // Buscar ou criar membro
            let { data: memberProfile } = await supabaseClient
              .from('profiles')
              .select('id, organization_id')
              .eq('email', memberEmail)
              .maybeSingle();

            if (!memberProfile) {
              // Criar perfil do membro
              const { data: newMember, error: memberError } = await supabaseClient
                .from('profiles')
                .insert({
                  email: memberEmail,
                  name: memberEmail.split('@')[0],
                  role_id: memberRoleId,
                  organization_id: organizationId,
                  is_master_user: false,
                  master_email: masterEmail
                })
                .select()
                .single();

              if (memberError) {
                console.error(`❌ Erro ao criar membro ${memberEmail}:`, memberError);
                result.logs.push({
                  master_email: masterEmail,
                  member_email: memberEmail,
                  operation: 'member_create',
                  status: 'error',
                  message: memberError.message
                });
                result.stats.errors++;
                continue;
              }

              result.logs.push({
                master_email: masterEmail,
                member_email: memberEmail,
                operation: 'member_created',
                status: 'success'
              });
            } else {
              // Atualizar membro existente
              await supabaseClient
                .from('profiles')
                .update({
                  organization_id: organizationId,
                  master_email: masterEmail,
                  role_id: memberRoleId
                })
                .eq('id', memberProfile.id);

              result.logs.push({
                master_email: masterEmail,
                member_email: memberEmail,
                operation: 'member_updated',
                status: 'success'
              });
            }

            result.stats.members_processed++;
          } catch (memberErr) {
            console.error(`❌ Erro ao processar membro ${memberEmail}:`, memberErr);
            const errorMessage = memberErr instanceof Error ? memberErr.message : 'Erro desconhecido';
            result.logs.push({
              master_email: masterEmail,
              member_email: memberEmail,
              operation: 'member_process',
              status: 'error',
              message: errorMessage
            });
            result.stats.errors++;
          }
        }
      } catch (err) {
        console.error(`❌ Erro ao processar master ${masterEmail}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        result.logs.push({
          master_email: masterEmail,
          operation: 'master_process',
          status: 'error',
          message: errorMessage
        });
        result.stats.errors++;
      }
    }

    // Salvar logs no banco
    if (result.logs.length > 0) {
      await supabaseClient
        .from('master_member_sync_log')
        .insert(result.logs.map(log => ({
          master_email: log.master_email,
          member_email: log.member_email,
          operation: log.operation,
          sync_status: log.status,
          error_message: log.message,
          metadata: { processed_at: new Date().toISOString() }
        })));
    }

    console.log(`✅ Sincronização concluída:`, result.stats);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro fatal na sincronização:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});