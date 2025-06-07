
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    // Utilizar a chave de API do ImgBB dos secrets do Supabase
    const apiKey = Deno.env.get('IMGBB_API_KEY');
    
    if (!apiKey) {
      console.error('IMGBB_API_KEY not configured in environment variables');
      return new Response(JSON.stringify({ error: 'ImgBB API key not configured' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Validar tamanho do arquivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 5MB.' }), { 
        status: 413, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only images are allowed.' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    uploadFormData.append('key', apiKey);

    console.log('Uploading image to ImgBB...');
    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: uploadFormData
    });

    const imgbbResult = await imgbbResponse.json();

    if (!imgbbResult.success) {
      console.error('ImgBB upload failed:', imgbbResult.error);
      return new Response(JSON.stringify({ error: 'Image upload failed', details: imgbbResult.error }), { 
        status: 422, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Image uploaded successfully to ImgBB');
    return new Response(JSON.stringify({
      publicUrl: imgbbResult.data.url,
      displayUrl: imgbbResult.data.display_url,
      thumbnailUrl: imgbbResult.data.thumb?.url || imgbbResult.data.url
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
