import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const log: string[] = [];
  
  try {
    log.push('🧪 [TESTE] Iniciando validação da integração Resend + Webhook...\n');

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // PASSO 1: Verificar configuração
    log.push('📋 [PASSO 1] Verificando configuração...');
    log.push(`   ✅ RESEND_API_KEY: ${resendApiKey ? 'Configurado' : '❌ NÃO CONFIGURADO'}`);
    log.push(`   ✅ RESEND_WEBHOOK_SECRET: ${webhookSecret ? 'Configurado' : '⚠️ NÃO CONFIGURADO'}`);
    log.push(`   ✅ Supabase URL: ${supabaseUrl}\n`);

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não está configurado');
    }

    // PASSO 2: Buscar um papel para o teste
    log.push('📋 [PASSO 2] Buscando papel de teste...');
    const { data: role } = await supabase
      .from('user_roles')
      .select('id, name')
      .limit(1)
      .single();

    if (!role) {
      throw new Error('Nenhum papel encontrado no banco');
    }
    log.push(`   ✅ Papel encontrado: ${role.name} (${role.id})\n`);

    // PASSO 3: Criar convite de teste
    const testEmail = `teste-webhook-${Date.now()}@viverdeia.ai`;
    const testToken = `test_${Date.now()}`;
    
    log.push('📋 [PASSO 3] Criando convite de teste...');
    log.push(`   📧 Email: ${testEmail}`);
    
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .insert({
        email: testEmail,
        token: testToken,
        role_id: role.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '🧪 TESTE AUTOMÁTICO - Validação de webhook'
      })
      .select()
      .single();

    if (inviteError || !invite) {
      throw new Error(`Erro ao criar convite: ${inviteError?.message}`);
    }
    log.push(`   ✅ Convite criado: ${invite.id}\n`);

    // PASSO 4: Enviar email via Resend
    log.push('📋 [PASSO 4] Enviando email via Resend...');
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Teste Webhook <convites@viverdeia.ai>',
      to: [testEmail],
      subject: '🧪 Teste de Validação de Webhook',
      html: `
        <h1>🧪 Teste de Webhook</h1>
        <p>Este é um email de teste para validar a integração.</p>
        <p><strong>Convite ID:</strong> ${invite.id}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Email gerado automaticamente. Pode ignorar.
        </p>
      `,
    });

    if (emailError) {
      throw new Error(`Erro ao enviar email: ${emailError.message}`);
    }

    log.push(`   ✅ Email enviado com sucesso!`);
    log.push(`   📬 Email ID: ${emailData?.id}\n`);

    // Atualizar convite com email_id
    await supabase
      .from('invites')
      .update({ 
        email_id: emailData?.id,
        last_sent_at: new Date().toISOString(),
        send_attempts: 1
      })
      .eq('id', invite.id);

    log.push(`   ✅ Convite atualizado com email_id\n`);

    // PASSO 5: Aguardar webhooks
    log.push('📋 [PASSO 5] Aguardando 20 segundos para webhooks chegarem...');
    log.push('   ⏳ Por favor, aguarde...\n');
    
    await new Promise(resolve => setTimeout(resolve, 20000));

    // PASSO 6: Verificar eventos
    log.push('📋 [PASSO 6] Verificando eventos recebidos...');
    
    const { data: events, error: eventsError } = await supabase
      .from('invite_delivery_events')
      .select('*')
      .eq('invite_id', invite.id)
      .order('created_at', { ascending: true });

    if (eventsError) {
      throw new Error(`Erro ao buscar eventos: ${eventsError.message}`);
    }

    if (!events || events.length === 0) {
      log.push('   ❌ NENHUM evento recebido!\n');
      log.push('   ⚠️ DIAGNÓSTICO:');
      log.push('   → O webhook NÃO está funcionando');
      log.push('   → Possíveis causas:');
      log.push('      1. Webhook não configurado no Resend');
      log.push('      2. URL do webhook incorreta');
      log.push('      3. Eventos não selecionados no Resend');
      log.push('      4. Webhook com erro (verificar logs)');
    } else {
      log.push(`   ✅ ${events.length} evento(s) recebido(s)!\n`);
      log.push('   📊 EVENTOS REGISTRADOS:');
      events.forEach((event, idx) => {
        const time = new Date(event.created_at).toLocaleTimeString('pt-BR');
        log.push(`      ${idx + 1}. [${time}] ${event.event_type.toUpperCase()}`);
        if (event.email_id) {
          log.push(`         Email ID: ${event.email_id}`);
        }
      });
      log.push('');
    }

    // PASSO 7: Limpar dados
    log.push('📋 [PASSO 7] Limpando dados de teste...');
    
    await supabase
      .from('invite_delivery_events')
      .delete()
      .eq('invite_id', invite.id);
    
    await supabase
      .from('invites')
      .delete()
      .eq('id', invite.id);
    
    log.push('   ✅ Dados removidos\n');

    // RESUMO FINAL
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const success = events && events.length > 0;
    
    log.push('═══════════════════════════════════════════════════════');
    log.push('📊 RESUMO DO TESTE');
    log.push('═══════════════════════════════════════════════════════');
    log.push(`   Status: ${success ? '✅ SUCESSO' : '❌ FALHA'}`);
    log.push(`   Duração: ${duration}s`);
    log.push(`   Email enviado: ✅ Sim`);
    log.push(`   Eventos recebidos: ${events?.length || 0}`);
    log.push(`   Tipos de eventos: ${events?.map(e => e.event_type).join(', ') || 'nenhum'}`);
    log.push('═══════════════════════════════════════════════════════\n');

    if (success) {
      log.push('🎉 PARABÉNS! A integração Resend + Webhook está funcionando perfeitamente!');
      log.push('✅ Emails estão sendo rastreados em tempo real');
      log.push('✅ O sistema está pronto para uso em produção');
    } else {
      log.push('⚠️ ATENÇÃO! Webhook não está funcionando');
      log.push('');
      log.push('🔧 AÇÕES NECESSÁRIAS:');
      log.push('   1. Verifique se configurou o webhook no Resend:');
      log.push('      → URL: https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/resend-webhook');
      log.push('   2. Verifique se selecionou os eventos corretos');
      log.push('   3. Verifique logs do webhook no Supabase');
      log.push('   4. Teste o webhook no painel do Resend');
    }

    return new Response(
      log.join('\n'),
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/plain; charset=utf-8'
        },
      }
    );

  } catch (error: any) {
    log.push(`\n❌ ERRO: ${error.message}\n`);
    log.push('Stack trace:');
    log.push(error.stack || 'N/A');
    
    return new Response(
      log.join('\n'),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/plain; charset=utf-8'
        },
      }
    );
  }
};

serve(handler);
