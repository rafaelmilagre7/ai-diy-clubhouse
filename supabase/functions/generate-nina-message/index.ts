import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, onboarding_data } = await req.json();

    if (!user_id || !onboarding_data) {
      throw new Error('user_id e onboarding_data são obrigatórios');
    }

    console.log('🤖 [NINA] Gerando mensagem personalizada para usuário:', user_id);

    // Extrair informações do onboarding
    const personal = onboarding_data.personal_info || {};
    const business = onboarding_data.business_info || {};
    const experience = onboarding_data.ai_experience || {};
    const goals = onboarding_data.goals_info || {};
    const preferences = onboarding_data.personalization || {};

    // Gerar mensagem personalizada baseada no perfil
    let message = `Olá, ${personal.name || 'querido(a)'}! 👋\n\n`;
    message += `Bem-vindo(a) à nossa plataforma de transformação empresarial com IA!\n\n`;

    // Personalizar baseado no setor
    if (business.company_sector) {
      const sectorMessages = {
        'Tecnologia e Software': 'Como alguém do setor de tecnologia, você já está um passo à frente! Vamos ajudá-lo a maximizar o potencial da IA.',
        'Saúde': 'O setor de saúde está sendo revolucionado pela IA. Vamos explorar como você pode liderar essa transformação.',
        'Educação': 'A educação é uma das áreas mais impactadas pela IA. Juntos, vamos descobrir novas formas de ensinar e aprender.',
        'Varejo': 'O varejo está sendo redefinido pela IA. Vamos te mostrar como personalizar experiências e otimizar operações.',
        'Financeiro': 'O setor financeiro já abraçou a IA. Vamos aprofundar estratégias para análise preditiva e automação.',
      };
      
      message += sectorMessages[business.company_sector] || 'Independente do seu setor, a IA pode transformar sua empresa de maneiras incríveis.';
      message += '\n\n';
    }

    // Personalizar baseado na experiência com IA
    if (experience.experience_level) {
      if (experience.experience_level === 'Iniciante') {
        message += '🌱 Como você está começando sua jornada com IA, preparei um caminho gradual e prático para você.\n\n';
      } else if (experience.experience_level === 'Intermediário') {
        message += '🚀 Com sua experiência intermediária, podemos acelerar e focar em implementações mais sofisticadas.\n\n';
      } else if (experience.experience_level === 'Avançado') {
        message += '⭐ Sua experiência avançada nos permite explorar cases complexos e estratégias inovadoras.\n\n';
      }
    }

    // Personalizar baseado nos objetivos
    if (goals.primary_goal) {
      message += `Vejo que seu principal objetivo é: "${goals.primary_goal}". `;
      message += 'Vou garantir que todas as soluções e conteúdos sejam alinhados com essa meta.\n\n';
    }

    // Personalizar baseado nas preferências de aprendizado
    if (preferences.learning_style) {
      const styleMessages = {
        'Prático': 'Como você prefere aprender na prática, preparei exercícios hands-on e implementações reais.',
        'Teórico': 'Para seu perfil teórico, incluí fundamentações sólidas e análises detalhadas.',
        'Visual': 'Pensando no seu estilo visual, utilizarei diagramas, infográficos e demonstrações visuais.',
        'Auditivo': 'Para seu aprendizado auditivo, recomendo nossos podcasts e webinars exclusivos.',
      };
      
      if (styleMessages[preferences.learning_style]) {
        message += styleMessages[preferences.learning_style] + '\n\n';
      }
    }

    // Encerramento motivacional
    message += '🎯 Estou aqui para ser sua parceira nesta jornada de transformação. ';
    message += 'Sempre que precisar de orientação, dicas personalizadas ou quiser compartilhar seus progressos, estarei aqui!\n\n';
    message += '✨ Vamos começar essa aventura juntos?\n\n';
    message += 'Com entusiasmo,\nNINA - Sua Assistente de IA';

    // Salvar a mensagem no banco
    const { error: updateError } = await supabase
      .from('onboarding_final')
      .update({
        completion_message: message,
        message_generated: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('❌ [NINA] Erro ao salvar mensagem:', updateError);
      throw updateError;
    }

    console.log('✅ [NINA] Mensagem gerada e salva com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ [NINA] Erro na function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});