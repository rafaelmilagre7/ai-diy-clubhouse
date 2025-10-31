import { createClient } from '@supabase/supabase-js'
import { getSecureCorsHeaders, isOriginAllowed, forbiddenOriginResponse } from '../_shared/secureCors.ts'

Deno.serve(async (req) => {
  const corsHeaders = getSecureCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 🔒 VALIDAÇÃO CORS: Bloquear origens não confiáveis
  if (!isOriginAllowed(req)) {
    console.warn('[SECURITY] Origem não autorizada bloqueada:', req.headers.get('origin'));
    return forbiddenOriginResponse();
  }

  try {
    // Obter token do usuário
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ Tentativa de upload sem autenticação')
      throw new Error('Não autenticado')
    }

    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Falha na autenticação:', authError?.message)
      throw new Error('Usuário não autenticado')
    }

    // Parse do form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('❌ Nenhum arquivo recebido')
      throw new Error('Nenhum arquivo enviado')
    }

    // Validações de segurança
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error('❌ Arquivo muito grande:', file.size, 'bytes')
      throw new Error('Arquivo muito grande (máximo 5MB)')
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Tipo de arquivo não permitido:', file.type)
      throw new Error('Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.')
    }

    // 🔒 SEGURANÇA: Construir path FORÇANDO o user ID do usuário autenticado
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const secureFilePath = `avatars/${user.id}/${timestamp}-profile.${fileExtension}`

    // Log de auditoria
    console.log('✅ Upload attempt:', {
      userId: user.id,
      userEmail: user.email,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      secureFilePath,
      timestamp: new Date().toISOString()
    })

    // Cliente com service_role para bypass RLS (mas com validação acima)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload do arquivo
    const { data, error } = await supabaseAdmin.storage
      .from('profile-pictures')
      .upload(secureFilePath, file, {
        cacheControl: '3600',
        upsert: false // Não sobrescrever - sempre cria novo arquivo
      })

    if (error) {
      console.error('❌ Erro no upload:', error)
      throw new Error(`Erro no upload: ${error.message}`)
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('profile-pictures')
      .getPublicUrl(data.path)

    console.log('✅ Upload concluído com sucesso:', publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true, 
        publicUrl,
        path: data.path,
        fileName: file.name,
        fileSize: file.size
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro na edge function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
