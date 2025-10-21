import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestReport {
  success: boolean;
  timestamp: string;
  steps: {
    step: string;
    status: 'success' | 'failed' | 'pending';
    details: any;
    duration?: number;
  }[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    webhookConfigured: boolean;
    eventsReceived: string[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🧪 [TEST-RESEND] Iniciando testes de integração...');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const report: TestReport = {
    success: false,
    timestamp: new Date().toISOString(),
    steps: [],
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      webhookConfigured: false,
      eventsReceived: []
    }
  };

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // TESTE 1: Verificar configuração
    const step1Start = Date.now();
    report.steps.push({
      step: '1. Verificar configuração',
      status: 'pending',
      details: {
        hasResendKey: !!resendApiKey,
        hasWebhookSecret: !!webhookSecret,
        supabaseUrl
      }
    });

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurado');
    }

    report.steps[0].status = 'success';
    report.steps[0].duration = Date.now() - step1Start;
    report.summary.passed++;
    report.summary.webhookConfigured = !!webhookSecret;

    // TESTE 2: Criar convite de teste único
    const step2Start = Date.now();
    const testEmail = `test+${Date.now()}@example.com`;
    const testToken = `test_token_${Date.now()}`;
    
    console.log('📝 [TEST-RESEND] Criando convite de teste:', testEmail);

    const { data: testInvite, error: inviteError } = await supabase
      .from('invites')
      .insert({
        email: testEmail,
        token: testToken,
        role_id: (await supabase.from('user_roles').select('id').limit(1).single()).data?.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '🧪 TESTE AUTOMÁTICO - Este convite foi criado para validar a integração com Resend'
      })
      .select()
      .single();

    if (inviteError) {
      report.steps.push({
        step: '2. Criar convite de teste',
        status: 'failed',
        details: { error: inviteError.message },
        duration: Date.now() - step2Start
      });
      report.summary.failed++;
      throw inviteError;
    }

    report.steps.push({
      step: '2. Criar convite de teste',
      status: 'success',
      details: {
        inviteId: testInvite.id,
        email: testEmail,
        token: testToken
      },
      duration: Date.now() - step2Start
    });
    report.summary.passed++;

    // TESTE 3: Enviar email via Resend
    const step3Start = Date.now();
    console.log('📧 [TEST-RESEND] Enviando email de teste...');

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Teste Viver de IA <convites@viverdeia.ai>',
      to: [testEmail],
      subject: '🧪 Teste de Integração Resend + Webhook',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Teste de Integração</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">🧪 Teste de Integração</h1>
          <p>Este é um email de teste para validar a integração entre:</p>
          <ul>
            <li>✅ Resend (envio de emails)</li>
            <li>✅ Webhooks (rastreamento de eventos)</li>
            <li>✅ Supabase (armazenamento de dados)</li>
          </ul>
          <p><strong>ID do Convite:</strong> ${testInvite.id}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Este email foi gerado automaticamente pelo sistema de testes.
            Você pode ignorá-lo com segurança.
          </p>
        </body>
        </html>
      `,
    });

    if (emailError) {
      report.steps.push({
        step: '3. Enviar email via Resend',
        status: 'failed',
        details: { error: emailError.message },
        duration: Date.now() - step3Start
      });
      report.summary.failed++;
      throw emailError;
    }

    console.log('✅ [TEST-RESEND] Email enviado com ID:', emailData?.id);

    // Atualizar convite com email_id
    await supabase
      .from('invites')
      .update({ email_id: emailData?.id })
      .eq('id', testInvite.id);

    report.steps.push({
      step: '3. Enviar email via Resend',
      status: 'success',
      details: {
        emailId: emailData?.id,
        recipient: testEmail
      },
      duration: Date.now() - step3Start
    });
    report.summary.passed++;

    // TESTE 4: Aguardar webhooks (15 segundos)
    const step4Start = Date.now();
    console.log('⏳ [TEST-RESEND] Aguardando 15s para webhooks chegarem...');

    report.steps.push({
      step: '4. Aguardar webhooks (15s)',
      status: 'pending',
      details: { waitTime: '15 segundos' }
    });

    await new Promise(resolve => setTimeout(resolve, 15000));

    report.steps[report.steps.length - 1].status = 'success';
    report.steps[report.steps.length - 1].duration = Date.now() - step4Start;
    report.summary.passed++;

    // TESTE 5: Verificar eventos no banco
    const step5Start = Date.now();
    console.log('🔍 [TEST-RESEND] Verificando eventos registrados...');

    const { data: events, error: eventsError } = await supabase
      .from('invite_delivery_events')
      .select('*')
      .eq('invite_id', testInvite.id)
      .order('created_at', { ascending: true });

    if (eventsError) {
      report.steps.push({
        step: '5. Verificar eventos no banco',
        status: 'failed',
        details: { error: eventsError.message },
        duration: Date.now() - step5Start
      });
      report.summary.failed++;
      throw eventsError;
    }

    const eventTypes = events?.map(e => e.event_type) || [];
    report.summary.eventsReceived = eventTypes;

    report.steps.push({
      step: '5. Verificar eventos no banco',
      status: events && events.length > 0 ? 'success' : 'failed',
      details: {
        eventsCount: events?.length || 0,
        eventTypes,
        events: events?.map(e => ({
          type: e.event_type,
          timestamp: e.created_at,
          emailId: e.email_id
        }))
      },
      duration: Date.now() - step5Start
    });

    if (events && events.length > 0) {
      report.summary.passed++;
    } else {
      report.summary.failed++;
    }

    // TESTE 6: Limpar dados de teste
    const step6Start = Date.now();
    console.log('🧹 [TEST-RESEND] Limpando dados de teste...');

    await supabase
      .from('invite_delivery_events')
      .delete()
      .eq('invite_id', testInvite.id);

    await supabase
      .from('invites')
      .delete()
      .eq('id', testInvite.id);

    report.steps.push({
      step: '6. Limpar dados de teste',
      status: 'success',
      details: { cleaned: true },
      duration: Date.now() - step6Start
    });
    report.summary.passed++;

    // Resumo final
    report.summary.totalTests = report.steps.length;
    report.success = report.summary.failed === 0;

    console.log('✅ [TEST-RESEND] Testes concluídos:', report.summary);

    return new Response(
      JSON.stringify({
        ...report,
        message: report.success 
          ? '🎉 SUCESSO! Integração Resend + Webhook funcionando perfeitamente!'
          : '⚠️ ATENÇÃO! Alguns testes falharam. Verifique os detalhes.',
        recommendations: generateRecommendations(report)
      }, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ [TEST-RESEND] Erro nos testes:', error);
    
    report.success = false;
    report.summary.totalTests = report.steps.length;
    
    return new Response(
      JSON.stringify({
        ...report,
        error: error.message,
        message: '❌ FALHA! Erro durante os testes de integração.',
        recommendations: generateRecommendations(report)
      }, null, 2),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function generateRecommendations(report: TestReport): string[] {
  const recommendations: string[] = [];

  // Verificar se webhook foi configurado
  if (!report.summary.webhookConfigured) {
    recommendations.push('⚠️ WEBHOOK SECRET não configurado - Configure o signing secret do Resend');
  }

  // Verificar se eventos foram recebidos
  if (report.summary.eventsReceived.length === 0) {
    recommendations.push('⚠️ NENHUM EVENTO recebido - Verifique se o webhook está configurado no Resend');
    recommendations.push('   → URL: https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/resend-webhook');
    recommendations.push('   → Eventos: email.sent, email.delivered, email.opened, etc.');
  } else if (!report.summary.eventsReceived.includes('sent')) {
    recommendations.push('⚠️ Evento "sent" não recebido - Verifique configuração do webhook');
  }

  // Se tudo funcionou
  if (report.summary.failed === 0 && report.summary.eventsReceived.length > 0) {
    recommendations.push('✅ Integração funcionando perfeitamente!');
    recommendations.push('✅ Webhook configurado corretamente');
    recommendations.push('✅ Eventos sendo rastreados em tempo real');
  }

  return recommendations;
}

serve(handler);
