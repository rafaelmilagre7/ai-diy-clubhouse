import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feature, itemTitle, type, timestamp, userInfo } = await req.json();
    
    console.log('📞 [SALES-NOTIFICATION] Nova notificação de interesse:', {
      feature,
      itemTitle,
      type,
      timestamp,
      userInfo
    });

    // Webhook URL do Discord
    const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL');
    
    if (!DISCORD_WEBHOOK_URL) {
      console.error('❌ [SALES-NOTIFICATION] Discord webhook URL não configurada');
      return new Response(
        JSON.stringify({ error: 'Discord webhook not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mapear features para texto amigável
    const featureNames = {
      solutions: 'Soluções',
      learning: 'Formação',
      tools: 'Ferramentas',
      benefits: 'Benefícios',
      networking: 'Networking',
      events: 'Eventos'
    };

    const featureName = featureNames[feature as keyof typeof featureNames] || feature;

    // Criar embed rico para Discord - adaptado para interesse em upgrade
    let embed;
    let content;

    if (type === 'upgrade_interest') {
      // Notificação de interesse em upgrade/upsell
      embed = {
        title: "💰 LEAD QUENTE - Interesse em Upgrade!",
        description: `Um usuário demonstrou interesse em assinar a plataforma premium`,
        color: 0x10B981, // Verde para indicar oportunidade de venda
        fields: [
          ...(userInfo?.name ? [{
            name: "👤 CLIENTE",
            value: userInfo.name,
            inline: true
          }] : []),
          ...(userInfo?.email ? [{
            name: "📧 EMAIL",
            value: userInfo.email,
            inline: true
          }] : []),
          ...(userInfo?.phone ? [{
            name: "📱 TELEFONE",
            value: userInfo.phone,
            inline: true
          }] : []),
          {
            name: "📋 Funcionalidade de Interesse",
            value: `**${featureName}**`,
            inline: false
          },
          ...(itemTitle ? [{
            name: "🎯 Item Específico",
            value: itemTitle,
            inline: false
          }] : []),
          {
            name: "⚡ STATUS",
            value: "Interessado em Upgrade Premium",
            inline: false
          },
          ...(userInfo?.id ? [{
            name: "🆔 ID do Usuário",
            value: userInfo.id,
            inline: true
          }] : []),
          {
            name: "⏰ HORÁRIO",
            value: new Date(timestamp).toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo'
            }),
            inline: true
          },
          {
            name: "📍 PRÓXIMOS PASSOS",
            value: "Contatar para apresentar planos premium e benefícios",
            inline: false
          }
        ],
        footer: {
          text: "Viver de IA Club - Sistema de Notificações de Vendas",
          icon_url: "https://viverdeia.ai/favicon.ico"
        },
        timestamp: new Date(timestamp).toISOString()
      };
      content = "@here 💰 **LEAD QUENTE** - Usuário quer fazer upgrade na plataforma!";
    } else {
      // Notificação padrão para outras situações
      embed = {
        title: "🚀 Nova Oportunidade de Vendas!",
        description: `Um usuário demonstrou interesse em fazer upgrade na plataforma`,
        color: 0x6366f1, // Cor azul/roxo
        fields: [
          {
            name: "📋 Funcionalidade",
            value: `**${featureName}**`,
            inline: true
          },
          {
            name: "🎯 Item Específico",
            value: itemTitle || "Acesso geral",
            inline: true
          },
          {
            name: "⏰ Horário",
            value: new Date(timestamp).toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo'
            }),
            inline: true
          }
        ],
        footer: {
          text: "Viver de IA Club - Sistema de Notificações",
          icon_url: "https://viverdeia.ai/favicon.ico"
        },
        timestamp: new Date(timestamp).toISOString()
      };
      content = "@here 💰 **LEAD QUENTE** - Usuário quer fazer upgrade!";
    }

    // Enviar para Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        embeds: [embed]
      })
    });

    if (!discordResponse.ok) {
      console.error('❌ [SALES-NOTIFICATION] Erro ao enviar para Discord:', discordResponse.status);
      throw new Error('Failed to send Discord notification');
    }

    console.log('✅ [SALES-NOTIFICATION] Notificação enviada com sucesso para Discord');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notificação enviada com sucesso' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ [SALES-NOTIFICATION] Erro:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});