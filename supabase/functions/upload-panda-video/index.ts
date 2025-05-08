
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuração de CORS para permitir requisições da aplicação web
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Função para lidar com as requisições
serve(async (req: Request) => {
  // Lidar com preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Apenas aceitar requisições POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Configurar cliente Supabase para acessar secrets
    const supabaseClient = createClient(
      // Supabase API URL - usar a mesma URL do projeto
      Deno.env.get('SUPABASE_URL') ?? '',
      // Chave de serviço para permitir acesso a secrets
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    
    // Obter chaves de API do Panda Video dos secrets do Supabase
    const pandaApiKey = Deno.env.get('PANDA_API_KEY')
    
    // Verificar se a chave de API está disponível
    if (!pandaApiKey) {
      console.error('Erro: PANDA_API_KEY não configurada nos secrets do Supabase')
      return new Response(JSON.stringify({
        error: 'Configuração de API incorreta',
        details: 'Secret PANDA_API_KEY não configurada'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Extrair dados da requisição
    const { videoName, fileName, fileType, fileSize } = await req.json()
    
    console.log('Iniciando processo de upload para o Panda Video:', { videoName, fileName, fileType, fileSize })
    
    // Verificar se os parâmetros necessários foram fornecidos
    if (!fileName || !fileType) {
      return new Response(JSON.stringify({
        error: 'Parâmetros inválidos',
        details: 'fileName e fileType são obrigatórios'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Preparar URL para requisição de upload
    const uploadUrl = 'https://api-v2.pandavideo.com.br/videos/getuploadurl'
    
    try {
      // Obter URL de upload do Panda Video
      const uploadResponse = await fetch(uploadUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `ApiKey ${pandaApiKey}`
        },
      })
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        console.error('Erro ao obter URL de upload do Panda Video:', errorData)
        return new Response(JSON.stringify({
          error: 'Erro na API do Panda Video',
          details: errorData
        }), {
          status: uploadResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      const uploadData = await uploadResponse.json()
      console.log('URL de upload obtida com sucesso:', uploadData)
      
      // Adicionar informações de título/nome do arquivo para o frontend
      const responseData = {
        ...uploadData,
        videoName: videoName || fileName,
        fileName,
        fileType,
        fileSize
      }
      
      // Retornar os dados para o cliente
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
      
    } catch (error) {
      console.error('Erro ao processar requisição para o Panda Video:', error)
      return new Response(JSON.stringify({
        error: 'Erro ao processar requisição',
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
  } catch (error) {
    console.error('Erro na edge function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
