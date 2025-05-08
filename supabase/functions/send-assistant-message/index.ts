
// supabase/functions/send-assistant-message/index.ts
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
    const { threadId, content, assistantId, context } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiKey) {
      throw new Error("OpenAI API key não configurada no servidor");
    }
    
    if (!threadId || !content) {
      throw new Error("ThreadId e conteúdo são obrigatórios");
    }
    
    // Adicionar a mensagem do usuário ao thread
    const addMessageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        role: "user",
        content: content
      })
    });
    
    if (!addMessageResponse.ok) {
      const errorData = await addMessageResponse.json();
      console.error("Erro ao adicionar mensagem:", errorData);
      throw new Error(`Erro ao adicionar mensagem: ${errorData.error?.message || addMessageResponse.statusText}`);
    }
    
    const messageData = await addMessageResponse.json();
    console.log("Mensagem adicionada:", messageData);
    
    // Se não foi fornecido um ID de assistente específico, usar um fallback
    const effectiveAssistantId = assistantId || "asst_default"; // Deve ser substituído por um ID válido em produção
    
    // Preparar instruções adicionais baseadas no contexto
    let additionalInstructions = "";
    if (context?.lessonId) {
      additionalInstructions += `Esta conversa está relacionada à aula com ID ${context.lessonId}. `;
    }
    if (context?.assistantPrompt) {
      additionalInstructions += context.assistantPrompt;
    }
    
    // Executar o assistente no thread
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        assistant_id: effectiveAssistantId,
        instructions: additionalInstructions || undefined
      })
    });
    
    if (!runResponse.ok) {
      const errorData = await runResponse.json();
      console.error("Erro ao iniciar execução:", errorData);
      throw new Error(`Erro ao iniciar execução: ${errorData.error?.message || runResponse.statusText}`);
    }
    
    const runData = await runResponse.json();
    console.log("Execução iniciada:", runData);
    
    // Aguardar a conclusão da execução (polling)
    let runStatus = runData.status;
    let runId = runData.id;
    let attempts = 0;
    const maxAttempts = 60; // 60 * 1s = 60 segundos máximo de espera
    
    while (runStatus !== "completed" && runStatus !== "failed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
      
      const checkRunResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "OpenAI-Beta": "assistants=v1"
        }
      });
      
      if (!checkRunResponse.ok) {
        const errorData = await checkRunResponse.json();
        console.error("Erro ao verificar status da execução:", errorData);
        throw new Error(`Erro ao verificar status: ${errorData.error?.message || checkRunResponse.statusText}`);
      }
      
      const checkRunData = await checkRunResponse.json();
      runStatus = checkRunData.status;
      attempts++;
      
      console.log(`Status da execução (tentativa ${attempts}): ${runStatus}`);
    }
    
    if (runStatus !== "completed") {
      throw new Error(`A execução não foi concluída a tempo ou falhou: ${runStatus}`);
    }
    
    // Obter a última mensagem (resposta do assistente)
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
    
    // A primeira mensagem é a mais recente
    const assistantMessage = messagesData.data.find(msg => msg.role === "assistant");
    
    if (!assistantMessage) {
      throw new Error("Não foi encontrada uma resposta do assistente");
    }
    
    // Extrair o texto da resposta
    const responseText = assistantMessage.content[0].text.value;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: messageData.id,
        response: responseText
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
