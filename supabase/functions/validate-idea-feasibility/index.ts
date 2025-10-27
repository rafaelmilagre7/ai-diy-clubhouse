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

    // 🆕 FASE 2: Implementar cache de validações (MD5 hash da ideia normalizada)
    const normalizedIdea = idea.trim().toLowerCase().replace(/\s+/g, ' ');
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(normalizedIdea);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const cacheKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('[VALIDATE-FEASIBILITY] 🔑 Cache key:', cacheKey.substring(0, 16) + '...');

    // Verificar cache (válido por 30 dias)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: cachedValidation, error: cacheError } = await supabase
      .from('idea_validations_cache')
      .select('validation_result, created_at, accessed_count')
      .eq('cache_key', cacheKey)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (cachedValidation && !cacheError) {
      console.log('[VALIDATE-FEASIBILITY] ✅ CACHE HIT! Retornando validação existente');
      console.log('[VALIDATE-FEASIBILITY] 📊 Acessos:', cachedValidation.accessed_count + 1);
      
      // Incrementar contador de acessos
      await supabase
        .from('idea_validations_cache')
        .update({
          accessed_count: cachedValidation.accessed_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('cache_key', cacheKey);
      
      return new Response(
        JSON.stringify({
          ...cachedValidation.validation_result,
          from_cache: true,
          cached_at: cachedValidation.created_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[VALIDATE-FEASIBILITY] ❌ Cache miss, chamando IA...');
    console.log('[VALIDATE-FEASIBILITY] 📝 Ideia:', idea.substring(0, 100) + '...');
    
    const startTime = Date.now();

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

## ⚠️ CASOS SEMPRE VIÁVEIS (EXEMPLOS PRÁTICOS) - MARQUE SCORE 75-95

**CRITÉRIO SUPER IMPORTANTE**: Se a ideia menciona qualquer combinação de:
- WhatsApp + IA/Automação
- Chatbot + IA 
- Email/SMS + Automação
- Planilha/CRM + Integração
- Dashboard + APIs
→ É VIÁVEL! Score mínimo 75!

✅ **WhatsApp + IA/Automação (SEMPRE VIÁVEL - Score 80-95):**
- "Agente inteligente que automatiza vendas via WhatsApp"
- "Bot de WhatsApp com IA que qualifica leads"
- "Assistente virtual no WhatsApp para atendimento"
- "Sistema que recebe pedidos via WhatsApp e processa automaticamente"
- "WhatsApp bot que acompanha clientes e envia follow-ups"
- **QUALQUER ideia com "WhatsApp + IA" = VIÁVEL!**

✅ **Redes Sociais + IA (SEMPRE VIÁVEL - Score 70-85):**
- "Sistema de IA que monitora Instagram e recomenda posts"
- "Analisar tendências do TikTok e sugerir conteúdo"
- "Bot que acompanha Twitter e gera insights"
- "Monitoramento de LinkedIn para identificar oportunidades"
- **IMPORTANTE: APIs de redes sociais têm limitações, mas são acessíveis!**

✅ **Chatbots e Agentes de IA (SEMPRE VIÁVEL - Score 80-95):**
- "Chatbot com IA para responder dúvidas sobre produtos"
- "Assistente virtual que qualifica leads fazendo perguntas"
- "Agente de IA que automatiza atendimento ao cliente"
- "Bot inteligente que agenda reuniões e acompanha pipeline"

✅ **Automações CRM/Vendas (SEMPRE VIÁVEL - Score 75-90):**
- "Automação de follow-up de vendas por email"
- "Sistema que qualifica leads automaticamente"
- "Pipeline de vendas automatizado com IA"
- "Acompanhamento automático de clientes após compra"

✅ **Integrações e Dashboards (SEMPRE VIÁVEL - Score 70-85):**
- "Dashboard que mostra vendas do Stripe + Google Analytics"
- "Sincronizar dados entre Typeform e Mailchimp"
- "Relatórios automáticos por email"

✅ **Análise com IA (SEMPRE VIÁVEL - Score 75-90):**
- "Analisar sentimento de reviews automaticamente"
- "Extrair dados de PDFs/documentos com IA"
- "Classificar leads por pontuação automática"

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
- ✅ Menciona WhatsApp + IA/Automação → SEMPRE VIÁVEL!
- ✅ Menciona Chatbot + IA → SEMPRE VIÁVEL!
- ✅ Menciona automação de vendas/CRM + IA → SEMPRE VIÁVEL!
- ✅ Existe combinação de ferramentas no-code que resolve
- ✅ APIs/integrações necessárias estão disponíveis
- ✅ Lógica implementável com Make/Zapier + IA
- ✅ Pequenos ajustes no escopo tornam viável
- ✅ Parece com os exemplos de "Casos Sempre Viáveis"

**⚠️ SÓ marque como NÃO VIÁVEL (viable: false) quando:**
- ❌ Requer hardware físico específico (IoT complexo, sensores industriais)
- ❌ Precisa processar milhões de operações por segundo
- ❌ Depende de APIs que comprovadamente não existem
- ❌ Requer treinar modelo de IA do zero (não usar APIs prontas)
- ❌ Envolve compliance crítico impossível para no-code (SOC2, HIPAA)
- ❌ Sistema operacional, compilador, driver de hardware

**⚠️ IMPORTANTE:** Seja GENEROSO! 80%+ das ideias com automação + IA são VIÁVEIS!

## PRINCÍPIOS IMPORTANTES

- **SEJA PRAGMÁTICO**: Make + API + IA = VIÁVEL na maioria dos casos!
- **SEJA GENEROSO**: Se 80%+ da ideia funciona com no-code, marque como VIÁVEL
- Seja honesto: se realmente não dá, diga NÃO sem rodeios
- Seja direto: evite "talvez", "depende", "parcialmente"
- Pense em workarounds criativos antes de dizer NÃO
- Considere MVP (produto mínimo viável) ao avaliar

## ESCALA DE SCORE (AJUSTADA)

- **80-100**: Muito simples, ferramentas prontas + conectores nativos
- **60-79**: Viável, precisa configuração/customização mas é direto
- **40-59**: Complexo mas possível com workarounds criativos
- **20-39**: Muito difícil, requer muitas adaptações
- **0-19**: Tecnicamente inviável com no-code atual

## FORMATO DE RESPOSTA OBRIGATÓRIO

Você DEVE responder APENAS com um objeto JSON no seguinte formato (sem emojis, sem markdown, sem code blocks):

{
  "viable": true ou false,
  "score": 0-100 (número inteiro - quanto mais viável, maior o score. Considere: viabilidade técnica 40%, facilidade de implementação 30%, custo-benefício 20%, escalabilidade 10%),
  "reason": "Resumo executivo em 1-2 frases (max 100 palavras) explicando a viabilidade",
  "technical_explanation": "Explicação técnica DETALHADA de 200-400 palavras sobre COMO seria implementado. Mencione: fluxo de dados, integrações necessárias, lógica de processamento, estrutura de dados, APIs envolvidas, e estimativa de requisições/mês. Seja específico como um manual de implementação.",
  "suggestions": [
    "3-5 sugestões CONCRETAS e ACIONÁVEIS para melhorar a viabilidade ou reduzir complexidade",
    "Cada sugestão deve ser específica e mencionar ferramentas/técnicas",
    "Evite sugestões genéricas - seja prático e técnico"
  ],
  "confidence": "high", "medium" ou "low",
  "estimated_complexity": "low", "medium" ou "high",
  "estimated_time": "1-2 semanas", "2-4 semanas", "1-2 meses", ou "2-3 meses",
  "required_stack": ["lista", "de", "3-8", "tecnologias/ferramentas", "principais", "necessárias"],
  "limitations": [
    "Liste EXATAMENTE 2 limitações técnicas reais",
    "Exemplo válido: 'APIs do Instagram têm rate limit de 200 req/h', 'Custo de IA cresce com volume de análises'"
  ],
  "cost_estimate": "Estimativa de custo mensal realista (ex: 'R$ 50-200/mês', 'Gratuito até 1000 usuários', 'R$ 500+ dependendo do volume')"
}

IMPORTANTE: 
- Retorne APENAS o JSON puro, sem texto adicional, sem markdown, sem code blocks, sem emojis
- Todos os campos são obrigatórios
- technical_explanation deve ter NO MÍNIMO 200 palavras (conte!)
- suggestions deve ter NO MÍNIMO 3 itens e NO MÁXIMO 5
- limitations deve ter EXATAMENTE 2 itens`;

    console.log('[VALIDATE-FEASIBILITY] 📤 Chamando Lovable AI...');
    console.log('[VALIDATE-FEASIBILITY] 🤖 Modelo: google/gemini-2.5-pro');

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
          temperature: 0.1,
          max_tokens: 4000
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
    
    const processingTime = Date.now() - startTime;
    console.log('[VALIDATE-FEASIBILITY] ⏱️ Tempo de processamento:', processingTime + 'ms');

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('[VALIDATE-FEASIBILITY] 📥 Resposta raw:', content.slice(0, 100));

    // 🆕 VALIDAÇÃO: Verificar se resposta foi truncada
    if (content.length < 500) {
      console.error('[VALIDATE-FEASIBILITY] ⚠️ Resposta muito curta, pode ter sido truncada:', content.length, 'chars');
      throw new Error('Resposta da IA foi truncada. Tente novamente.');
    }

    // 🧹 LIMPEZA ROBUSTA: Múltiplas estratégias de extração
    let cleanContent = content.trim();

    // Estratégia 1: Remover markdown code blocks (```json ... ```)
    if (cleanContent.includes('```json')) {
      const match = cleanContent.match(/```json\s*([\s\S]*?)```/);
      if (match) {
        cleanContent = match[1].trim();
      }
    }

    // Estratégia 2: Remover qualquer ``` no início/fim
    cleanContent = cleanContent
      .replace(/```json\s*/gi, '')
      .replace(/```javascript\s*/gi, '')
      .replace(/```\s*/gi, '')
      .replace(/`{1,3}/g, '')
      .trim();

    // Estratégia 3: Tentar encontrar o primeiro { e último }
    if (!cleanContent.startsWith('{')) {
      const firstBrace = cleanContent.indexOf('{');
      if (firstBrace !== -1) {
        cleanContent = cleanContent.substring(firstBrace);
      }
    }

    if (!cleanContent.endsWith('}')) {
      const lastBrace = cleanContent.lastIndexOf('}');
      if (lastBrace !== -1) {
        cleanContent = cleanContent.substring(0, lastBrace + 1);
      }
    }

    console.log('[VALIDATE-FEASIBILITY] 🧹 Depois de limpar:', cleanContent.slice(0, 200));

    // Extrair JSON com regex mais robusto - busca o objeto completo com viable, reason, confidence e required_stack
    const jsonMatch = cleanContent.match(/\{[\s\S]*?"viable"[\s\S]*?"reason"[\s\S]*?"confidence"[\s\S]*?"required_stack"[\s\S]*?\]/);
    
    if (!jsonMatch) {
      console.error('[VALIDATE-FEASIBILITY] ❌ JSON não encontrado na resposta');
      console.error('[VALIDATE-FEASIBILITY] Conteúdo limpo:', cleanContent);
      throw new Error('Resposta inválida do modelo de IA');
    }

    const jsonStr = jsonMatch[0] + '}'; // Adiciona chave de fechamento
    console.log('[VALIDATE-FEASIBILITY] 📦 JSON extraído:', jsonStr.slice(0, 200));

    // Parse e validação rigorosa
    const validationResult = JSON.parse(jsonStr);
    
    // 🆕 FASE 2: Validar TODOS os novos campos obrigatórios
    const technicalExplanationWords = validationResult.technical_explanation?.split(/\s+/).length || 0;
    
    if (typeof validationResult.viable !== 'boolean' ||
        typeof validationResult.score !== 'number' ||
        validationResult.score < 0 || validationResult.score > 100 ||
        typeof validationResult.reason !== 'string' ||
        !validationResult.reason.trim() ||
        typeof validationResult.technical_explanation !== 'string' ||
        technicalExplanationWords < 50 ||
        !Array.isArray(validationResult.suggestions) ||
        validationResult.suggestions.length < 3 ||
        validationResult.suggestions.length > 5 ||
        !['high', 'medium', 'low'].includes(validationResult.confidence) ||
        !['low', 'medium', 'high'].includes(validationResult.estimated_complexity) ||
        typeof validationResult.estimated_time !== 'string' ||
        !Array.isArray(validationResult.required_stack) ||
        validationResult.required_stack.length < 3 ||
        !Array.isArray(validationResult.limitations) ||
        validationResult.limitations.length < 1 ||
        validationResult.limitations.length > 3 ||
        typeof validationResult.cost_estimate !== 'string') {
      
      console.error('[VALIDATE-FEASIBILITY] ❌ Campos inválidos ou incompletos:', {
        viable: typeof validationResult.viable,
        score: validationResult.score,
        reason: typeof validationResult.reason,
        technical_explanation_words: technicalExplanationWords,
        suggestions_count: Array.isArray(validationResult.suggestions) ? validationResult.suggestions.length : 0,
        confidence: validationResult.confidence,
        estimated_complexity: validationResult.estimated_complexity,
        required_stack_count: Array.isArray(validationResult.required_stack) ? validationResult.required_stack.length : 0,
        limitations_count: Array.isArray(validationResult.limitations) ? validationResult.limitations.length : 0,
      });
      console.error('[VALIDATE-FEASIBILITY] 📄 Resposta completa da IA:', JSON.stringify(validationResult, null, 2));
      throw new Error('Resposta da IA não contém todos os campos obrigatórios ou valores inválidos');
    }

    const totalTime = Date.now() - startTime;
    console.log('[VALIDATE-FEASIBILITY] ✅ Resultado validado:', {
      viable: validationResult.viable,
      score: validationResult.score,
      confidence: validationResult.confidence,
      complexity: validationResult.estimated_complexity,
      time: validationResult.estimated_time,
      tools_count: validationResult.required_stack.length,
      total_processing_time: totalTime + 'ms'
    });

    // 🆕 FASE 2: Salvar no cache
    try {
      await supabase
        .from('idea_validations_cache')
        .insert({
          cache_key: cacheKey,
          idea_summary: idea.substring(0, 200),
          validation_result: validationResult
        });
      
      console.log('[VALIDATE-FEASIBILITY] 💾 Resultado salvo no cache');
    } catch (cacheInsertError) {
      console.warn('[VALIDATE-FEASIBILITY] ⚠️ Erro ao salvar cache (não crítico):', cacheInsertError);
    }

    return new Response(
      JSON.stringify({
        ...validationResult,
        from_cache: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[VALIDATE-FEASIBILITY] ❌ Erro fatal:', error);
    console.error('[VALIDATE-FEASIBILITY] 📚 Stack:', error.stack);
    
    const errorMessage = error.message || 'Erro desconhecido';
    
    // Mensagens mais específicas baseadas no tipo de erro
    let userMessage = errorMessage;
    
    if (errorMessage.includes('boot error') || errorMessage.includes('SyntaxError')) {
      userMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
    } else if (errorMessage.includes('Resposta inválida') || errorMessage.includes('campos inválidos')) {
      userMessage = 'Não conseguimos analisar sua ideia. Tente descrever com mais detalhes o que você quer automatizar.';
    } else if (errorMessage.includes('JSON')) {
      userMessage = 'Erro ao processar resposta. Tentando novamente pode resolver.';
    } else if (errorMessage.includes('API error')) {
      userMessage = 'Erro de comunicação com IA. Tente novamente.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        viable: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
