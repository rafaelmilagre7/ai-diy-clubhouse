
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-security-level",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Template {
  id: string;
  name: string;
  status: string;
  language: string;
  category: string;
  components: any[];
  quality_score?: {
    score: string;
    date: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`📋 [WHATSAPP-LIST-TEMPLATES] ${req.method} request received - v1.0`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Carregar variáveis de ambiente
    const whatsappToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const businessId = Deno.env.get("WHATSAPP_BUSINESS_ID");

    if (!whatsappToken) {
      console.error("❌ [LIST-TEMPLATES] WHATSAPP_API_TOKEN não configurado");
      throw new Error("WHATSAPP_API_TOKEN não configurado no Supabase");
    }

    if (!businessId) {
      console.error("❌ [LIST-TEMPLATES] WHATSAPP_BUSINESS_ID não configurado");
      throw new Error("WHATSAPP_BUSINESS_ID não configurado no Supabase");
    }

    console.log(`📋 [LIST-TEMPLATES] Buscando templates para Business ID: ${businessId}`);

    // Buscar templates via Meta Business API
    const apiUrl = `https://graph.facebook.com/v18.0/${businessId}/message_templates?fields=id,name,status,language,category,components,quality_score&limit=100`;
    console.log(`📋 [LIST-TEMPLATES] URL da API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`📋 [LIST-TEMPLATES] Status da resposta: ${response.status}`);

    const responseText = await response.text();
    console.log(`📋 [LIST-TEMPLATES] Resposta raw:`, responseText.substring(0, 500));

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: { message: responseText } };
      }
      
      console.error(`❌ [LIST-TEMPLATES] Erro da API (${response.status}):`, errorData);
      
      throw new Error(`Meta API Error: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error(`❌ [LIST-TEMPLATES] Erro ao parsear resposta:`, e);
      throw new Error('Resposta inválida da API do WhatsApp Business');
    }

    const templates: Template[] = responseData.data || [];
    console.log(`📋 [LIST-TEMPLATES] Total de templates encontrados: ${templates.length}`);

    // Filtrar apenas templates aprovados
    const approvedTemplates = templates.filter(template => template.status === 'APPROVED');
    console.log(`📋 [LIST-TEMPLATES] Templates aprovados: ${approvedTemplates.length}`);

    // Buscar especificamente o template convite_viver_ia
    const targetTemplate = approvedTemplates.find(t => t.name === 'convite_viver_ia');
    console.log(`📋 [LIST-TEMPLATES] Template 'convite_viver_ia' encontrado:`, !!targetTemplate);

    // Log de templates encontrados
    approvedTemplates.forEach(template => {
      console.log(`📋 [TEMPLATE] ${template.name} (${template.id}) - ${template.language} - ${template.category}`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `${approvedTemplates.length} templates aprovados encontrados`,
        data: {
          totalTemplates: templates.length,
          approvedTemplates: approvedTemplates.length,
          templates: approvedTemplates,
          hasTargetTemplate: !!targetTemplate,
          targetTemplate: targetTemplate || null,
          businessId: businessId
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [LIST-TEMPLATES] Erro:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        message: "Falha ao buscar templates WhatsApp"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📋 [WHATSAPP-LIST-TEMPLATES] Edge Function carregada! v1.0");
serve(handler);
