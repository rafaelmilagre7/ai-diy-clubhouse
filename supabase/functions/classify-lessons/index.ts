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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('🚀 Classify Lessons function started');

  try {
    const requestBody = await req.json();
    console.log('📥 Request received:', { 
      mode: requestBody.mode, 
      lessonsCount: requestBody.lessons?.length || 0,
      hasClassifications: !!requestBody.classifications
    });

    const { lessons, mode = 'analyze' } = requestBody;

    // Modo de teste para verificar configuração
    if (mode === 'test') {
      console.log('🧪 Modo de teste ativado');
      
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
      
      const testResults = {
        openai_configured: !!openAIApiKey,
        supabase_configured: !!(supabaseUrl && supabaseKey),
        timestamp: new Date().toISOString()
      };
      
      console.log('🔍 Resultados do teste:', testResults);
      
      return new Response(JSON.stringify({ 
        success: true, 
        test_results: testResults,
        message: 'Teste de configuração concluído'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Verificar configuração da OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }
    console.log('✅ OpenAI API key configured');

    // Verificar configuração do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase configuration missing');
      throw new Error('Supabase configuration missing');
    }
    console.log('✅ Supabase configuration validated');
    
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

    // Validar entrada
    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      console.error('❌ No lessons provided or invalid format');
      throw new Error('Nenhuma aula fornecida para análise');
    }

    // Filtrar aulas válidas
    const validLessons = lessons.filter(lesson => {
      const isValid = lesson.id && lesson.title && lesson.title.trim().length > 0;
      if (!isValid) {
        console.warn('⚠️ Aula inválida ignorada:', { id: lesson.id, title: lesson.title });
      }
      return isValid;
    });

    if (validLessons.length === 0) {
      console.error('❌ No valid lessons found');
      throw new Error('Nenhuma aula válida encontrada para análise');
    }

    // Limitar número de aulas para evitar timeout
    const maxLessons = 3; // Reduzido para 3 para maior confiabilidade
    const lessonsToProcess = validLessons.slice(0, maxLessons);
    
    console.log(`📚 Processando ${lessonsToProcess.length} aulas válidas de ${lessons.length} recebidas`);

    // Analisar aulas
    const analyses: LessonAnalysis[] = [];

    for (let i = 0; i < lessonsToProcess.length; i++) {
      const lesson = lessonsToProcess[i];
      console.log(`🔍 Analisando aula ${i + 1}/${lessonsToProcess.length}: ${lesson.title.substring(0, 50)}...`);
      
      // Validar dados da aula
      if (!lesson.title || lesson.title.trim().length === 0) {
        console.warn('⚠️ Aula sem título válido, usando fallback');
        analyses.push(createFallbackAnalysis(lesson.id, 'Aula sem título'));
        continue;
      }
      try {
        const analysis = await analyzeLesson(lesson, openAIApiKey);
        analyses.push(analysis);
        console.log(`✅ Aula analisada com sucesso: ${lesson.title.substring(0, 30)}... (confidence: ${analysis.confidence})`);
      } catch (error) {
        console.error(`❌ Erro ao analisar aula ${lesson.id}:`, error);
        // Usar análise fallback em caso de erro
        const fallbackAnalysis = createFallbackAnalysis(lesson.id, lesson.title);
        analyses.push(fallbackAnalysis);
        console.log(`🔄 Usando análise fallback para aula: ${lesson.title.substring(0, 30)}...`);
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTimePerLesson = Math.round(totalTime / analyses.length);
    
    console.log(`✅ Análise concluída com sucesso!`);
    console.log(`📊 Estatísticas: ${analyses.length} aulas processadas em ${totalTime}ms (média: ${avgTimePerLesson}ms por aula)`);
    console.log(`🎯 Confiança média: ${(analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length).toFixed(2)}`);

    return new Response(JSON.stringify({ 
      analyses,
      stats: {
        processedCount: analyses.length,
        totalTimeMs: totalTime,
        avgTimePerLessonMs: avgTimePerLesson,
        avgConfidence: analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.error('❌ Erro na classificação de aulas:', {
      error: error.message,
      stack: error.stack,
      totalTime: totalTime + 'ms'
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack || 'Stack trace não disponível',
      processingTimeMs: totalTime
    }), {
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

// Função para analisar uma aula individual com retry automático
async function analyzeLesson(lesson: any, openAIApiKey: string, maxRetries = 2): Promise<LessonAnalysis> {
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

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries} para análise da aula ${lesson.id}`);
      
      const requestStart = Date.now();
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
              content: 'Você é um especialista em classificação de conteúdo educacional sobre automação e IA. Responda sempre em JSON válido.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      const requestTime = Date.now() - requestStart;
      console.log(`⏱️ Tempo de resposta OpenAI: ${requestTime}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ OpenAI API error (tentativa ${attempt}): ${response.status} ${response.statusText}`, errorText);
        
        // Verificar se é erro de rate limit ou quota
        if (response.status === 429) {
          console.log(`⏳ Rate limit atingido, aguardando ${attempt * 2} segundos...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue; // Tentar novamente
        }
        
        if (response.status === 401) {
          throw new Error('OpenAI API key inválida');
        }
        
        if (response.status >= 500 && attempt < maxRetries) {
          console.log(`⏳ Erro do servidor, aguardando ${attempt * 1000}ms antes de tentar novamente...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Resposta inválida da OpenAI API');
      }

      const content = data.choices[0].message.content;
      console.log(`📝 Resposta da OpenAI para ${lesson.id}:`, content.substring(0, 100) + '...');
      
      try {
        const analysis = JSON.parse(content);
        
        // Validar estrutura da resposta
        if (!analysis.tema || !analysis.nivel || !analysis.formato) {
          throw new Error('Resposta da IA incompleta');
        }
        
        return {
          lessonId: lesson.id,
          suggestedTags: {
            tema: Array.isArray(analysis.tema) ? analysis.tema : [],
            ferramenta: Array.isArray(analysis.ferramenta) ? analysis.ferramenta : [],
            nivel: Array.isArray(analysis.nivel) ? analysis.nivel : [],
            formato: Array.isArray(analysis.formato) ? analysis.formato : []
          },
          confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.5,
          reasoning: analysis.reasoning || 'Análise automática'
        };
        
      } catch (parseError) {
        console.error(`❌ Erro ao parsear JSON da OpenAI (tentativa ${attempt}):`, parseError);
        console.error('Conteúdo recebido:', content);
        
        if (attempt === maxRetries) {
          throw new Error('Não foi possível interpretar a resposta da IA');
        }
        
        // Tentar novamente com delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
    } catch (error) {
      console.error(`❌ Erro na tentativa ${attempt}:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Máximo de tentativas excedido');
}

// Função para criar análise fallback em caso de erro
function createFallbackAnalysis(lessonId: string, title: string): LessonAnalysis {
  console.log(`🔄 Criando análise fallback para: ${title}`);
  
  // Análise simples baseada em palavras-chave no título
  const titleLower = title.toLowerCase();
  
  const tema: string[] = [];
  const ferramenta: string[] = [];
  let nivel = ['intermediario'];
  let formato = ['aula-pratica'];
  
  // Detectar tema baseado em palavras-chave
  if (titleLower.includes('vendas') || titleLower.includes('vender')) tema.push('vendas');
  if (titleLower.includes('marketing') || titleLower.includes('anúncios') || titleLower.includes('ads')) tema.push('marketing');
  if (titleLower.includes('automação') || titleLower.includes('automatizar')) tema.push('automacao');
  if (titleLower.includes('atendimento') || titleLower.includes('chatbot')) tema.push('atendimento');
  if (titleLower.includes('gestão') || titleLower.includes('gerenciar')) tema.push('gestao');
  
  // Detectar ferramenta
  if (titleLower.includes('make')) ferramenta.push('make');
  if (titleLower.includes('typebot')) ferramenta.push('typebot');
  if (titleLower.includes('chatgpt') || titleLower.includes('openai')) ferramenta.push('chatgpt');
  if (titleLower.includes('meta') || titleLower.includes('facebook')) ferramenta.push('meta-ads');
  if (titleLower.includes('sheets') || titleLower.includes('planilha')) ferramenta.push('google-sheets');
  if (titleLower.includes('zapier')) ferramenta.push('zapier');
  if (titleLower.includes('whatsapp')) ferramenta.push('whatsapp-business');
  
  // Detectar nível
  if (titleLower.includes('básico') || titleLower.includes('iniciante') || titleLower.includes('introdução')) {
    nivel = ['iniciante'];
  } else if (titleLower.includes('avançado') || titleLower.includes('expert')) {
    nivel = ['avancado'];
  }
  
  // Detectar formato
  if (titleLower.includes('hotseat')) formato = ['hotseat'];
  if (titleLower.includes('case') || titleLower.includes('estudo')) formato = ['case-study'];
  if (titleLower.includes('tutorial') || titleLower.includes('passo a passo')) formato = ['tutorial'];
  if (titleLower.includes('configuração') || titleLower.includes('configurar')) formato = ['configuracao'];
  
  // Se não detectou tema, usar padrão
  if (tema.length === 0) tema.push('automacao');
  
  return {
    lessonId,
    suggestedTags: {
      tema,
      ferramenta,
      nivel,
      formato
    },
    confidence: 0.4, // Baixa confiança para análise fallback
    reasoning: 'Classificação automática baseada em palavras-chave (análise fallback)'
  };
}