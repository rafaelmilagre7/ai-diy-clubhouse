
// supabase/functions/get-assistant-messages/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { getSecureCorsHeaders, isOriginAllowed, forbiddenOriginResponse } from '../_shared/secureCors.ts';

serve(async (req) => {
  const corsHeaders = getSecureCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 🔒 VALIDAÇÃO CORS: Bloquear origens não confiáveis
  if (!isOriginAllowed(req)) {
    console.warn('[SECURITY] Origem não autorizada bloqueada:', req.headers.get('origin'));
    return forbiddenOriginResponse();
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
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
