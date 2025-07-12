
// supabase/functions/get-assistant-messages/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { threadId } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiKey) {
      console.error("OpenAI API key not configured");
      throw new Error("OpenAI API key não configurada no servidor");
    }
    
    if (!threadId) {
      console.error("ThreadId missing in request");
      throw new Error("ThreadId é obrigatório");
    }
    
    console.log("Fetching messages for thread:", threadId);
    
    // Obter todas as mensagens do thread
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "OpenAI-Beta": "assistants=v1"
      }
    });
    
    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      console.error("Erro ao obter mensagens:", errorData);
      throw new Error(`Erro ao obter mensagens: ${errorData.error?.message || messagesResponse.statusText}`);
    }
    
    const messagesData = await messagesResponse.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        messages: messagesData.data
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Erro:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
