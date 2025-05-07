
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
      
      const response = await fetch(url, options);
      
      // Verificar se a resposta está ok antes de retornar
      if (!response.ok) {
        // Obter detalhes do erro para logging
        let errorBody;
        try {
          errorBody = await response.clone().text();
          console.error(`Resposta com erro (${response.status}): ${errorBody}`);
        } catch (e) {
          console.error(`Não foi possível ler corpo da resposta com erro: ${e}`);
        }
        
        // Se for um erro recuperável, continuar tentativas
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`Erro HTTP ${response.status}`);
        }
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
    
    console.log("Verificando credencial Panda Video API Key disponível:", !!apiKey);
    console.log("API Key parcial (primeiros 5 chars):", apiKey ? apiKey.substring(0, 5) + "..." : "não definida");
    
    if (!apiKey) {
      console.error("API Key do Panda Video não configurada");
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Configuração incompleta do servidor: API Key não definida"
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

    // Extrair os dados do formulário
    let formData;
    try {
      formData = await req.formData();
      console.log("FormData extraído com sucesso");
      
      // Listar campos recebidos para debug
      const formEntries = Array.from(formData.entries());
      console.log(`Campos no FormData: ${formEntries.map(([key]) => key).join(", ")}`);
    } catch (formError) {
      console.error("Erro ao processar formulário:", formError);
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
      console.log("Nenhum arquivo de vídeo encontrado no FormData");
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

    console.log(`Processando upload do vídeo: ${videoTitle} (${videoFile.size} bytes)`);
    console.log(`Tipo do arquivo: ${videoFile.type}`);

    // Gerar um UUID para o vídeo
    const videoId = crypto.randomUUID();
    console.log("ID de vídeo gerado:", videoId);

    // Verificar o tamanho do arquivo
    if (videoFile.size > 500 * 1024 * 1024) { // 500MB em bytes
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
    
    console.log("Iniciando upload com protocolo Tus para Panda Video API");
    console.log("URL de upload:", PANDA_UPLOAD_URL);
    console.log("Tamanho do arquivo:", videoFile.size, "bytes");
    console.log("Metadados TUS:", uploadMetadata);
    
    let uploadResponse;
    try {
      // Criar a requisição de criação do upload via protocolo TUS
      uploadResponse = await uploadWithRetry(PANDA_UPLOAD_URL, {
        method: "POST",
        headers: {
          "Tus-Resumable": "1.0.0",
          "Upload-Length": videoFile.size.toString(),
          "Upload-Metadata": uploadMetadata,
          "Content-Type": "application/offset+octet-stream",
          "X-Upload-Content-Type": videoFile.type,
          "Accept": "application/json, */*"
        }
      });
      
      console.log(`Resposta da criação do upload recebida com status: ${uploadResponse.status}`);
      console.log(`Headers da resposta:`, Object.fromEntries(uploadResponse.headers.entries()));
      
      // Obter a URL de Location para onde enviar os bytes
      const locationUrl = uploadResponse.headers.get("Location");
      if (!locationUrl) {
        throw new Error("API do Panda Video não retornou URL de upload (Location header)");
      }
      
      console.log("Upload criado. URL de upload:", locationUrl);
      
      // Realizar o upload do arquivo para o endpoint de patch
      const patchResponse = await uploadWithRetry(locationUrl, {
        method: "PATCH",
        headers: {
          "Tus-Resumable": "1.0.0",
          "Upload-Offset": "0",
          "Content-Type": "application/offset+octet-stream"
        },
        body: new Uint8Array(fileBuffer)
      });
      
      console.log(`Upload PATCH completado com status: ${patchResponse.status}`);
      console.log(`Headers da resposta PATCH:`, Object.fromEntries(patchResponse.headers.entries()));
    } catch (uploadError) {
      console.error("Erro na requisição de upload:", uploadError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha na conexão com o serviço de vídeo",
          details: uploadError instanceof Error ? uploadError.message : String(uploadError)
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

    // Como o Tus não retorna imediatamente os metadados do vídeo,
    // retornamos um sucesso com o ID do vídeo e outros dados que temos
    return new Response(
      JSON.stringify({
        success: true,
        video: {
          id: videoId,
          title: videoTitle,
          duration: 0, // Será necessário obter isso por meio de outra API call
          url: `https://player.pandavideo.com.br/embed/${videoId}`,
          thumbnail_url: null, // Será disponibilizado após o processamento
          video_type: "panda",
          upload_id: videoId // Usando o mesmo videoId para simplificar
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
