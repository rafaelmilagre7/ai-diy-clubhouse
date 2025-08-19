import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkedInPostRequest {
  userId: string;
  postData: {
    title: string;
    description: string;
    url: string;
    imageUrl?: string;
  };
  linkedInProfile?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

Deno.serve(async (req) => {
  console.log('🚀 [LINKEDIN-POST] Iniciando edge function...');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: LinkedInPostRequest = await req.json();
    console.log('📝 [LINKEDIN-POST] Dados recebidos:', {
      userId: body.userId,
      hasLinkedInProfile: !!body.linkedInProfile,
      postTitle: body.postData.title
    });

    // Verificar se usuário tem conexão ativa com LinkedIn
    const { data: connection, error: connectionError } = await supabase
      .from('linkedin_connections')
      .select('*')
      .eq('user_id', body.userId)
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      console.log('❌ [LINKEDIN-POST] Conexão LinkedIn não encontrada');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'LinkedIn connection not found',
          needsAuth: true
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Para demo, simular sucesso do post
    // Em produção real, aqui faria a chamada para LinkedIn API
    console.log('✅ [LINKEDIN-POST] Simulando post no LinkedIn...');
    
    const mockPostResponse = {
      id: crypto.randomUUID(),
      text: body.postData.description,
      publishedAt: new Date().toISOString(),
      author: connection.profile_data,
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0
      }
    };

    // Registrar analytics do compartilhamento
    const { error: analyticsError } = await supabase
      .from('certificate_shares')
      .insert({
        user_id: body.userId,
        certificate_id: body.postData.url.split('/').pop(), // Extrair ID do certificado da URL
        share_type: 'api_direct',
        platform: 'linkedin',
        post_data: {
          ...body.postData,
          linkedin_post_id: mockPostResponse.id,
          posted_via: 'api'
        }
      });

    if (analyticsError) {
      console.error('⚠️ [LINKEDIN-POST] Erro ao registrar analytics:', analyticsError);
    }

    // Verificar conquistas
    const { data: achievementsResult } = await supabase.rpc('check_and_grant_achievements', {
      user_uuid: body.userId
    });

    console.log('🎯 [LINKEDIN-POST] Post simulado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true,
        postId: mockPostResponse.id,
        postUrl: `https://linkedin.com/posts/activity-${mockPostResponse.id}`,
        newAchievements: achievementsResult?.new_achievements || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [LINKEDIN-POST] Erro:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/*
NOTA PARA IMPLEMENTAÇÃO REAL:

Para conectar com a API real do LinkedIn, você precisará:

1. Registrar app no LinkedIn Developer Portal
2. Configurar OAuth 2.0
3. Obter Client ID e Client Secret
4. Implementar fluxo OAuth completo
5. Usar LinkedIn API v2 para posts:

const linkedInResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${connection.access_token_encrypted}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0'
  },
  body: JSON.stringify({
    author: `urn:li:person:${connection.linkedin_user_id}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: body.postData.description
        },
        shareMediaCategory: 'ARTICLE',
        media: [{
          status: 'READY',
          originalUrl: body.postData.url,
          title: {
            text: body.postData.title
          }
        }]
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  })
});
*/