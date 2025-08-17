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
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação necessário' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Obter chave segura do environment
    const imgbbApiKey = Deno.env.get('IMGBB_API_KEY');
    if (!imgbbApiKey) {
      console.error('[IMAGE-UPLOAD] IMGBB_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Serviço de upload indisponível' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se a requisição contém arquivo
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'Arquivo de imagem é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return new Response(
        JSON.stringify({ 
          error: 'Tipo de arquivo não permitido. Use: JPEG, PNG, GIF ou WebP' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar tamanho (máx 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return new Response(
        JSON.stringify({ 
          error: 'Arquivo muito grande. Tamanho máximo: 10MB' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[IMAGE-UPLOAD] Processando upload: ${imageFile.name} (${imageFile.size} bytes)`);

    // Converter para base64 (ImgBB exige)
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Preparar dados para ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('key', imgbbApiKey);
    imgbbFormData.append('image', base64Image);
    imgbbFormData.append('name', imageFile.name.replace(/\.[^/.]+$/, "")); // Nome sem extensão

    // Upload para ImgBB
    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData,
    });

    const imgbbData = await imgbbResponse.json();

    if (!imgbbResponse.ok || !imgbbData.success) {
      console.error('[IMAGE-UPLOAD] Erro no ImgBB:', imgbbData);
      return new Response(
        JSON.stringify({ 
          error: 'Erro no serviço de upload de imagens',
          details: imgbbData.error?.message || 'Erro desconhecido'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extrair URLs úteis
    const result = {
      success: true,
      data: {
        id: imgbbData.data.id,
        title: imgbbData.data.title,
        url_viewer: imgbbData.data.url_viewer,
        url: imgbbData.data.url,
        display_url: imgbbData.data.display_url,
        width: imgbbData.data.width,
        height: imgbbData.data.height,
        size: imgbbData.data.size,
        time: imgbbData.data.time,
        expiration: imgbbData.data.expiration,
        image: {
          filename: imgbbData.data.image.filename,
          name: imgbbData.data.image.name,
          mime: imgbbData.data.image.mime,
          extension: imgbbData.data.image.extension,
          url: imgbbData.data.image.url
        },
        thumb: {
          filename: imgbbData.data.thumb.filename,
          name: imgbbData.data.thumb.name,
          mime: imgbbData.data.thumb.mime,
          extension: imgbbData.data.thumb.extension,
          url: imgbbData.data.thumb.url
        },
        medium: imgbbData.data.medium ? {
          filename: imgbbData.data.medium.filename,
          name: imgbbData.data.medium.name,
          mime: imgbbData.data.medium.mime,
          extension: imgbbData.data.medium.extension,
          url: imgbbData.data.medium.url
        } : null,
        delete_url: imgbbData.data.delete_url
      }
    };

    console.log(`[IMAGE-UPLOAD] Upload bem-sucedido: ${result.data.url}`);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('[IMAGE-UPLOAD] Erro inesperado:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});