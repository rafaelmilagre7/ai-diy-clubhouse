import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma imagem foi enviada' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validar tipo de arquivo
    if (!imageFile.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Arquivo deve ser uma imagem' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Gerar nome único para o arquivo
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `lesson-covers/${fileName}`

    // Upload para o bucket de imagens
    const { data, error } = await supabaseClient.storage
      .from('lesson-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erro no upload:', error)
      return new Response(
        JSON.stringify({ error: `Erro no upload: ${error.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Obter URL pública
    const { data: publicUrlData } = supabaseClient.storage
      .from('lesson-images')
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({ 
        publicUrl: publicUrlData.publicUrl,
        path: filePath
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro na edge function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})