
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

// Cria uma função que configura um bucket de armazenamento
serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação do usuário (JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Usuário não autenticado"
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Inicializar cliente Supabase com service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Configuração de ambiente incompleta no servidor"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obter nome do bucket do corpo da requisição
    const { bucketName, bucketOptions } = await req.json();
    
    if (!bucketName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nome do bucket não fornecido"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ao listar buckets: ${listError.message}`
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Criar o bucket com opções padrão ou personalizadas
      const options = {
        public: true,
        fileSizeLimit: 314572800, // 300MB padrão
        ...(bucketOptions || {})
      };
      
      const { error: createError } = await supabase.storage.createBucket(bucketName, options);
      
      if (createError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Erro ao criar bucket: ${createError.message}`
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }
      
      // Configurar políticas de acesso público para o bucket
      try {
        // Remover políticas existentes para garantir limpeza
        await supabase.rpc("create_storage_public_policy", { bucket_name: bucketName });
      } catch (policyError) {
        console.error("Erro ao configurar políticas:", policyError);
        // Não falhar completamente se as políticas derem erro
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Bucket '${bucketName}' criado com sucesso`,
          isNew: true
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Se o bucket já existir, apenas retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: `Bucket '${bucketName}' já existe`,
        isNew: false
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro ao processar requisição: ${error instanceof Error ? error.message : String(error)}`
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
