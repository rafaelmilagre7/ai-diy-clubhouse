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

    const systemPrompt = `Você é um especialista em avaliar viabilidade de ideias.

Retorne APENAS um objeto JSON válido sem nenhum texto adicional:
{"viable": true/false, "reason": "explicação breve", "confidence": "high/medium/low"}

IMPORTANTE: Apenas o JSON puro, sem markdown, sem code blocks, sem explicações extras.`;

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
        temperature: 0.3,
        max_tokens: 500
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

    console.log('[VALIDATE-FEASIBILITY] 🧹 Depois de limpar:', cleanContent.slice(0, 100));

    // Extrair JSON com regex mais robusto para pegar objeto completo
    const jsonMatch = cleanContent.match(/\{[\s\S]*?"viable"[\s\S]*?"reason"[\s\S]*?"confidence"[\s\S]*?\}/);
    
    if (!jsonMatch) {
      console.error('[VALIDATE-FEASIBILITY] ❌ JSON não encontrado na resposta');
      throw new Error('Resposta inválida do modelo de IA');
    }

    const jsonStr = jsonMatch[0];
    console.log('[VALIDATE-FEASIBILITY] 📦 JSON extraído:', jsonStr);

    // Parse e validação rigorosa
    const validationResult = JSON.parse(jsonStr);
    
    // Validar campos obrigatórios
    if (typeof validationResult.viable !== 'boolean' ||
        typeof validationResult.reason !== 'string' ||
        !validationResult.reason.trim() ||
        !['high', 'medium', 'low'].includes(validationResult.confidence)) {
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
