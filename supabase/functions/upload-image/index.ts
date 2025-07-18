import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const startTime = Date.now();
  const requestId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  console.log(`🚀 [${requestId}] === UPLOAD IMAGE OTIMIZADO INICIADO ===`);
  console.log(`📋 [${requestId}] Request details:`, {
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent')?.substring(0, 50),
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight respondido`);
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`❌ [${requestId}] Método inválido: ${req.method}`);
    return new Response(JSON.stringify({ 
      error: 'Method Not Allowed',
      requestId,
      allowedMethods: ['POST']
    }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    // Check API key with detailed logging
    const apiKey = Deno.env.get('IMGBB_API_KEY');
    
    if (!apiKey) {
      console.error(`❌ [${requestId}] IMGBB_API_KEY não configurada`);
      return new Response(JSON.stringify({ 
        error: 'ImgBB API key not configured',
        requestId,
        hint: 'Configure IMGBB_API_KEY na seção de secrets'
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`🔑 [${requestId}] API key disponível: ${apiKey.substring(0, 8)}***`);

    // Parse form data with timeout
    console.log(`📋 [${requestId}] Parseando form data...`);
    
    const parseTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Form parsing timeout')), 10000)
    );
    
    const parsePromise = req.formData();
    const formData = await Promise.race([parsePromise, parseTimeout]) as FormData;
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      console.log(`❌ [${requestId}] Arquivo não encontrado no form data`);
      console.log(`📊 [${requestId}] Form keys:`, Array.from(formData.keys()));
      return new Response(JSON.stringify({ 
        error: 'No file uploaded',
        requestId,
        hint: 'Envie o arquivo no campo "image"'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`📄 [${requestId}] Arquivo recebido:`, {
      name: file.name,
      size: file.size,
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
      type: file.type,
      lastModified: file.lastModified
    });

    // Enhanced file validation
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      console.log(`❌ [${requestId}] Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (limite: ${maxSizeMB}MB)`);
      return new Response(JSON.stringify({ 
        error: `File too large. Maximum size is ${maxSizeMB}MB.`,
        fileSize: file.size,
        fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
        requestId 
      }), { 
        status: 413, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Validate file type with more specificity
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!file.type || (!file.type.startsWith('image/') && !allowedTypes.includes(file.type))) {
      console.log(`❌ [${requestId}] Tipo de arquivo inválido: ${file.type}`);
      return new Response(JSON.stringify({ 
        error: 'Invalid file type. Only images are allowed.',
        fileType: file.type,
        allowedTypes,
        requestId 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // RETRY AUTOMÁTICO com ImgBB
    let uploadSuccess = false;
    let imgbbResult: any = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries && !uploadSuccess; attempt++) {
      try {
        console.log(`📤 [${requestId}] Tentativa ${attempt}/${maxRetries} - Upload para ImgBB...`);
        
        // Prepare upload to ImgBB
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        uploadFormData.append('key', apiKey);
        
        // Add timeout to ImgBB request
        const uploadTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('ImgBB timeout (20s)')), 20000)
        );
        
        const uploadPromise = fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: uploadFormData
        });
        
        const imgbbResponse = await Promise.race([uploadPromise, uploadTimeout]) as Response;
        
        console.log(`📨 [${requestId}] ImgBB response status: ${imgbbResponse.status} (tentativa ${attempt})`);
        
        if (!imgbbResponse.ok) {
          throw new Error(`ImgBB HTTP ${imgbbResponse.status}: ${imgbbResponse.statusText}`);
        }
        
        imgbbResult = await imgbbResponse.json();
        
        if (!imgbbResult.success) {
          throw new Error(`ImgBB API error: ${imgbbResult.error?.message || 'Unknown error'}`);
        }
        
        console.log(`✅ [${requestId}] Upload ImgBB bem-sucedido (tentativa ${attempt}):`, {
          url: imgbbResult.data?.url,
          size: imgbbResult.data?.size,
          deleteUrl: imgbbResult.data?.delete_url ? 'provided' : 'not provided'
        });
        
        uploadSuccess = true;
        
      } catch (error: any) {
        console.warn(`⚠️ [${requestId}] Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ [${requestId}] Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Última tentativa falhou
          console.error(`❌ [${requestId}] Todas as tentativas falharam. Último erro:`, error.message);
          return new Response(JSON.stringify({ 
            error: 'Image upload failed after multiple attempts', 
            details: error.message,
            attempts: maxRetries,
            requestId 
          }), { 
            status: 422, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`🎉 [${requestId}] === UPLOAD CONCLUÍDO COM SUCESSO ===`);
    console.log(`📊 [${requestId}] Estatísticas finais:`, {
      url: imgbbResult.data.url,
      duration: `${duration}ms`,
      fileSize: file.size,
      fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
      fileType: file.type,
      compressionRatio: imgbbResult.data.size ? 
        (((file.size - imgbbResult.data.size) / file.size) * 100).toFixed(1) + '%' : 
        'N/A'
    });

    return new Response(JSON.stringify({
      success: true,
      publicUrl: imgbbResult.data.url,
      displayUrl: imgbbResult.data.display_url,
      thumbnailUrl: imgbbResult.data.thumb?.url || imgbbResult.data.url,
      deleteUrl: imgbbResult.data.delete_url,
      metadata: {
        size: imgbbResult.data.size,
        width: imgbbResult.data.width,
        height: imgbbResult.data.height,
        originalFilename: file.name,
        uploadDuration: duration
      },
      requestId
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`💥 [${requestId}] === ERRO CRÍTICO === (${duration}ms)`);
    console.error(`❌ [${requestId}] Erro:`, error.message);
    console.error(`🔍 [${requestId}] Stack trace:`, error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      message: error.message,
      requestId,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});