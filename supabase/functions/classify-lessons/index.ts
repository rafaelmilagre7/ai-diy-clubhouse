import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LessonData {
  id: string;
  title: string;
  description?: string;
  difficulty_level?: string;
}

interface SuggestedTags {
  tema: string[];
  ferramenta: string[];
  nivel: string[];
  formato: string[];
}

interface LessonAnalysis {
  lessonId: string;
  suggestedTags: SuggestedTags;
  confidence: number;
  reasoning: string;
}

serve(async (req) => {
  console.log('🚀 classify-lessons function started');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📋 CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Processing request...');
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('📊 Request body parsed:', { mode: body.mode, lessonsCount: body.lessons?.length });
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { mode = 'analyze', lessons = [], classifications = [] } = body;

    // Test mode - verificar configuração
    if (mode === 'test') {
      console.log('🧪 Running configuration test...');
      
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

      const testResults = {
        openai_configured: !!openAIApiKey,
        supabase_configured: !!supabaseUrl && !!supabaseKey,
        openai_working: false,
        openai_error: null
      };

      // Test OpenAI if configured
      if (openAIApiKey) {
        try {
          const testResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`
            }
          });
          
          if (testResponse.ok) {
            testResults.openai_working = true;
          } else {
            testResults.openai_error = `HTTP ${testResponse.status}`;
          }
        } catch (error) {
          testResults.openai_error = error.message;
        }
      }

      console.log('✅ Test results:', testResults);
      
      return new Response(JSON.stringify({
        success: true,
        test_results: testResults
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Analyze mode - processar aulas
    if (mode === 'analyze') {
      console.log(`📝 Analyzing ${lessons.length} lessons...`);
      
      if (!lessons || lessons.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No lessons provided for analysis'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAIApiKey) {
        console.error('❌ OpenAI API key not configured');
        return new Response(JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Prepare lessons data for OpenAI
        const lessonsText = lessons.map((lesson: LessonData) => 
          `ID: ${lesson.id}\nTítulo: ${lesson.title}\nDescrição: ${lesson.description || 'N/A'}\nNível: ${lesson.difficulty_level || 'N/A'}`
        ).join('\n\n---\n\n');

        const systemPrompt = `Você é um especialista em classificação de conteúdo educacional sobre IA e automação. 

Sua tarefa é analisar aulas e sugerir tags categorizadas em:

TEMAS: vendas, marketing, automacao, atendimento, gestao, produtividade, integracao, analytics
FERRAMENTAS: make, typebot, openai, meta-ads, google-sheets, zapier, chatgpt, whatsapp-business  
NÍVEIS: iniciante, intermediario, avancado
FORMATOS: hotseat, aula-pratica, case-study, tutorial, configuracao

Para cada aula, retorne um JSON com:
- lessonId (string)
- suggestedTags (objeto com arrays tema, ferramenta, nivel, formato)
- confidence (número 0-1)
- reasoning (string explicando a classificação)

Seja preciso e relevante. Use 1-3 tags por categoria quando aplicável.`;

        const userPrompt = `Analise e classifique estas aulas:\n\n${lessonsText}`;

        console.log('🤖 Calling OpenAI API...');
        
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
          }),
        });

        if (!openAIResponse.ok) {
          const errorText = await openAIResponse.text();
          console.error('❌ OpenAI API error:', errorText);
          throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
        }

        const openAIData = await openAIResponse.json();
        console.log('✅ OpenAI response received');

        let analyses: LessonAnalysis[];
        try {
          const content = JSON.parse(openAIData.choices[0].message.content);
          analyses = content.analyses || [content]; // Handle both array and single object
        } catch (parseError) {
          console.error('❌ Error parsing OpenAI response:', parseError);
          throw new Error('Invalid response format from OpenAI');
        }

        console.log(`✅ Successfully analyzed ${analyses.length} lessons`);

        return new Response(JSON.stringify({
          success: true,
          analyses,
          stats: {
            processed: analyses.length,
            timestamp: new Date().toISOString()
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Error in analysis:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Apply mode - aplicar classificações
    if (mode === 'apply') {
      console.log(`📝 Applying ${classifications.length} classifications...`);
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      let applied = 0;
      for (const classification of classifications) {
        try {
          // Create tags for the lesson
          const allTags = [
            ...classification.suggestedTags.tema,
            ...classification.suggestedTags.ferramenta, 
            ...classification.suggestedTags.nivel,
            ...classification.suggestedTags.formato
          ];

          for (const tagName of allTags) {
            // Ensure tag exists
            const { data: existingTag } = await supabase
              .from('lesson_tags')
              .select('id')
              .eq('name', tagName)
              .single();

            let tagId;
            if (!existingTag) {
              const { data: newTag, error: tagError } = await supabase
                .from('lesson_tags')
                .insert({ name: tagName, color: '#6366f1' })
                .select('id')
                .single();
              
              if (tagError) throw tagError;
              tagId = newTag.id;
            } else {
              tagId = existingTag.id;
            }

            // Link tag to lesson
            await supabase
              .from('learning_lesson_tags')
              .upsert({
                lesson_id: classification.lessonId,
                tag_id: tagId
              });
          }

          applied++;
        } catch (error) {
          console.error(`❌ Error applying classification for lesson ${classification.lessonId}:`, error);
        }
      }

      console.log(`✅ Applied ${applied} classifications successfully`);

      return new Response(JSON.stringify({
        success: true,
        applied,
        total: classifications.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default response for unknown modes
    return new Response(JSON.stringify({
      success: false,
      error: 'Unknown mode'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ ERROR in classify-lessons:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});