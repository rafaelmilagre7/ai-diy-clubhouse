
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    console.log("🔄 [HEALTH-CHECK] Recebendo requisição OPTIONS - CORS Preflight");
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`🚀 [HEALTH-CHECK] Iniciando verificação COMPLETA de saúde do Resend - Método: ${req.method}`);
  console.log(`📍 [HEALTH-CHECK] URL da requisição: ${req.url}`);
  console.log(`🌐 [HEALTH-CHECK] Headers da requisição:`, Object.fromEntries(req.headers.entries()));

  try {
    const startTime = Date.now();
    
    // Verificar se API key existe
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log(`🔑 [HEALTH-CHECK] Status da API key:`, {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      prefix: apiKey?.substring(0, 8) + "***",
      format: apiKey?.startsWith("re_") ? "válido" : "inválido"
    });
    
    if (!apiKey) {
      console.warn("⚠️ [HEALTH-CHECK] API key do Resend não configurada");
      return new Response(
        JSON.stringify({
          health: {
            apiKeyValid: false,
            apiKeyMissing: true,
            domainVerified: false,
            quotaExceeded: false,
            lastTestEmail: null,
            timestamp: new Date().toISOString(),
            message: "API key não configurada",
            debug: {
              env_vars_available: Object.keys(Deno.env.toObject()).filter(key => key.includes("RESEND")),
              total_env_vars: Object.keys(Deno.env.toObject()).length
            }
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verificar formato da API key
    if (!apiKey.startsWith("re_")) {
      console.error("❌ [HEALTH-CHECK] Formato de API key inválido - deve começar com 're_'");
      return new Response(
        JSON.stringify({
          health: {
            apiKeyValid: false,
            apiKeyMissing: false,
            domainVerified: false,
            quotaExceeded: false,
            lastTestEmail: null,
            error: "Formato de API key inválido",
            timestamp: new Date().toISOString(),
            debug: {
              api_key_prefix: apiKey.substring(0, 3),
              api_key_length: apiKey.length,
              expected_format: "re_XXXXXXXXXXXXXXXXXXXXXXXX"
            }
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ [HEALTH-CHECK] API key encontrada e formato válido, inicializando Resend...");
    
    // Inicializar Resend com timeout
    let resend;
    try {
      console.log("🔧 [HEALTH-CHECK] Criando instância do Resend...");
      resend = new Resend(apiKey);
      console.log("✅ [HEALTH-CHECK] Instância do Resend criada com sucesso");
    } catch (initError: any) {
      console.error("❌ [HEALTH-CHECK] Erro ao inicializar Resend:", {
        message: initError.message,
        stack: initError.stack,
        name: initError.name
      });
      return new Response(
        JSON.stringify({
          health: {
            apiKeyValid: false,
            apiKeyMissing: false,
            domainVerified: false,
            quotaExceeded: false,
            lastTestEmail: null,
            error: "Erro na inicialização do Resend",
            timestamp: new Date().toISOString(),
            debug: {
              init_error: initError.message,
              api_key_format: apiKey.substring(0, 8) + "***"
            }
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Teste 1: Verificar API key com retry logic
    let apiKeyValid = false;
    let domainVerified = false;
    let apiTestAttempts = 0;
    const maxAttempts = 3;
    
    while (apiTestAttempts < maxAttempts && !apiKeyValid) {
      apiTestAttempts++;
      console.log(`🔑 [HEALTH-CHECK] Tentativa ${apiTestAttempts}/${maxAttempts} - Testando validade da API key...`);
      
      try {
        const testStartTime = Date.now();
        
        // Teste básico: listar domínios
        console.log("📋 [HEALTH-CHECK] Fazendo requisição para listar domínios...");
        const domains = await resend.domains.list();
        const testDuration = Date.now() - testStartTime;
        
        console.log(`✅ [HEALTH-CHECK] API key válida! Domínios encontrados: ${domains.data?.length || 0} (${testDuration}ms)`);
        console.log("📋 [HEALTH-CHECK] Detalhes dos domínios:", domains.data?.map(d => ({
          name: d.name,
          status: d.status,
          region: d.region
        })));
        
        apiKeyValid = true;
        
        // Verificar se o domínio viverdeia.ai está verificado
        if (domains.data && domains.data.length > 0) {
          const targetDomain = domains.data.find(domain => 
            domain.name === "viverdeia.ai"
          );
          
          if (targetDomain) {
            domainVerified = targetDomain.status === "verified";
            console.log(`🌐 [HEALTH-CHECK] Domínio viverdeia.ai encontrado - Status: ${targetDomain.status}`);
          } else {
            console.warn("⚠️ [HEALTH-CHECK] Domínio viverdeia.ai não encontrado");
            console.log("📋 [HEALTH-CHECK] Domínios disponíveis:", 
              domains.data.map(d => `${d.name} (${d.status})`).join(", ")
            );
          }
        }
        
        break; // Sucesso, sair do loop
        
      } catch (apiError: any) {
        console.error(`❌ [HEALTH-CHECK] Tentativa ${apiTestAttempts} falhou:`, {
          message: apiError.message,
          status: apiError.status,
          name: apiError.name,
          stack: apiError.stack?.substring(0, 200) + "..."
        });
        
        // Aguardar antes da próxima tentativa (exceto na última)
        if (apiTestAttempts < maxAttempts) {
          const delay = 1000 * apiTestAttempts; // 1s, 2s, 3s
          console.log(`⏳ [HEALTH-CHECK] Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Teste 2: Verificação de quota (simulado)
    const quotaExceeded = false; // Placeholder - implementar se API do Resend permitir

    // Teste 3: Conectividade geral
    const connectivityTest = {
      latency: Date.now() - startTime,
      attempts: apiTestAttempts,
      success: apiKeyValid
    };

    const healthResult = {
      apiKeyValid,
      apiKeyMissing: false,
      domainVerified,
      quotaExceeded,
      lastTestEmail: null,
      timestamp: new Date().toISOString(),
      message: apiKeyValid ? "Sistema funcionando" : "Problemas detectados",
      debug: {
        total_duration_ms: Date.now() - startTime,
        api_test_attempts: apiTestAttempts,
        connectivity: connectivityTest,
        api_key_info: {
          format_valid: apiKey.startsWith("re_"),
          length: apiKey.length,
          prefix: apiKey.substring(0, 8) + "***"
        }
      }
    };

    console.log("📊 [HEALTH-CHECK] Resultado final:", healthResult);

    return new Response(
      JSON.stringify({
        health: healthResult
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ [HEALTH-CHECK] Erro geral na verificação:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({
        health: {
          apiKeyValid: false,
          apiKeyMissing: false,
          domainVerified: false,
          quotaExceeded: false,
          lastTestEmail: null,
          error: error.message,
          timestamp: new Date().toISOString(),
          debug: {
            error_type: error.name,
            error_stack: error.stack?.substring(0, 200) + "...",
            runtime_info: {
              deno_version: Deno.version.deno,
              typescript_version: Deno.version.typescript
            }
          }
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
