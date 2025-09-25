
// supabase/functions/create-assistant-thread/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, assistantId } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiKey) {
      throw new Error("OpenAI API key não configurada no servidor");
    }

    // Obter o token de autorização da requisição
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Autorização necessária');
    }
    
    // Inicializar o cliente Supabase com o token da requisição
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verificar se a aula existe e tem o assistente habilitado
    const { data: lesson, error: lessonError } = await supabase
      .from('learning_lessons')
      .select('id, title, ai_assistant_enabled, ai_assistant_id')
      .eq('id', lessonId)
      .single();
      
    if (lessonError || !lesson) {
      throw new Error('Aula não encontrada');
    }
    
    if (!lesson.ai_assistant_enabled) {
      throw new Error('Assistente IA não está habilitado para esta aula');
    }
    
    // Se nenhum assistantId foi fornecido, usar o da aula se disponível
    const effectiveAssistantId = assistantId || lesson.ai_assistant_id;
    
    // Criar um novo thread na OpenAI
    const response = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        metadata: {
          lessonId: lessonId,
          lessonTitle: lesson.title,
          assistantId: effectiveAssistantId
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro da OpenAI:", errorData);
      throw new Error(`Erro ao criar thread: ${errorData.error?.message || response.statusText}`);
    }
    
    const threadData = await response.json();
    console.log("Thread criado com sucesso:", threadData);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        threadId: threadData.id,
        assistantId: effectiveAssistantId
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Erro:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
