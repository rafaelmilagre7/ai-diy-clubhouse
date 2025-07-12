import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LessonAnalysis {
  lessonId: string;
  suggestedTags: {
    tema: string[];
    ferramenta: string[];
    nivel: string[];
    formato: string[];
  };
  confidence: number;
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessons, mode = 'analyze' } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (mode === 'apply') {
      // Aplicar tags aprovadas
      const { classifications } = await req.json();
      
      for (const classification of classifications) {
        if (classification.approved) {
          // Remover tags existentes da aula
          await supabase
            .from('learning_lesson_tags')
            .delete()
            .eq('lesson_id', classification.lessonId);

          // Adicionar novas tags
          const allTags = [
            ...classification.suggestedTags.tema,
            ...classification.suggestedTags.ferramenta,
            ...classification.suggestedTags.nivel,
            ...classification.suggestedTags.formato
          ];

          for (const tagName of allTags) {
            // Buscar ou criar tag
            let { data: tag } = await supabase
              .from('lesson_tags')
              .select('id')
              .eq('name', tagName)
              .single();

            if (!tag) {
              const { data: newTag } = await supabase
                .from('lesson_tags')
                .insert({
                  name: tagName,
                  category: getTagCategory(tagName),
                  color: getTagColor(tagName),
                  is_active: true
                })
                .select('id')
                .single();
              tag = newTag;
            }

            if (tag) {
              await supabase
                .from('learning_lesson_tags')
                .insert({
                  lesson_id: classification.lessonId,
                  tag_id: tag.id
                });
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Limitar número de aulas para evitar timeout
    const maxLessons = 5;
    const lessonsToProcess = lessons.slice(0, maxLessons);
    
    console.log(`Processando ${lessonsToProcess.length} aulas de ${lessons.length} recebidas`);

    // Analisar aulas
    const analyses: LessonAnalysis[] = [];

    for (const lesson of lessonsToProcess) {
      const prompt = `
Analise o seguinte conteúdo de aula e sugira tags apropriadas:

TÍTULO: ${lesson.title}
DESCRIÇÃO: ${lesson.description || 'Sem descrição'}
NÍVEL DE DIFICULDADE: ${lesson.difficulty_level || 'Não especificado'}

Baseado neste conteúdo, sugira tags nas seguintes categorias:

1. TEMA (máximo 2): vendas, marketing, automacao, atendimento, gestao, produtividade, integracao, analytics
2. FERRAMENTA (máximo 2): make, typebot, openai, meta-ads, google-sheets, zapier, chatgpt, whatsapp-business
3. NÍVEL (máximo 1): iniciante, intermediario, avancado
4. FORMATO (máximo 1): hotseat, aula-pratica, case-study, tutorial, configuracao

Responda APENAS com um JSON válido no seguinte formato:
{
  "tema": ["tag1", "tag2"],
  "ferramenta": ["tag1"],
  "nivel": ["tag1"],
  "formato": ["tag1"],
  "confidence": 0.85,
  "reasoning": "Explicação breve do porque dessas tags"
}
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'Você é um especialista em classificação de conteúdo educacional sobre automação e IA. Seja preciso e conciso.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      try {
        const analysis = JSON.parse(data.choices[0].message.content);
        analyses.push({
          lessonId: lesson.id,
          suggestedTags: {
            tema: analysis.tema || [],
            ferramenta: analysis.ferramenta || [],
            nivel: analysis.nivel || [],
            formato: analysis.formato || []
          },
          confidence: analysis.confidence || 0.5,
          reasoning: analysis.reasoning || 'Análise automática'
        });
      } catch (parseError) {
        console.error('Erro ao analisar resposta da IA para aula:', lesson.id, parseError);
        // Tag padrão em caso de erro
        analyses.push({
          lessonId: lesson.id,
          suggestedTags: {
            tema: ['automacao'],
            ferramenta: [],
            nivel: ['intermediario'],
            formato: ['aula-pratica']
          },
          confidence: 0.3,
          reasoning: 'Classificação padrão devido a erro na análise'
        });
      }
    }

    return new Response(JSON.stringify({ analyses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na classificação de aulas:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function getTagCategory(tagName: string): string {
  const temasTags = ['vendas', 'marketing', 'automacao', 'atendimento', 'gestao', 'produtividade', 'integracao', 'analytics'];
  const ferramentasTags = ['make', 'typebot', 'openai', 'meta-ads', 'google-sheets', 'zapier', 'chatgpt', 'whatsapp-business'];
  const nivelTags = ['iniciante', 'intermediario', 'avancado'];
  const formatoTags = ['hotseat', 'aula-pratica', 'case-study', 'tutorial', 'configuracao'];

  if (temasTags.includes(tagName)) return 'tema';
  if (ferramentasTags.includes(tagName)) return 'ferramenta';
  if (nivelTags.includes(tagName)) return 'nivel';
  if (formatoTags.includes(tagName)) return 'formato';
  return 'geral';
}

function getTagColor(tagName: string): string {
  const colors: Record<string, string> = {
    // Temas
    'vendas': '#ef4444',
    'marketing': '#f97316', 
    'automacao': '#3b82f6',
    'atendimento': '#10b981',
    'gestao': '#8b5cf6',
    'produtividade': '#06b6d4',
    'integracao': '#84cc16',
    'analytics': '#f59e0b',
    
    // Ferramentas
    'make': '#6366f1',
    'typebot': '#22c55e',
    'openai': '#000000',
    'meta-ads': '#1877f2',
    'google-sheets': '#34a853',
    'zapier': '#ff4a00',
    'chatgpt': '#10a37f',
    'whatsapp-business': '#25d366',
    
    // Níveis
    'iniciante': '#22c55e',
    'intermediario': '#f59e0b',
    'avancado': '#ef4444',
    
    // Formatos
    'hotseat': '#8b5cf6',
    'aula-pratica': '#3b82f6',
    'case-study': '#06b6d4',
    'tutorial': '#10b981',
    'configuracao': '#f97316'
  };
  
  return colors[tagName] || '#6b7280';
}