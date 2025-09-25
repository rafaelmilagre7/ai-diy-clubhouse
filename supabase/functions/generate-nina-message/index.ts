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
    let message = `Oi, ${personal.name || 'querido(a)'}! 💙\n\n`;
    message += `Que bom te ver aqui! Sou a Nina, e estou super animada para te acompanhar nessa jornada incrível de transformação com IA.\n\n`;

    // Personalizar baseado no setor
    if (business.company_sector) {
      const sectorMessages = {
        'Tecnologia e Software': 'Adoro trabalhar com pessoal de tech! Vocês têm aquela curiosidade natural que me inspira. Juntos vamos elevar sua expertise em IA a um novo patamar.',
        'Saúde': 'Que setor incrível você escolheu! A IA na saúde tem um potencial transformador imenso. Mal posso esperar para explorarmos juntos como você pode impactar vidas.',
        'Educação': 'Educação é paixão pura! Como educador, você tem o poder de moldar o futuro. Vamos descobrir como a IA pode amplificar seu impacto.',
        'Varejo': 'O varejo está fervilhando com IA! Vamos juntos criar experiências que seus clientes vão amar e processos que vão facilitar sua vida.',
        'Financeiro': 'Finanças + IA = combinação perfeita! Vou te mostrar como usar dados para decisões ainda mais inteligentes e estratégicas.',
      };
      
      message += (sectorMessages as Record<string, string>)[business.company_sector] || 'Não importa qual seja seu setor, tenho certeza que juntos vamos encontrar formas incríveis de usar IA para transformar sua realidade.';
      message += '\n\n';
    }

    // Personalizar baseado na experiência com IA
    if (experience.experience_level) {
      if (experience.experience_level === 'beginner') {
        message += '🌟 Que delícia começar do zero! Adoro acompanhar pessoas nessa descoberta. Vou estar aqui do seu lado em cada passo, sem pressa, no seu ritmo.\n\n';
      } else if (experience.experience_level === 'basic') {
        message += '👍 Vejo que você já deu os primeiros passos! Que orgulho. Agora vamos juntos expandir esse conhecimento de forma gostosa e natural.\n\n';
      } else if (experience.experience_level === 'intermediate') {
        message += '🚀 Amo trabalhar com quem já tem essa base! Podemos acelerar e explorar possibilidades mais ousadas. Vai ser divertido!\n\n';
      } else if (experience.experience_level === 'advanced') {
        message += '⭐ Que experiência incrível você já tem! Vamos aproveitar para mergulhar em estratégias avançadas e inovar juntos.\n\n';
      }
    }

    // Personalizar baseado no status de implementação
    if (experience.implementation_status) {
      const statusMessages: Record<string, string> = {
        'not_started': 'O momento perfeito chegou! Vamos descobrir juntos por onde começar essa aventura.',
        'exploring': 'Que legal que você já está fuçando as possibilidades! Vamos organizar essas ideias e transformar em ação.',
        'testing': 'Adorei saber que você já está testando! Vou te ajudar a extrair o máximo desses testes.',
        'implementing': 'Que demais, já colocando a mão na massa! Vamos acelerar e fazer isso brilhar ainda mais.',
        'advanced': 'Impressionante como você já está avançado! Hora de inovar e surpreender todo mundo.'
      };
      
      if (statusMessages[experience.implementation_status as keyof typeof statusMessages]) {
        message += statusMessages[experience.implementation_status as keyof typeof statusMessages] + '\n\n';
      }
    }

    // Personalizar baseado na abordagem de implementação
    if (experience.implementation_approach) {
      const approachMessages: Record<string, string> = {
        'myself': 'Amo essa independência sua! Vou te equipar com tudo que precisa para arrasar implementando sozinho.',
        'team': 'Trabalho em equipe é tudo! Vou preparar materiais especiais para você engajar e inspirar sua galera.',
        'hire': 'Que estratégico pensar em especialistas! Te vou dar o mapa completo do que procurar e como avaliar.'
      };
      
      if (approachMessages[experience.implementation_approach as keyof typeof approachMessages]) {
        message += approachMessages[experience.implementation_approach as keyof typeof approachMessages] + '\n\n';
      }
    }

    // Personalizar baseado nos objetivos
    if (goals.primary_goal) {
      message += `Adorei conhecer seu objetivo principal: "${goals.primary_goal}". `;
      message += 'Pode ter certeza que vou personalizar cada dica e estratégia pensando exatamente nisso.\n\n';
    }

    // Personalizar baseado nas preferências de aprendizado
    if (preferences.learning_style) {
      const styleMessages: Record<string, string> = {
        'Prático': 'Você é do tipo mão na massa, né? Preparei um monte de exercícios práticos e projetos reais para você colocar em ação.',
        'Teórico': 'Adoro quem gosta de entender o "porquê"! Separei fundamentos sólidos e análises profundas para você.',
        'Visual': 'Para você que é mais visual, caprichei nos diagramas, infográficos e demonstrações que vão facilitar tudo.',
        'Auditivo': 'Como você aprende melhor ouvindo, vou te indicar nossos melhores podcasts e webinars exclusivos.',
      };
      
      if (styleMessages[preferences.learning_style as keyof typeof styleMessages]) {
        message += styleMessages[preferences.learning_style as keyof typeof styleMessages] + '\n\n';
      }
    }

    // Encerramento motivacional e intimista
    message += 'Sabe o que mais me emociona? É saber que você está aqui, pronto para essa transformação. ';
    message += 'Vou estar sempre pertinho, torcendo por você e te dando aquela força extra quando precisar.\n\n';
    message += 'Qualquer dúvida, qualquer conquista, qualquer desafio... me conta tudo! Adoro acompanhar de perto essa jornada.\n\n';
    message += 'Bora começar? Estou ansiosa para ver onde vamos chegar juntos! ✨\n\n';
    message += 'Com muito carinho,\n💙 Nina';

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
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