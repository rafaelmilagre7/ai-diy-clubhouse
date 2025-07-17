import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🔄 [${requestId}] Upload request started:`, {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight handled`);
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`❌ [${requestId}] Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ 
      error: 'Method Not Allowed',
      requestId 
    }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    // Check API key
    const apiKey = Deno.env.get('IMGBB_API_KEY');
    
    if (!apiKey) {
      console.error(`❌ [${requestId}] IMGBB_API_KEY not configured`);
      return new Response(JSON.stringify({ 
        error: 'ImgBB API key not configured',
        requestId 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`🔑 [${requestId}] API key available: ${apiKey.substring(0, 8)}...`);

    // Parse form data
    console.log(`📋 [${requestId}] Parsing form data...`);
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      console.log(`❌ [${requestId}] No valid file found in form data`);
      return new Response(JSON.stringify({ 
        error: 'No file uploaded',
        requestId 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`📄 [${requestId}] File received:`, {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeMB: (file.size / 1024 / 1024).toFixed(2)
    });

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.log(`❌ [${requestId}] File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return new Response(JSON.stringify({ 
        error: 'File too large. Maximum size is 5MB.',
        fileSize: file.size,
        requestId 
      }), { 
        status: 413, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log(`❌ [${requestId}] Invalid file type: ${file.type}`);
      return new Response(JSON.stringify({ 
        error: 'Invalid file type. Only images are allowed.',
        fileType: file.type,
        requestId 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Prepare upload to ImgBB
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    uploadFormData.append('key', apiKey);

    console.log(`📤 [${requestId}] Uploading to ImgBB...`);
    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: uploadFormData
    });

    console.log(`📨 [${requestId}] ImgBB response status: ${imgbbResponse.status}`);

    const imgbbResult = await imgbbResponse.json();

    if (!imgbbResult.success) {
      console.error(`❌ [${requestId}] ImgBB upload failed:`, {
        error: imgbbResult.error,
        status: imgbbResponse.status
      });
      return new Response(JSON.stringify({ 
        error: 'Image upload failed', 
        details: imgbbResult.error,
        requestId 
      }), { 
        status: 422, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Upload successful:`, {
      url: imgbbResult.data.url,
      duration: `${duration}ms`,
      size: file.size,
      type: file.type
    });

    return new Response(JSON.stringify({
      publicUrl: imgbbResult.data.url,
      displayUrl: imgbbResult.data.display_url,
      thumbnailUrl: imgbbResult.data.thumb?.url || imgbbResult.data.url,
      requestId,
      uploadTime: duration
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 [${requestId}] Upload error after ${duration}ms:`, {
      message: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: error.message,
      requestId,
      duration 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});