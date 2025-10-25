import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para validar se uma string é um UUID válido
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { solutionId } = await req.json();

    if (!solutionId) {
      return new Response(
        JSON.stringify({ error: 'solutionId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY não configurado');
      return new Response(
        JSON.stringify({ error: 'Configuração de API ausente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar dados completos da solução
    console.log('Buscando solução:', solutionId);
    const { data: solution, error: solutionError } = await supabase
      .from('ai_generated_solutions')
      .select('*')
      .eq('id', solutionId)
      .single();

    if (solutionError || !solution) {
      console.error('Erro ao buscar solução:', solutionError);
      return new Response(
        JSON.stringify({ error: 'Solução não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Buscar todas as aulas publicadas com seus cursos e módulos
    console.log('Buscando aulas disponíveis...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('learning_lessons')
      .select(`
        id,
        title,
        description,
        learning_modules!inner (
          title,
          learning_courses!inner (
            title
          )
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (lessonsError || !lessons || lessons.length === 0) {
      console.error('Erro ao buscar aulas:', lessonsError);
      return new Response(
        JSON.stringify({ error: 'Nenhuma aula disponível' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Encontradas ${lessons.length} aulas publicadas`);

    // 3. Preparar contexto para a IA
    const solutionContext = {
      titulo: solution.title || 'Sem título',
      descricao: solution.short_description || '',
      ideiaOriginal: solution.original_idea || '',
      framework: solution.framework_mapping || {},
      ferramentas: solution.required_tools || [],
      arquitetura: solution.architecture_flowchart || {}
    };

    const lessonsCatalog = lessons.map((lesson: any) => ({
      id: lesson.id,
      titulo: lesson.title,
      descricao: lesson.description || '',
      curso: lesson.learning_modules?.[0]?.learning_courses?.[0]?.title || 'Sem curso',
      modulo: lesson.learning_modules?.[0]?.title || 'Sem módulo'
    }));

    // 4. Montar prompt especializado para a IA
    const aiPrompt = `Você é um especialista em educação e recomendação de conteúdo técnico.

SOLUÇÃO GERADA PELO USUÁRIO:
${JSON.stringify(solutionContext, null, 2)}

CATÁLOGO DE AULAS DISPONÍVEIS (${lessonsCatalog.length} aulas):
${JSON.stringify(lessonsCatalog, null, 2)}

TAREFA:
Analise a solução e recomende as 5-8 aulas mais relevantes que ajudariam o usuário a implementar essa solução na prática.

CRITÉRIOS DE AVALIAÇÃO:
1. Priorize aulas práticas que ensinem ferramentas/técnicas mencionadas na solução
2. Considere a stack tecnológica da solução (Lovable, Supabase, Edge Functions, etc)
3. Identifique gaps de conhecimento comuns para implementar soluções de IA
4. Balance entre aulas básicas (fundamentos) e avançadas (implementação)
5. Dê preferência a aulas sobre integração de APIs, backend, e automação

Para cada recomendação, retorne JSON estruturado:
{
  "recommendations": [
    {
      "lessonId": "uuid-da-aula",
      "relevanceScore": 85,
      "justification": "Esta aula ensina Edge Functions no Supabase, essencial para implementar a lógica de backend da sua solução de resumo de reuniões.",
      "keyTopics": ["Backend", "API", "Supabase Edge Functions"]
    }
  ]
}

⚠️ CRÍTICO - FORMATO DO lessonId:
- O campo "lessonId" DEVE ser o UUID (campo "id") da aula do catálogo
- NUNCA use o título da aula como lessonId
- SEMPRE copie o UUID exato do campo "id" do catálogo
- Exemplo CORRETO: "lessonId": "7121e59d-5832-4041-95fe-5795dc3fc91c"
- Exemplo ERRADO: "lessonId": "Aula 06 - Mentoria"

IMPORTANTE:
- relevanceScore: número de 0-100 (priorize 70+)
- justification: explicação clara e específica (2-3 linhas)
- keyTopics: máximo 4 tópicos por aula
- Ordene as recomendações por relevanceScore (maior primeiro)
- Retorne APENAS o JSON válido, sem texto adicional`;

    // 5. Chamar Lovable AI
    console.log('Chamando Lovable AI para gerar recomendações...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro da Lovable AI:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar recomendações com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    console.log('Resposta da IA:', aiContent);

    // 6. Parsear resposta da IA
    let recommendations;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      } else {
        throw new Error('JSON não encontrado na resposta da IA');
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      return new Response(
        JSON.stringify({ error: 'Formato de resposta da IA inválido' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (recommendations.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [], message: 'Nenhuma recomendação encontrada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Validar e corrigir UUIDs
    console.log(`[UUID-VALIDATION] 🔍 Validando ${recommendations.length} recomendações...`);
    const validRecommendations = [];
    
    for (const rec of recommendations) {
      const lessonId = rec.lessonId;
      
      // Verificar se é UUID válido
      if (isValidUUID(lessonId)) {
        console.log(`[UUID-VALIDATION] ✅ UUID válido: ${lessonId}`);
        validRecommendations.push(rec);
      } else {
        // Tentar encontrar pelo título
        console.log(`[UUID-VALIDATION] ⚠️  UUID inválido: "${lessonId}" - Tentando corrigir...`);
        
        const matchedLesson = lessonsCatalog.find((lesson: any) => 
          lesson.titulo.toLowerCase().includes(lessonId.toLowerCase()) ||
          lessonId.toLowerCase().includes(lesson.titulo.toLowerCase())
        );
        
        if (matchedLesson) {
          console.log(`[UUID-VALIDATION] ✅ Correção: "${lessonId}" → ${matchedLesson.id} (${matchedLesson.titulo})`);
          rec.lessonId = matchedLesson.id;
          validRecommendations.push(rec);
        } else {
          console.error(`[UUID-VALIDATION] ❌ Não foi possível corrigir: "${lessonId}" - IGNORANDO`);
        }
      }
    }

    console.log(`[UUID-VALIDATION] 📊 Resultado: ${validRecommendations.length}/${recommendations.length} recomendações válidas`);

    if (validRecommendations.length === 0) {
      return new Response(
        JSON.stringify({ 
          recommendations: [], 
          message: 'Nenhuma recomendação válida após validação de UUIDs',
          error: 'Todas as recomendações foram filtradas por UUIDs inválidos'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Salvar recomendações no banco
    console.log(`💾 Salvando ${validRecommendations.length} recomendações no banco...`);
    const recsToInsert = validRecommendations.map((rec: any) => ({
      solution_id: solutionId,
      lesson_id: rec.lessonId,
      relevance_score: rec.relevanceScore,
      justification: rec.justification,
      key_topics: rec.keyTopics || []
    }));

    const { error: insertError } = await supabase
      .from('solution_learning_recommendations')
      .upsert(recsToInsert, { onConflict: 'solution_id,lesson_id' });

    if (insertError) {
      console.error('❌ Erro ao salvar recomendações no banco:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao salvar recomendações', 
          details: insertError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ ${validRecommendations.length} recomendações salvas no banco com sucesso`);

    // 9. Buscar dados completos das aulas recomendadas
    const lessonIds = validRecommendations.map((r: any) => r.lessonId);
    const { data: fullLessons } = await supabase
      .from('learning_lessons')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        learning_modules!inner (
          title,
          learning_courses!inner (
            id,
            title
          )
        )
      `)
      .in('id', lessonIds);

    // 10. Enriquecer recomendações com dados completos
    const enrichedRecommendations = validRecommendations.map((rec: any) => {
      const lessonData = fullLessons?.find((l: any) => l.id === rec.lessonId);
      return {
        ...rec,
        lesson: lessonData || null
      };
    });

    console.log(`✅ ${enrichedRecommendations.length} recomendações salvas e enriquecidas com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: enrichedRecommendations,
        stats: {
          generated: recommendations.length,
          valid: validRecommendations.length,
          saved: enrichedRecommendations.length
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro geral na edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
