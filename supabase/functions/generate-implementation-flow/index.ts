import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseServiceClient } from '../_shared/supabase-client.ts';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { solutionId, userId } = await req.json();
    console.log('[FLOW-GEN] Gerando fluxo para solução:', solutionId);

    const supabase = getSupabaseServiceClient();

    // Buscar solução
    const { data: solution, error: solutionError } = await supabase
      .from('ai_generated_solutions')
      .select('*')
      .eq('id', solutionId)
      .single();

    if (solutionError) throw solutionError;

    // Montar prompt focado e simples
    const systemPrompt = `Você é um arquiteto de soluções especializado em criar fluxos visuais de implementação.

REGRAS MERMAID (CRÍTICAS):
1. Use APENAS "graph TD"
2. IDs simples SEM ESPAÇOS (A, B, C, D... até L)
3. Textos entre [ ] para caixas retangulares
4. Use " --> " para conexões (com espaços)
5. Máximo 12 nós
6. Use {texto?} apenas para decisões importantes
7. NUNCA use caracteres especiais em IDs
8. NUNCA quebre linhas no meio de definições

EXEMPLO VÁLIDO:
graph TD
    A[Definir Requisitos] --> B[Escolher Plataforma]
    B --> C{Precisa RAG?}
    C -->|Sim| D[Configurar Vector DB]
    C -->|Não| E[Usar LLM direto]
    D --> F[Integrar APIs]
    E --> F
    F --> G[Testar Fluxo]
    G --> H[Deploy]`;

    const userPrompt = `Crie UM ÚNICO fluxo Mermaid (graph TD) com 8-12 etapas para implementar esta solução:

SOLUÇÃO:
- Título: ${solution.title}
- Descrição: ${solution.original_idea}
- Ferramentas: ${solution.required_tools || 'Não especificado'}

RETORNE APENAS JSON VÁLIDO:
{
  "mermaid_code": "graph TD\\n    A[...] --> B[...]\\n    ...",
  "title": "Fluxo de Implementação - [Nome Curto]",
  "description": "Descrição breve (máx 100 chars) do que será implementado",
  "estimated_time": "X-Y horas",
  "key_steps": ["Setup", "Integrações", "Testes", "Deploy"]
}

IMPORTANTE: 
- Mermaid code deve estar em uma única linha com \\n para quebras
- IDs devem ser letras simples (A, B, C...)
- Não use underscores, hífens ou espaços em IDs`;

    // Chamar Lovable AI
    console.log('[FLOW-GEN] Chamando Lovable AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[FLOW-GEN] ❌ Erro Lovable AI:', errorText);
      throw new Error(`Lovable AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Parse JSON da resposta
    let flowData;
    try {
      // Tentar extrair JSON (remover markdown se houver)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      flowData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('[FLOW-GEN] ❌ Erro ao parsear JSON:', e);
      throw new Error('Resposta da IA não é JSON válido');
    }

    // Validar campos obrigatórios
    if (!flowData.mermaid_code || !flowData.title) {
      throw new Error('Resposta da IA incompleta');
    }

    // Salvar no banco
    const { error: updateError } = await supabase
      .from('ai_generated_solutions')
      .update({
        implementation_flow: flowData,
        updated_at: new Date().toISOString()
      })
      .eq('id', solutionId);

    if (updateError) throw updateError;

    console.log('[FLOW-GEN] ✅ Fluxo gerado e salvo com sucesso');

    return new Response(
      JSON.stringify({ success: true, flow: flowData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[FLOW-GEN] ❌ Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
