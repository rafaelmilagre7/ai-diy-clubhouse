
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurações de buckets e seus limites
const STORAGE_BUCKETS = {
  learning_videos: 300 * 1024 * 1024,    // 300MB para vídeos
  learning_resources: 100 * 1024 * 1024, // 100MB para recursos
  learning_covers: 10 * 1024 * 1024,     // 10MB para imagens de capa
  learning_images: 20 * 1024 * 1024,     // 20MB para imagens gerais
  solution_files: 300 * 1024 * 1024,     // 300MB para arquivos de solução
};

serve(async (req) => {
  // Tratamento para CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com chave de serviço para acesso administrativo
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Obter buckets existentes
    const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Erro ao listar buckets: ${listError.message}`);
    }

    const results = [];
    const existingBucketNames = existingBuckets.map(bucket => bucket.name);
    
    // Processar cada bucket necessário
    for (const [bucketName, sizeLimit] of Object.entries(STORAGE_BUCKETS)) {
      try {
        if (existingBucketNames.includes(bucketName)) {
          // Atualizar bucket existente
          const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
            public: true,
            fileSizeLimit: sizeLimit
          });
          
          if (updateError) {
            results.push({ 
              bucket: bucketName, 
              success: false, 
              action: 'update', 
              error: updateError.message 
            });
          } else {
            results.push({ 
              bucket: bucketName, 
              success: true, 
              action: 'update',
              sizeLimit: `${Math.round(sizeLimit / (1024 * 1024))}MB`
            });
            
            // Configurar políticas de RLS para o bucket
            await configureStoragePolicies(supabaseAdmin, bucketName);
          }
        } else {
          // Criar novo bucket
          const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: sizeLimit
          });
          
          if (createError) {
            results.push({ 
              bucket: bucketName, 
              success: false, 
              action: 'create', 
              error: createError.message 
            });
          } else {
            results.push({ 
              bucket: bucketName, 
              success: true, 
              action: 'create',
              sizeLimit: `${Math.round(sizeLimit / (1024 * 1024))}MB`
            });
            
            // Configurar políticas de RLS para o bucket
            await configureStoragePolicies(supabaseAdmin, bucketName);
          }
        }
      } catch (err) {
        results.push({ 
          bucket: bucketName, 
          success: false, 
          action: 'process', 
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    // Contar quantos buckets foram configurados com sucesso
    const successCount = results.filter(r => r.success).length;
    const totalCount = Object.keys(STORAGE_BUCKETS).length;
    
    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `${successCount} de ${totalCount} buckets configurados com sucesso`,
        details: results
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  } catch (err) {
    console.error("Erro no setup de buckets:", err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Erro ao configurar buckets: ${err instanceof Error ? err.message : 'Unknown error'}`,
        error: err instanceof Error ? err.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});

// Função auxiliar para configurar políticas de acesso aos buckets
async function configureStoragePolicies(supabase: any, bucketName: string) {
  try {
    // Chamar função RPC para configurar políticas públicas
    const { error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      console.warn(`Erro ao configurar políticas para ${bucketName}: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Erro ao configurar políticas para ${bucketName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return false;
  }
}
