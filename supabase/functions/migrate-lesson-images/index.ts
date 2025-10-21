import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
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

    console.log('🔄 Iniciando migração de imagens das aulas...')

    // Buscar todas as aulas que usam ImgBB
    const { data: lessons, error: fetchError } = await supabaseClient
      .from('learning_lessons')
      .select('id, title, cover_image_url')
      .like('cover_image_url', '%ibb.co%')

    if (fetchError) {
      throw new Error(`Erro ao buscar aulas: ${fetchError.message}`)
    }

    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma aula com imagem do ImgBB encontrada',
          migrated: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 Encontradas ${lessons.length} aulas para migrar`)

    let migrated = 0
    let errors: string[] = []

    // Garantir que o bucket existe
    const { error: bucketError } = await supabaseClient.storage
      .createBucket('learning_covers', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Erro ao criar bucket:', bucketError)
    }

    // Migrar cada imagem
    for (const lesson of lessons) {
      try {
        console.log(`🖼️ Migrando imagem da aula: ${lesson.title}`)
        
        // Fazer download da imagem do ImgBB
        const response = await fetch(lesson.cover_image_url)
        if (!response.ok) {
          throw new Error(`Falha ao baixar imagem: ${response.status}`)
        }

        const imageBlob = await response.blob()
        const imageBuffer = await imageBlob.arrayBuffer()
        
        // Determinar extensão do arquivo
        const contentType = response.headers.get('content-type') || 'image/jpeg'
        const extension = contentType.includes('png') ? 'png' : 
                         contentType.includes('webp') ? 'webp' : 'jpg'
        
        // Gerar nome único para o arquivo
        const fileName = `aula-${lesson.id}.${extension}`
        const filePath = `aulas/${fileName}`

        console.log(`📤 Fazendo upload para: ${filePath}`)

        // Upload para o Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('learning_covers')
          .upload(filePath, new Uint8Array(imageBuffer), {
            contentType,
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          throw new Error(`Erro no upload: ${uploadError.message}`)
        }

        // Obter URL pública
        const { data: publicUrlData } = supabaseClient.storage
          .from('learning_covers')
          .getPublicUrl(filePath)

        const newImageUrl = publicUrlData.publicUrl

        console.log(`🔗 Nova URL: ${newImageUrl}`)

        // Atualizar a URL no banco de dados
        const { error: updateError } = await supabaseClient
          .from('learning_lessons')
          .update({ cover_image_url: newImageUrl })
          .eq('id', lesson.id)

        if (updateError) {
          throw new Error(`Erro ao atualizar URL: ${updateError.message}`)
        }

        migrated++
        console.log(`✅ Migração concluída para: ${lesson.title}`)

      } catch (error: any) {
        const errorMsg = `Erro na aula "${lesson.title}": ${error.message}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    const result = {
      success: true,
      message: `Migração concluída! ${migrated} de ${lessons.length} imagens migradas com sucesso.`,
      migrated,
      total: lessons.length,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('🎉 Migração finalizada:', result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('💥 Erro na migração:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})