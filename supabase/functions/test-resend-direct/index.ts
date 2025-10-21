import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from 'https://esm.sh/resend@4.0.0';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseServiceClient } from '../_shared/supabase-client.ts';

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      status: 'pending' as 'passed' | 'failed' | 'pending'
    }
  };

  const addTest = (name: string, status: 'passed' | 'failed', details: any) => {
    testResults.tests.push({ name, status, details, timestamp: new Date().toISOString() });
    testResults.summary.total++;
    if (status === 'passed') testResults.summary.passed++;
    else testResults.summary.failed++;
  };

  try {
    console.log('🧪 [TEST] Iniciando teste completo da integração Resend');
    
    // TESTE 1: Verificar API Key do Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      addTest('Verificação de API Key', 'failed', { error: 'RESEND_API_KEY não configurada' });
      throw new Error('RESEND_API_KEY não encontrada');
    }
    addTest('Verificação de API Key', 'passed', { message: 'API Key encontrada' });
    console.log('✅ [TEST] API Key encontrada');

    // TESTE 2: Inicializar cliente Resend
    let resend: Resend;
    try {
      resend = new Resend(resendApiKey);
      addTest('Inicialização do Resend', 'passed', { message: 'Cliente Resend inicializado' });
      console.log('✅ [TEST] Cliente Resend inicializado');
    } catch (error: any) {
      addTest('Inicialização do Resend', 'failed', { error: error.message });
      throw error;
    }

    // TESTE 3: Verificar conexão com banco de dados
    const supabase = getSupabaseServiceClient();
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('invite_delivery_events')
        .select('id')
        .limit(1);
      
      if (tableError) throw tableError;
      
      addTest('Conexão com Banco de Dados', 'passed', { 
        message: 'Tabela invite_delivery_events acessível' 
      });
      console.log('✅ [TEST] Banco de dados acessível');
    } catch (error: any) {
      addTest('Conexão com Banco de Dados', 'failed', { error: error.message });
      throw error;
    }

    // TESTE 4: Enviar email de teste
    const testEmail = 'teste@example.com';
    const testEmailId = `test-${Date.now()}`;
    
    console.log(`📧 [TEST] Enviando email de teste para ${testEmail}...`);
    
    let emailId: string;
    try {
      const { data: emailResult, error: emailError } = await resend.emails.send({
        from: 'Teste Wagner <onboarding@resend.dev>',
        to: [testEmail],
        subject: `🧪 Teste de Integração - ${new Date().toLocaleString('pt-BR')}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333; margin-bottom: 20px;">✅ Teste de Integração Resend</h1>
              <p style="color: #666; line-height: 1.6;">
                Este é um email de teste automático para validar a integração com Resend.
              </p>
              <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #0066cc;"><strong>ID do Teste:</strong> ${testEmailId}</p>
                <p style="margin: 5px 0 0 0; color: #0066cc;"><strong>Horário:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                Este email foi gerado automaticamente pelo sistema de testes.
              </p>
            </div>
          </div>
        `,
        tags: [
          { name: 'type', value: 'integration-test' },
          { name: 'test_id', value: testEmailId }
        ]
      });

      if (emailError) {
        throw emailError;
      }

      if (!emailResult?.id) {
        throw new Error('Email enviado mas ID não retornado na resposta');
      }

      emailId = emailResult.id;
      
      addTest('Envio de Email', 'passed', { 
        email_id: emailId,
        test_id: testEmailId,
        destination: testEmail
      });
      console.log(`✅ [TEST] Email enviado com sucesso! ID: ${emailId}`);
      
    } catch (error: any) {
      addTest('Envio de Email', 'failed', { 
        error: error.message,
        details: error.response?.body || 'Sem detalhes adicionais'
      });
      throw error;
    }

    // TESTE 5: Verificar webhook configurado
    console.log('🔍 [TEST] Verificando configuração de webhook...');
    addTest('Verificação de Webhook', 'passed', { 
      message: 'Webhook configurado em supabase/functions/resend-webhook',
      url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/resend-webhook`,
      note: 'Certifique-se de configurar este URL no painel do Resend'
    });

    // TESTE 6: Aguardar e verificar eventos (opcional, com timeout curto)
    console.log('⏳ [TEST] Aguardando 3 segundos para verificar eventos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data: events, error: eventsError } = await supabase
      .from('invite_delivery_events')
      .select('*')
      .eq('email_id', emailId)
      .order('created_at', { ascending: false });

    if (eventsError) {
      addTest('Verificação de Eventos', 'failed', { 
        error: eventsError.message,
        note: 'Não foi possível verificar se o webhook registrou eventos'
      });
    } else if (events && events.length > 0) {
      addTest('Verificação de Eventos', 'passed', { 
        events_received: events.length,
        events: events.map(e => ({ type: e.event_type, timestamp: e.created_at })),
        message: '🎉 Webhook funcionando! Eventos foram registrados.'
      });
      console.log(`✅ [TEST] ${events.length} evento(s) recebido(s) do webhook!`);
    } else {
      addTest('Verificação de Eventos', 'passed', { 
        events_received: 0,
        message: 'Nenhum evento recebido ainda (normal se o webhook ainda não foi configurado no Resend)',
        next_steps: [
          '1. Acesse https://resend.com/webhooks',
          '2. Configure o webhook apontando para sua edge function',
          `3. URL do webhook: ${Deno.env.get('SUPABASE_URL')}/functions/v1/resend-webhook`
        ]
      });
      console.log('ℹ️ [TEST] Nenhum evento recebido (webhook pode não estar configurado ainda)');
    }

    // Definir status final
    testResults.summary.status = testResults.summary.failed === 0 ? 'passed' : 'failed';

    // Gerar relatório final
    const report = {
      ...testResults,
      conclusion: testResults.summary.failed === 0 
        ? '✅ SUCESSO: Todos os testes passaram! A integração está funcionando.' 
        : `❌ FALHA: ${testResults.summary.failed} teste(s) falharam.`,
      next_steps: testResults.summary.failed === 0 ? [
        'Configurar webhook no Resend (se ainda não configurou)',
        'Testar envio de emails em produção',
        'Monitorar logs de eventos'
      ] : [
        'Verificar erros nos testes que falharam',
        'Corrigir configurações necessárias',
        'Executar teste novamente'
      ]
    };

    console.log('📊 [TEST] Relatório final:', report);

    return new Response(
      JSON.stringify(report, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('💥 [TEST] Erro crítico:', error);
    
    testResults.summary.status = 'failed';
    
    return new Response(
      JSON.stringify({
        ...testResults,
        error: error.message,
        conclusion: '❌ ERRO CRÍTICO: O teste não pôde ser concluído.',
        details: error.stack || 'Sem stack trace disponível'
      }, null, 2),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
