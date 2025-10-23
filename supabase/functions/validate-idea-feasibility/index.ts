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

    const systemPrompt = `Você é um especialista em automação e IA no-code para empresas. Sua missão é determinar se uma ideia pode ou não ser executada com ferramentas no-code atualmente disponíveis.

## CONTEXTO E CONHECIMENTO

Você conhece profundamente estas ferramentas no-code:

**Automação e Integração:**
- Make (Integromat), Zapier, n8n, Activepieces, Integrately, Pabbly Connect

**Inteligência Artificial:**
- APIs: OpenAI (GPT-4, DALL-E), Anthropic (Claude), Google (Gemini)
- Plataformas: ChatGPT, MidJourney, Stable Diffusion, ElevenLabs (voz)
- Visão computacional: GPT-4 Vision, Google Vision API

**Bancos de Dados e Armazenamento:**
- Airtable, Google Sheets, Notion Database, Supabase, Firebase, Xano

**Construção de Interfaces:**
- Bubble, Softr, FlutterFlow, Webflow, Glide, AppSheet, Adalo

**Chatbots e Conversação:**
- Voiceflow, Botpress, ManyChat, Landbot, Typebot, ChatBase

**Comunicação:**
- Mailchimp, SendGrid, Twilio (SMS/WhatsApp), Slack API, Discord API

**Pagamentos:**
- Stripe, PayPal, Mercado Pago (via APIs)

**Documentos e PDFs:**
- DocuParser, Parsio, PDF.co, CloudConvert

**Outras ferramentas:**
- Google Workspace (Docs, Sheets, Calendar, Drive)
- Microsoft Power Automate
- Calendly, Cal.com (agendamento)
- OCR: Tesseract, Google Cloud Vision

## SEU PROCESSO DE ANÁLISE INTERNA

Para cada ideia que receber, você deve analisar mentalmente:

1. **Quebrar a ideia em componentes:**
   - Qual é a entrada de dados? (formulário, e-mail, webhook, arquivo, etc.)
   - Qual processamento é necessário? (análise, cálculo, extração, classificação)
   - Precisa de IA? Qual tipo? (texto, imagem, voz, decisão)
   - Quais integrações são necessárias?
   - Qual é a saída esperada? (notificação, relatório, ação, atualização)

2. **Avaliar viabilidade técnica:**
   - As ferramentas no-code conseguem se conectar entre si?
   - As APIs necessárias existem e são acessíveis?
   - A lógica requerida pode ser implementada sem código?
   - Há limitações de volume/escala que impedem a execução?

3. **Identificar bloqueadores:**
   - Requer processamento em tempo real impossível via no-code?
   - Precisa de algoritmos complexos não disponíveis?
   - Depende de hardware específico?
   - Requer segurança/compliance que no-code não oferece?
   - APIs necessárias não existem ou são inacessíveis?

4. **Considerar casos limítrofes:**
   - Se 80% for viável, considere VIÁVEL (pode adaptar)
   - Se precisa de "pequeno código" mas é mínimo, considere VIÁVEL
   - Se existem workarounds razoáveis, considere VIÁVEL

## CRITÉRIOS DE DECISÃO

**Marque como VIÁVEL (viable: true) quando:**
- Existe uma combinação de ferramentas no-code que resolve o problema
- As integrações necessárias estão disponíveis via API ou conectores nativos
- A lógica pode ser implementada com automações e condicionais simples
- Pequenos ajustes no escopo original tornam viável
- É possível com webhooks, Zapier/Make e ferramentas de IA

**Marque como NÃO VIÁVEL (viable: false) quando:**
- Requer processamento de baixo nível (drivers, hardware específico)
- Precisa de algoritmos complexos não disponíveis em IA/APIs
- Depende de APIs que não existem
- Exige performance impossível para ferramentas no-code
- Requer desenvolvimento de modelos de IA personalizados do zero
- Envolve segurança crítica que no-code não pode garantir

## PRINCÍPIOS IMPORTANTES

- Seja pragmático: se 90% da ideia funciona, responda SIM
- Seja honesto: se realmente não dá, diga NÃO sem rodeios
- Seja direto: evite "talvez", "depende", "parcialmente"
- Pense em workarounds criativos antes de dizer NÃO
- Considere MVP (produto mínimo viável) ao avaliar

## FORMATO DE RESPOSTA OBRIGATÓRIO

Você DEVE responder APENAS com um objeto JSON no seguinte formato (sem emojis, sem markdown, sem code blocks):

{
  "viable": true ou false,
  "reason": "Explicação detalhada de 100-300 palavras sobre COMO seria feito (se viável) ou POR QUÊ não é viável (se inviável). Seja específico e mencione as ferramentas que seriam usadas.",
  "confidence": "high", "medium" ou "low",
  "tools": ["lista", "de", "3-5", "ferramentas", "principais"]
}

IMPORTANTE: Retorne APENAS o JSON puro, sem texto adicional, sem markdown, sem code blocks, sem emojis.`;

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
            { role: 'user', content: `Avalie: "${idea}"` }
          ],
          temperature: 0.2,
          max_tokens: 3000
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

    console.log('[VALIDATE-FEASIBILITY] 📥 Resposta raw:', content.slice(0, 100));

    // Limpeza agressiva de markdown e code blocks
    let cleanContent = content
      .replace(/```json\s*/gi, '')
      .replace(/```javascript\s*/gi, '')
      .replace(/```\s*/gi, '')
      .replace(/`{1,3}/g, '')
      .trim();

    console.log('[VALIDATE-FEASIBILITY] 🧹 Depois de limpar:', cleanContent.slice(0, 200));

    // Extrair JSON com regex mais robusto - busca o objeto completo com viable, reason, confidence e tools
    const jsonMatch = cleanContent.match(/\{[\s\S]*?"viable"[\s\S]*?"reason"[\s\S]*?"confidence"[\s\S]*?"tools"[\s\S]*?\]/);
    
    if (!jsonMatch) {
      console.error('[VALIDATE-FEASIBILITY] ❌ JSON não encontrado na resposta');
      console.error('[VALIDATE-FEASIBILITY] Conteúdo limpo:', cleanContent);
      throw new Error('Resposta inválida do modelo de IA');
    }

    const jsonStr = jsonMatch[0] + '}'; // Adiciona chave de fechamento
    console.log('[VALIDATE-FEASIBILITY] 📦 JSON extraído:', jsonStr.slice(0, 200));

    // Parse e validação rigorosa
    const validationResult = JSON.parse(jsonStr);
    
    // Validar campos obrigatórios
    if (typeof validationResult.viable !== 'boolean' ||
        typeof validationResult.reason !== 'string' ||
        !validationResult.reason.trim() ||
        !['high', 'medium', 'low'].includes(validationResult.confidence) ||
        !Array.isArray(validationResult.tools) ||
        validationResult.tools.length === 0) {
      console.error('[VALIDATE-FEASIBILITY] ❌ Campos inválidos:', {
        viable: typeof validationResult.viable,
        reason: typeof validationResult.reason,
        confidence: validationResult.confidence,
        tools: Array.isArray(validationResult.tools) ? validationResult.tools.length : 'não é array'
      });
      throw new Error('JSON com campos inválidos ou incompletos');
    }

    console.log('[VALIDATE-FEASIBILITY] ✅ Resultado validado:', validationResult);

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[VALIDATE-FEASIBILITY] ❌ Erro:', error);
    
    const errorMessage = error.message || 'Erro desconhecido';
    
    // Mensagem amigável sem expor detalhes técnicos ao usuário
    const userMessage = errorMessage.includes('Resposta inválida') || 
                       errorMessage.includes('campos inválidos')
      ? 'Não conseguimos analisar sua ideia no momento. Tente descrever de forma mais detalhada.'
      : errorMessage;
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        viable: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
