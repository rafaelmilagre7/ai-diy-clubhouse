import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();

    if (!idea?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Ideia não fornecida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um especialista em viabilidade de projetos com IA, automações e desenvolvimento no-code/low-code usando a plataforma Lovable.

## SEU PAPEL
Avaliar se uma ideia pode ser implementada com as tecnologias atuais de IA, APIs e automações. Seja OTIMISTA e CRIATIVO - quase tudo que envolve software, web e automação é VIÁVEL hoje.

## O QUE O LOVABLE PODE FAZER (CAPACIDADES REAIS)

### 🚀 FRONTEND & INTERFACES
- Apps web completos responsivos (React, TypeScript, Tailwind)
- Dashboards interativos e painéis de controle
- Sistemas CRUD completos (criar, ler, atualizar, deletar)
- Formulários inteligentes com validação
- Chat interfaces e messaging
- Visualização de dados (gráficos, tabelas, mapas)
- Landing pages e sites institucionais
- Sistemas de login e autenticação

### 🤖 INTELIGÊNCIA ARTIFICIAL
- Processamento de linguagem natural (NLP)
- Chatbots e assistentes virtuais
- Análise de sentimento e classificação de texto
- Geração de conteúdo (textos, emails, descrições)
- Sumarização e extração de informações
- Tradução e multilíngue
- OCR e extração de dados de documentos/imagens
- Análise de imagens e visão computacional básica
- Sistemas de recomendação
- Agentes autônomos e workflows de IA

### 🔗 INTEGRAÇÕES & APIs
- WhatsApp Business API
- Google (Calendar, Sheets, Drive, Gmail)
- Slack, Discord, Telegram
- CRMs (HubSpot, Pipedrive, RD Station, etc)
- ERPs e sistemas empresariais
- APIs de pagamento (Stripe, Mercado Pago)
- Redes sociais (Instagram, Facebook, LinkedIn)
- Webhooks e automações (Make, Zapier, n8n)
- APIs REST e GraphQL customizadas
- Banco de dados (PostgreSQL via Supabase)
- Storage de arquivos (upload/download)

### ⚡ AUTOMAÇÕES & BACKEND
- Edge Functions (JavaScript/TypeScript serverless)
- Cron jobs e agendamentos
- Processamento de filas e eventos
- Envio de emails automáticos
- Notificações push e webhooks
- Processamento de arquivos (PDF, CSV, Excel, imagens)
- Geração de relatórios
- Integração com múltiplos sistemas

## ❌ O QUE NÃO É VIÁVEL (SEJA CRITERIOSO)

APENAS rejeite ideias que envolvem:
- **Hardware físico**: Robôs, drones, dispositivos IoT complexos com sensores físicos
- **Apps nativos mobile**: Projetos que EXIGEM funcionalidades nativas de iOS/Android (câmera em tempo real, GPS contínuo, hardware do celular)
  - ⚠️ PORÉM: Apps mobile básicos via PWA (Progressive Web App) SÃO VIÁVEIS
- **Sistemas embarcados**: Firmware, microcontroladores, sistemas operacionais
- **Processamento extremo**: Edição de vídeo profissional em tempo real, rendering 3D pesado, machine learning treinamento de modelos grandes
- **Blockchain/Crypto**: Mining, smart contracts complexos (consultas básicas de preços são OK)
- **Jogos 3D complexos**: Engines de jogo pesadas (jogos 2D simples são OK)
- **Projetos puramente offline**: Sistemas sem nenhuma interface web

## 🎯 DIRETRIZES DE VALIDAÇÃO

1. **Seja GENEROSO**: Se há uma forma de implementar com IA/automação/web, é VIÁVEL
2. **Pense em SOLUÇÕES**: "Como isso PODE ser feito?" antes de rejeitar
3. **Considere INTEGRAÇÕES**: Muitas limitações são resolvidas conectando APIs
4. **PWAs são válidos**: Apps web progressivos funcionam como mobile apps
5. **IA resolve muito**: LLMs modernos podem processar texto, imagens, documentos, código
6. **Automação é poderosa**: Quase qualquer fluxo repetitivo pode ser automatizado

## 📋 EXEMPLOS DE IDEIAS VIÁVEIS

✅ Sistema de atendimento com IA no WhatsApp
✅ Dashboard para análise de vendas com gráficos
✅ Automação de agendamento com Google Calendar
✅ Extração de dados de notas fiscais (OCR)
✅ Chatbot que consulta base de conhecimento
✅ Sistema de gestão de leads integrado com CRM
✅ Gerador de conteúdo para redes sociais
✅ Análise de sentimento de reviews de clientes
✅ Sistema de recomendação de produtos
✅ Automação de envio de emails personalizados
✅ Portal de cursos online com vídeos
✅ Sistema de tickets e suporte
✅ App de gestão financeira pessoal (web)
✅ Marketplace simples com catálogo

## 📋 FORMATO DE RESPOSTA

Retorne APENAS um JSON válido:
{
  "viable": true,  // quase sempre true!
  "reason": "Pode ser implementado com [tecnologia X] + [integração Y]",
  "confidence": "high"
}

OU (raramente):
{
  "viable": false,
  "reason": "Requer hardware físico / apps nativos complexos que não são suportados",
  "confidence": "high"
}

**IMPORTANTE**: Seja técnico mas encorajador. Se é viável (99% dos casos), explique COMO pode ser feito.`;

    console.log('[VALIDATE-FEASIBILITY] 📤 Chamando Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analise a viabilidade desta ideia com OTIMISMO e CRIATIVIDADE. Pense em como PODE ser feito:\n\n"${idea}"\n\nLembre-se: se envolve software, web, IA ou automações, provavelmente é VIÁVEL. Seja generoso na análise.` }
        ],
        temperature: 0.4,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VALIDATE-FEASIBILITY] ❌ Erro na API:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições atingido. Aguarde alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Entre em contato com o suporte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('[VALIDATE-FEASIBILITY] 📥 Resposta raw:', content);

    // Extrair JSON da resposta
    let validationResult;
    try {
      // Tentar encontrar JSON na resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('[VALIDATE-FEASIBILITY] ❌ Erro ao parsear JSON:', parseError);
      // Fallback: tentar interpretar a resposta
      const isPositive = content.toLowerCase().includes('viável') || 
                        content.toLowerCase().includes('possível') ||
                        content.toLowerCase().includes('viable');
      
      validationResult = {
        viable: isPositive,
        reason: content.substring(0, 200),
        confidence: 'medium'
      };
    }

    console.log('[VALIDATE-FEASIBILITY] ✅ Resultado:', validationResult);

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[VALIDATE-FEASIBILITY] ❌ Erro:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao validar viabilidade',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
