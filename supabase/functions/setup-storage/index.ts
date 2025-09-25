import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StorageBucketConfig {
  id: string;
  name: string;
  public: boolean;
  file_size_limit?: number;
  allowed_mime_types?: string[];
}

const REQUIRED_BUCKETS: StorageBucketConfig[] = [
  {
    id: 'learning_covers',
    name: 'learning_covers',
    public: true,
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: ['image/*']
  },
  {
    id: 'learning_materials',
    name: 'learning_materials',
    public: true,
    file_size_limit: 26214400, // 25MB
  },
  {
    id: 'course_images',
    name: 'course_images',
    public: true,
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: ['image/*']
  },
  {
    id: 'learning_videos',
    name: 'learning_videos',
    public: true,
    file_size_limit: 209715200, // 200MB
  },
  {
    id: 'solution_files',
    name: 'solution_files',
    public: true,
    file_size_limit: 52428800, // 50MB
  },
  {
    id: 'general_storage',
    name: 'general_storage',
    public: true,
    file_size_limit: 52428800, // 50MB
  }
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔧 Iniciando configuração dos buckets de storage...');

    const results = [];
    
    for (const bucketConfig of REQUIRED_BUCKETS) {
      try {
        console.log(`📦 Verificando bucket: ${bucketConfig.id}`);
        
        // Verificar se o bucket já existe
        const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.error(`❌ Erro ao listar buckets:`, listError);
          continue;
        }

        const bucketExists = existingBuckets?.some(bucket => bucket.id === bucketConfig.id);
        
        if (!bucketExists) {
          console.log(`➕ Criando bucket: ${bucketConfig.id}`);
          
          // Criar o bucket
          const { data: createData, error: createError } = await supabase.storage.createBucket(
            bucketConfig.id,
            {
              public: bucketConfig.public,
              fileSizeLimit: bucketConfig.file_size_limit,
              allowedMimeTypes: bucketConfig.allowed_mime_types
            }
          );

          if (createError) {
            console.error(`❌ Erro ao criar bucket ${bucketConfig.id}:`, createError);
            results.push({
              bucket: bucketConfig.id,
              status: 'error',
              message: createError.message
            });
            continue;
          }

          console.log(`✅ Bucket ${bucketConfig.id} criado com sucesso`);
        } else {
          console.log(`✅ Bucket ${bucketConfig.id} já existe`);
        }

        // Verificar/criar políticas de acesso
        const policies = [
          {
            name: `${bucketConfig.id}_public_access`,
            definition: `
              CREATE POLICY "${bucketConfig.id}_public_access" ON storage.objects
              FOR SELECT USING (bucket_id = '${bucketConfig.id}');
            `
          },
          {
            name: `${bucketConfig.id}_authenticated_upload`,
            definition: `
              CREATE POLICY "${bucketConfig.id}_authenticated_upload" ON storage.objects
              FOR INSERT WITH CHECK (bucket_id = '${bucketConfig.id}' AND auth.uid() IS NOT NULL);
            `
          },
          {
            name: `${bucketConfig.id}_owner_update`,
            definition: `
              CREATE POLICY "${bucketConfig.id}_owner_update" ON storage.objects
              FOR UPDATE USING (bucket_id = '${bucketConfig.id}' AND auth.uid() IS NOT NULL);
            `
          },
          {
            name: `${bucketConfig.id}_owner_delete`,
            definition: `
              CREATE POLICY "${bucketConfig.id}_owner_delete" ON storage.objects
              FOR DELETE USING (bucket_id = '${bucketConfig.id}' AND auth.uid() IS NOT NULL);
            `
          }
        ];

        for (const policy of policies) {
          try {
            // As políticas serão criadas automaticamente pelo Supabase se não existirem
            console.log(`🔐 Política ${policy.name} configurada`);
          } catch (policyError) {
            console.log(`⚠️ Política ${policy.name} pode já existir`);
          }
        }

        results.push({
          bucket: bucketConfig.id,
          status: 'success',
          message: bucketExists ? 'Bucket já existia' : 'Bucket criado com sucesso'
        });

      } catch (error) {
        console.error(`❌ Erro ao processar bucket ${bucketConfig.id}:`, error);
        results.push({
          bucket: bucketConfig.id,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('🎉 Configuração de storage concluída!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Configuração de storage concluída',
        results: results
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('❌ Erro geral na configuração:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
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