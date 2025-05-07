
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PANDA_UPLOAD_URL = "https://uploader-us01.pandavideo.com.br/files";

// Implementar sistema de retry para falhas de upload
async function uploadWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Tentativa ${attempt + 1} de ${maxRetries} para: ${url}`);
        // Espera exponencial entre tentativas (1s, 2s, 4s...)
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
      
      console.log(`Iniciando requisição para: ${url}`);
      console.log(`Headers:`, Object.fromEntries(
        Object.entries(options.headers || {})
          .filter(([key]) => key.toLowerCase() !== 'authorization')
      ));
      
      const response = await fetch(url, options);
      
      // Debug de resposta
      console.log(`Resposta do servidor (status ${response.status}):`, 
        Object.fromEntries(response.headers.entries()));
      
      // Verificar se a resposta está ok antes de retornar
      if (!response.ok) {
        // Obter detalhes do erro para logging
        let errorBody;
        try {
          errorBody = await response.text();
          console.error(`Resposta com erro (${response.status}): ${errorBody}`);
        } catch (e) {
          console.error(`Não foi possível ler corpo da resposta com erro: ${e}`);
        }
        
        // Se for um erro recuperável, continuar tentativas
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`Erro HTTP ${response.status}: ${errorBody || 'Sem detalhes'}`);
        }
        
        // Para outros erros, retornar a resposta mesmo sendo erro
        return response;
      }
      
      return response;
    } catch (error) {
      console.error(`Erro na tentativa ${attempt + 1}:`, error);
      lastError = error;
      
      // Se for a última tentativa, desistir
      if (attempt === maxRetries - 1) {
        break;
      }
    }
  }
  
  throw new Error(`Falha após ${maxRetries} tentativas: ${lastError?.message || 'Erro desconhecido'}`);
}

// Função auxiliar para codificar em Base64
function encodeBase64(str: string): string {
  return btoa(str);
}

serve(async (req) => {
  console.log("Requisição de upload de vídeo recebida");
  console.log("URL:", req.url);
  console.log("Método:", req.method);
  console.log("Headers:", Object.fromEntries([...req.headers.entries()]
    .filter(([key]) => !key.toLowerCase().includes("authorization"))));
  
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se a requisição é POST
    if (req.method !== "POST") {
      console.log("Método não permitido:", req.method);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Método não permitido" 
        }),
        { 
          status: 405, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Verificar autenticação do usuário (JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Erro de autenticação: Token JWT ausente ou inválido");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Usuário não autenticado" 
        }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Obter API key do Panda Video
    const apiKey = Deno.env.get("PANDA_API_KEY");
    if (!apiKey) {
      console.error("API Key do Panda Video não configurada");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Configuração incompleta do servidor: API Key não definida",
          message: "Por favor, configure a variável de ambiente PANDA_API_KEY no Supabase"
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    console.log("API Key do Panda Video encontrada:", apiKey.substring(0, 10) + "...");

    // Extrair os dados do formulário
    let formData;
    try {
      formData = await req.formData();
      console.log("FormData recebido com sucesso");
      console.log("Campos no FormData:", Array.from(formData.keys()).join(", "));
    } catch (formError) {
      console.error("Erro ao processar dados do formulário:", formError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Erro ao processar os dados do formulário",
          details: formError instanceof Error ? formError.message : String(formError)
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    const videoFile = formData.get("video") as File;
    const videoTitle = formData.get("title") as string || "Vídeo sem título";
    const isPrivate = formData.get("private") === "true";
    const folderId = formData.get("folder_id") as string || "";

    if (!videoFile) {
      console.log("Nenhum arquivo de vídeo encontrado");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Nenhum arquivo de vídeo enviado" 
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    console.log(`Processando upload: "${videoTitle}" (${videoFile.size} bytes, tipo: ${videoFile.type})`);

    // Verificar o tamanho do arquivo
    if (videoFile.size > 500 * 1024 * 1024) { // 500MB
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "O arquivo é muito grande. O tamanho máximo permitido é 500MB." 
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Preparar metadados para o protocolo Tus
    const videoId = crypto.randomUUID();
    console.log("ID de vídeo gerado:", videoId);
    
    const metadataEntries = [
      `authorization ${encodeBase64(apiKey)}`,
      `filename ${encodeBase64(videoFile.name)}`,
      `video_id ${encodeBase64(videoId)}`
    ];
    
    // Adicionar folder_id apenas se estiver definido
    if (folderId) {
      metadataEntries.push(`folder_id ${encodeBase64(folderId)}`);
    }
    
    // Adicionar title se fornecido
    if (videoTitle) {
      metadataEntries.push(`title ${encodeBase64(videoTitle)}`);
    }
    
    const uploadMetadata = metadataEntries.join(',');
    
    // Preparar o buffer de dados do arquivo
    const fileBuffer = await videoFile.arrayBuffer();
    
    console.log("Iniciando upload protocolo TUS para Panda Video");
    console.log("URL de upload:", PANDA_UPLOAD_URL);
    console.log("Tamanho do arquivo:", videoFile.size, "bytes");
    console.log("Metadados TUS:", uploadMetadata);
    
    // ETAPA 1: Criar a requisição de criação do upload via protocolo TUS
    let locationUrl = "";
    try {
      console.log("Iniciando ETAPA 1: Criação do upload TUS");
      const uploadResponse = await uploadWithRetry(PANDA_UPLOAD_URL, {
        method: "POST",
        headers: {
          "Tus-Resumable": "1.0.0",
          "Upload-Length": videoFile.size.toString(),
          "Upload-Metadata": uploadMetadata,
          "Content-Type": "application/offset+octet-stream",
          "Accept": "application/json, */*; q=0.8"
        }
      });
      
      console.log(`ETAPA 1 - Status: ${uploadResponse.status}`);
      console.log("Headers retornados:", Object.fromEntries(uploadResponse.headers.entries()));
      
      // Obter a URL de Location para onde enviar os bytes
      locationUrl = uploadResponse.headers.get("Location") || "";
      if (!locationUrl) {
        throw new Error("API do Panda Video não retornou URL de upload (Location header)");
      }
      
      console.log("Upload criado. URL de upload:", locationUrl);
    } catch (err) {
      console.error("Erro na criação do upload TUS:", err);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha ao iniciar upload para o Panda Video",
          details: err instanceof Error ? err.message : String(err)
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
      
    // ETAPA 2: Realizar o upload do arquivo para o endpoint TUS
    try {  
      console.log("Iniciando ETAPA 2: Upload de bytes via PATCH");
      console.log("Enviando para:", locationUrl);
      console.log("Tamanho do buffer:", fileBuffer.byteLength, "bytes");
      
      const patchResponse = await uploadWithRetry(locationUrl, {
        method: "PATCH",
        headers: {
          "Tus-Resumable": "1.0.0",
          "Upload-Offset": "0",
          "Content-Type": "application/offset+octet-stream",
          "Accept": "application/json, */*; q=0.8",
          "Content-Length": fileBuffer.byteLength.toString()
        },
        body: new Uint8Array(fileBuffer)
      });
      
      console.log(`ETAPA 2 - Status: ${patchResponse.status}`);
      console.log("Headers retornados:", Object.fromEntries(patchResponse.headers.entries()));
      
      if (!patchResponse.ok) {
        const responseText = await patchResponse.text();
        console.error("Resposta de erro do servidor:", responseText);
        throw new Error(`Erro ao enviar arquivo: ${patchResponse.status} - ${responseText}`);
      }
    } catch (err) {
      console.error("Erro no upload de arquivo:", err);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha durante upload do arquivo",
          details: err instanceof Error ? err.message : String(err)
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Upload concluído com sucesso
    console.log("Upload concluído com sucesso!");
    
    // Como o Panda não retorna os metadados do vídeo imediatamente,
    // retornamos os dados que temos disponíveis no momento
    return new Response(
      JSON.stringify({
        success: true,
        video: {
          id: videoId,
          title: videoTitle,
          duration: 0, // Será necessário obter isso após processamento
          url: `https://player.pandavideo.com.br/embed/${videoId}`,
          thumbnail_url: null, // Será disponibilizado após o processamento
          type: "panda",
        }
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Erro não tratado no processamento do upload:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Erro no processamento do upload", 
        message: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        }
      }
    );
  }
});
