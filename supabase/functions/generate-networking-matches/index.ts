
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Tipos para dados do onboarding
type OnboardingData = {
  personal_info?: any;
  professional_info?: any;
  business_context?: any;
  business_goals?: any;
  ai_experience?: any;
  experience_personalization?: any;
  complementary_info?: any;
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  current_position?: string;
  annual_revenue?: string;
}

// Tipo para quick onboarding
type QuickOnboardingData = {
  name: string;
  email: string;
  company_name: string;
  company_segment: string;
  role: string;
  company_size: string;
  annual_revenue_range: string;
  business_model: string;
  business_challenges: string[];
  ai_knowledge_level: string;
  short_term_goals?: string[];
  medium_term_goals?: string[];
  important_kpis?: string[];
  primary_goal: string;
  has_implemented: string;
  desired_ai_areas?: string[];
  additional_context?: string;
  skills_to_share?: string[];
  mentorship_topics?: string[];
  networking_availability?: number;
  is_completed: boolean;
}

// Tipo para perfil unificado
interface UnifiedUserProfile {
  id: string;
  name: string;
  email: string;
  company_name: string;
  company_sector: string;
  company_size: string;
  current_position: string;
  business_challenges: string[];
  business_model: string;
  short_term_goals: string[];
  medium_term_goals: string[];
  important_kpis: string[];
  ai_knowledge_level: string;
  desired_ai_areas: string[];
  annual_revenue: string;
  primary_goal: string;
  skills_to_share: string[];
}

// Tipo para as strengths
interface MatchStrength {
  factor: string;
  strength: number;
  description: string;
}

// Método para gerar análise de compatibilidade com OpenAI
async function analyzeCompatibility(
  profile1: UnifiedUserProfile,
  profile2: UnifiedUserProfile,
  matchType: 'customer' | 'supplier'
): Promise<{ 
  score: number;
  reason: string;
  strengths: MatchStrength[];
  suggestedTopics: string[];
  aiAnalysis: any;
}> {
  try {
    // Se não temos API key da OpenAI, usar fallback
    if (!OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API key não configurada, usando fallback');
      return generateFallbackAnalysis(profile1, profile2, matchType);
    }
    
    // Criando prompt específico baseado no tipo de match
    const systemPrompt = matchType === 'customer' 
      ? `Você é um analista de negócios especializado em identificar oportunidades de venda B2B. 
        Analise o perfil de um potencial cliente e um fornecedor para determinar a compatibilidade.`
      : `Você é um analista de negócios especializado em identificar fornecedores ideais. 
        Analise o perfil de uma empresa e um potencial fornecedor para determinar a compatibilidade.`;

    // Construindo o prompt com os dados dos perfis
    const userPrompt = `
    # Análise de Compatibilidade para Networking de Negócios
    
    ${matchType === 'customer' ? '## Potencial Cliente' : '## Empresa'}:
    - Nome: ${profile2.name}
    - Empresa: ${profile2.company_name}
    - Cargo: ${profile2.current_position}
    - Setor: ${profile2.company_sector}
    - Tamanho da empresa: ${profile2.company_size}
    - Faturamento: ${profile2.annual_revenue}
    - Modelo de negócio: ${profile2.business_model || 'Não informado'}
    - Desafios de negócio: ${profile2.business_challenges?.join(', ') || 'Não informados'}
    - Objetivos curto prazo: ${profile2.short_term_goals?.join(', ') || 'Não informados'}
    - Objetivos médio prazo: ${profile2.medium_term_goals?.join(', ') || 'Não informados'}
    - KPIs importantes: ${profile2.important_kpis?.join(', ') || 'Não informados'}
    - Nível conhecimento IA: ${profile2.ai_knowledge_level || 'Não informado'}
    - Áreas de interesse em IA: ${profile2.desired_ai_areas?.join(', ') || 'Não informadas'}
    - Objetivo principal: ${profile2.primary_goal || 'Não informado'}
    
    ${matchType === 'customer' ? '## Fornecedor' : '## Potencial Fornecedor'}:
    - Nome: ${profile1.name}
    - Empresa: ${profile1.company_name}
    - Cargo: ${profile1.current_position}
    - Setor: ${profile1.company_sector}
    - Tamanho da empresa: ${profile1.company_size}
    - Competências para compartilhar: ${profile1.skills_to_share?.join(', ') || 'Não informadas'}
    
    Com base nessas informações:
    1. Calcule uma pontuação de compatibilidade de 0 a 100.
    2. Forneça um texto curto explicando a principal razão desta compatibilidade.
    3. Identifique 1-4 fatores de compatibilidade (strengths) com força (1-10) e descrição curta para cada.
    4. Sugira 2-3 tópicos específicos para iniciar uma conversa produtiva.
    5. Forneça uma análise concisa das oportunidades de negócio.
    
    Responda APENAS no formato JSON exato abaixo sem explicações adicionais:
    {
      "score": número,
      "reason": "texto curto",
      "strengths": [
        {"factor": "nome do fator", "strength": número, "description": "descrição"}
      ],
      "suggestedTopics": ["tópico 1", "tópico 2"],
      "analysis": {
        "opportunities": ["oportunidade 1", "oportunidade 2"],
        "recommendedApproach": "abordagem recomendada"
      }
    }`;
    
    // Chamada para OpenAI
    console.log('🔍 Chamando OpenAI para análise de compatibilidade');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      })
    });

    // Validando resposta
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na chamada OpenAI:', errorText);
      throw new Error(`Erro na API OpenAI: ${response.status}`);
    }

    // Processando resposta
    const data = await response.json();
    console.log('✅ Resposta OpenAI recebida');
    
    try {
      // Extraindo content da resposta
      const content = data.choices[0].message.content;
      
      // Encontrando o JSON na resposta (removendo texto extra)
      const jsonMatch = content.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      // Parsing do JSON
      const result = JSON.parse(jsonString);
      
      return {
        score: result.score,
        reason: result.reason,
        strengths: result.strengths || [],
        suggestedTopics: result.suggestedTopics || [],
        aiAnalysis: {
          opportunities: result.analysis?.opportunities || [],
          recommendedApproach: result.analysis?.recommendedApproach || ""
        }
      };
    } catch (parseError) {
      console.error('❌ Erro no parsing da resposta:', parseError);
      console.log('Resposta bruta:', data.choices[0].message.content);
      
      // Fallback para análise básica
      return generateFallbackAnalysis(profile1, profile2, matchType);
    }
  } catch (error) {
    console.error('❌ Erro na análise de compatibilidade:', error);
    
    // Fallback para análise básica
    return generateFallbackAnalysis(profile1, profile2, matchType);
  }
}

// Método de fallback para quando a API falha ou não está configurada
function generateFallbackAnalysis(
  profile1: UnifiedUserProfile,
  profile2: UnifiedUserProfile,
  matchType: 'customer' | 'supplier'
): { 
  score: number;
  reason: string;
  strengths: MatchStrength[];
  suggestedTopics: string[];
  aiAnalysis: any;
} {
  // Calculando score baseado em regras simples
  let score = 65 + Math.floor(Math.random() * 30);
  
  // Verificações adicionais para melhorar o score
  if (profile1.company_sector === profile2.company_sector) {
    score += 5;
  }
  
  if (profile1.company_size === profile2.company_size) {
    score += 3;
  }
  
  // Compatibilidade com desafios
  const commonChallenges = profile1.business_challenges?.filter(
    c => profile2.business_challenges?.includes(c)
  );
  
  if (commonChallenges?.length) {
    score += Math.min(commonChallenges.length * 2, 10);
  }
  
  // Limitando o score a 100
  score = Math.min(score, 99);
  
  // Razão do match
  const matchReasons = [
    `Compatibilidade de ${score}% em ${profile1.company_sector} e ${profile2.company_sector}`,
    `Potencial sinergia em implementações de IA (${score}%)`,
    `Alinhamento de objetivos de negócio (${score}%)`
  ];
  
  // Strengths padrão
  const defaultStrengths: MatchStrength[] = [
    {
      factor: "Setor de atuação",
      strength: 7,
      description: `Ambos atuam em setores ${profile1.company_sector === profile2.company_sector ? 'idênticos' : 'complementares'}`
    },
    {
      factor: "Maturidade em IA",
      strength: 8,
      description: "Níveis de conhecimento em IA compatíveis"
    }
  ];
  
  // Tópicos sugeridos
  const suggestedTopics = [
    "Implementação de soluções de IA no setor",
    "Estratégias para melhorar ROI com tecnologia",
    "Desafios e oportunidades no mercado atual"
  ];
  
  return {
    score,
    reason: matchReasons[Math.floor(Math.random() * matchReasons.length)],
    strengths: defaultStrengths,
    suggestedTopics,
    aiAnalysis: {
      opportunities: [
        "Colaboração em projetos de transformação digital",
        "Troca de conhecimentos em implementação de IA"
      ],
      recommendedApproach: "Abordar com foco em desafios comuns e soluções complementares"
    }
  };
}

// Processar diferentes formatos de dados do onboarding em um formato unificado
function processProfileData(
  userId: string, 
  onboardingData?: OnboardingData | null,
  quickOnboardingData?: QuickOnboardingData | null,
  profileData?: any
): UnifiedUserProfile | null {
  try {
    // Se temos dados do quick onboarding, usar como base
    if (quickOnboardingData && quickOnboardingData.is_completed) {
      return {
        id: userId,
        name: quickOnboardingData.name || 'Usuário',
        email: quickOnboardingData.email || '',
        company_name: quickOnboardingData.company_name || 'Empresa não especificada',
        company_sector: quickOnboardingData.company_segment || '',
        company_size: quickOnboardingData.company_size || '',
        current_position: quickOnboardingData.role || '',
        business_challenges: quickOnboardingData.business_challenges || [],
        business_model: quickOnboardingData.business_model || '',
        short_term_goals: quickOnboardingData.short_term_goals || [],
        medium_term_goals: quickOnboardingData.medium_term_goals || [],
        important_kpis: quickOnboardingData.important_kpis || [],
        ai_knowledge_level: quickOnboardingData.ai_knowledge_level || '',
        desired_ai_areas: quickOnboardingData.desired_ai_areas || [],
        annual_revenue: quickOnboardingData.annual_revenue_range || '',
        primary_goal: quickOnboardingData.primary_goal || '',
        skills_to_share: quickOnboardingData.skills_to_share || []
      };
    }
    
    // Se temos dados do onboarding completo, usar
    if (onboardingData && onboardingData.is_completed) {
      return {
        id: userId,
        name: onboardingData.personal_info?.name || profileData?.name || 'Usuário',
        email: onboardingData.personal_info?.email || profileData?.email || '',
        company_name: onboardingData.company_name || onboardingData.professional_info?.company_name || 'Empresa não especificada',
        company_sector: onboardingData.company_sector || onboardingData.professional_info?.company_sector || '',
        company_size: onboardingData.company_size || onboardingData.professional_info?.company_size || '',
        current_position: onboardingData.current_position || onboardingData.professional_info?.current_position || '',
        business_challenges: onboardingData.business_context?.business_challenges || [],
        business_model: onboardingData.business_context?.business_model || '',
        short_term_goals: onboardingData.business_context?.short_term_goals || [],
        medium_term_goals: onboardingData.business_context?.medium_term_goals || [],
        important_kpis: onboardingData.business_context?.important_kpis || [],
        ai_knowledge_level: onboardingData.ai_experience?.ai_knowledge_level || onboardingData.ai_experience?.knowledge_level || '',
        desired_ai_areas: onboardingData.ai_experience?.desired_ai_areas || [],
        annual_revenue: onboardingData.annual_revenue || onboardingData.professional_info?.annual_revenue || '',
        primary_goal: onboardingData.business_goals?.primary_goal || '',
        skills_to_share: onboardingData.experience_personalization?.skills_to_share || 
                         onboardingData.experience_personalization?.shareable_skills || []
      };
    }
    
    // Se só temos dados do perfil, criar um perfil básico
    if (profileData) {
      return {
        id: userId,
        name: profileData.name || 'Usuário',
        email: profileData.email || '',
        company_name: profileData.company_name || 'Empresa não especificada',
        company_sector: profileData.industry || '',
        company_size: '',
        current_position: profileData.current_position || '',
        business_challenges: [],
        business_model: '',
        short_term_goals: [],
        medium_term_goals: [],
        important_kpis: [],
        ai_knowledge_level: '',
        desired_ai_areas: [],
        annual_revenue: '',
        primary_goal: '',
        skills_to_share: []
      };
    }
    
    // Não foi possível criar um perfil
    return null;
  } catch (error) {
    console.error(`❌ Erro ao processar perfil do usuário ${userId}:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? '',
      { auth: { persistSession: false } }
    );

    // Obter parâmetros da requisição
    const { target_user_id, force_regenerate = false } = await req.json();
    console.log(`🚀 Gerando matches para usuário: ${target_user_id}, force: ${force_regenerate}`);
    
    // Se não temos ID do usuário, tentar obter do token
    let userId = target_user_id;
    if (!userId) {
      try {
        // Extrair token de autorização
        const authHeader = req.headers.get('authorization') || '';
        const token = authHeader.replace('Bearer ', '');
        
        // Verificar token
        if (!token) {
          throw new Error('Token de autorização não fornecido');
        }
        
        // Decodificar JWT para obter userId
        const { user } = await supabaseAdmin.auth.getUser(token);
        if (!user) {
          throw new Error('Usuário não autenticado');
        }
        
        userId = user.id;
        console.log(`📝 Usuário autenticado: ${userId}`);
      } catch (authError) {
        console.error('❌ Erro de autenticação:', authError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Falha na autenticação',
            details: authError.message 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Verificar matches existentes para este mês (usando string no formato YYYY-MM)
    const currentMonth = new Date().toISOString().slice(0, 7);
    console.log(`📅 Verificando matches existentes para ${currentMonth}`);
    
    const { data: existingMatches, error: existingMatchesError } = await supabaseAdmin
      .from('network_matches')
      .select('id, match_type')
      .eq('user_id', userId)
      .eq('month_year', currentMonth);
      
    if (existingMatchesError) {
      console.error('❌ Erro ao verificar matches existentes:', existingMatchesError);
    }
    
    // Verificar se já temos matches para este mês e não estamos forçando regeneração
    const hasCustomerMatches = existingMatches?.some(m => m.match_type === 'customer');
    const hasSupplierMatches = existingMatches?.some(m => m.match_type === 'supplier');
    
    if (!force_regenerate && (hasCustomerMatches || hasSupplierMatches)) {
      console.log('⏭️ Já existem matches para este mês:', {
        customerMatches: hasCustomerMatches ? 'Sim' : 'Não',
        supplierMatches: hasSupplierMatches ? 'Sim' : 'Não'
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Matches já existem para este mês',
          total_matches_generated: 0,
          existing_matches: existingMatches?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Buscar dados de onboarding do usuário alvo
    console.log(`🔍 Buscando dados de onboarding para ${userId}`);
    
    // Tentativa 1: Buscar de quick_onboarding
    const { data: quickOnboardingData, error: quickOnboardingError } = await supabaseAdmin
      .from('quick_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (quickOnboardingError && quickOnboardingError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar quick_onboarding:', quickOnboardingError);
    }
    
    // Tentativa 2: Buscar de onboarding_progress
    const { data: onboardingData, error: onboardingError } = await supabaseAdmin
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (onboardingError && onboardingError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar onboarding_progress:', onboardingError);
    }
    
    // Fallback: Buscar perfil básico
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não encontrado',
          details: profileError.message 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Processar dados do usuário alvo
    const targetUserProfile = processProfileData(
      userId, 
      onboardingData, 
      quickOnboardingData, 
      profileData
    );
    
    if (!targetUserProfile) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Não foi possível processar o perfil do usuário',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ Perfil do usuário alvo processado');
    
    // Buscar todos os outros perfis elegíveis para match
    console.log('🔍 Buscando perfis elegíveis para match...');
    
    // Buscar usuários com onboarding completo
    const { data: eligibleUsers, error: eligibleError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, company_name, role, current_position, industry')
      .neq('id', userId)  // Excluir o próprio usuário
      .order('created_at', { ascending: false })
      .limit(50);  // Limitar quantidade para performance
      
    if (eligibleError) {
      console.error('❌ Erro ao buscar usuários elegíveis:', eligibleError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Falha ao buscar usuários elegíveis',
          details: eligibleError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!eligibleUsers?.length) {
      console.log('⚠️ Não foram encontrados usuários elegíveis para match');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Não há usuários suficientes para gerar matches',
          total_matches_generated: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`✅ Encontrados ${eligibleUsers.length} usuários elegíveis`);
    
    // Buscar dados de onboarding para todos os usuários elegíveis
    const userProfiles = [];
    
    // Processar em batches para não sobrecarregar
    const batchSize = 10;
    for (let i = 0; i < eligibleUsers.length; i += batchSize) {
      const batch = eligibleUsers.slice(i, i + batchSize);
      console.log(`🔄 Processando batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(eligibleUsers.length/batchSize)}`);
      
      // Processar cada usuário no batch
      const batchPromises = batch.map(async (user) => {
        try {
          // Buscar quick onboarding
          const { data: userQuickOnboarding } = await supabaseAdmin
            .from('quick_onboarding')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          // Buscar onboarding progress
          const { data: userOnboarding } = await supabaseAdmin
            .from('onboarding_progress')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          // Processar perfil
          const profile = processProfileData(user.id, userOnboarding, userQuickOnboarding, user);
          if (profile) {
            userProfiles.push(profile);
          }
        } catch (error) {
          console.error(`❌ Erro ao processar usuário ${user.id}:`, error);
        }
      });
      
      // Aguardar conclusão do batch
      await Promise.all(batchPromises);
      
      // Pequena pausa entre batches para não sobrecarregar
      if (i + batchSize < eligibleUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    console.log(`✅ Processados ${userProfiles.length} perfis de usuários`);
    
    if (userProfiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Não há perfis suficientes para gerar matches',
          total_matches_generated: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Definir quantidade de matches a gerar
    const maxCustomerMatches = 5;
    const maxSupplierMatches = 3;
    
    // Se estamos forçando regeneração, remover matches existentes
    if (force_regenerate && existingMatches?.length > 0) {
      console.log(`🧹 Removendo ${existingMatches.length} matches existentes para forçar regeneração`);
      
      const { error: deleteError } = await supabaseAdmin
        .from('network_matches')
        .delete()
        .eq('user_id', userId)
        .eq('month_year', currentMonth);
        
      if (deleteError) {
        console.error('❌ Erro ao remover matches existentes:', deleteError);
      }
    }
    
    // Gerar matches de clientes (Perfis mais compatíveis como clientes)
    console.log('🤝 Gerando matches de clientes potenciais...');
    
    // Ordenar perfis por compatibilidade
    const customerMatchPromises = userProfiles.map(async (profile) => {
      try {
        // Analisar compatibilidade
        const analysis = await analyzeCompatibility(targetUserProfile, profile, 'customer');
        
        return {
          profile,
          score: analysis.score,
          reason: analysis.reason,
          strengths: analysis.strengths,
          suggestedTopics: analysis.suggestedTopics,
          aiAnalysis: analysis.aiAnalysis
        };
      } catch (error) {
        console.error(`❌ Erro ao analisar compatibilidade com ${profile.id}:`, error);
        return null;
      }
    });
    
    // Aguardar todas as análises
    const customerMatches = (await Promise.all(customerMatchPromises))
      .filter(match => match !== null)
      .sort((a, b) => b.score - a.score) // Ordenar por score
      .slice(0, maxCustomerMatches); // Pegar os melhores
      
    // Gerar matches de fornecedores
    console.log('🤝 Gerando matches de fornecedores potenciais...');
    
    const supplierMatchPromises = userProfiles.map(async (profile) => {
      try {
        // Analisar compatibilidade como fornecedor
        const analysis = await analyzeCompatibility(targetUserProfile, profile, 'supplier');
        
        return {
          profile,
          score: analysis.score,
          reason: analysis.reason,
          strengths: analysis.strengths,
          suggestedTopics: analysis.suggestedTopics,
          aiAnalysis: analysis.aiAnalysis
        };
      } catch (error) {
        console.error(`❌ Erro ao analisar compatibilidade com ${profile.id}:`, error);
        return null;
      }
    });
    
    // Aguardar todas as análises
    const supplierMatches = (await Promise.all(supplierMatchPromises))
      .filter(match => match !== null)
      .sort((a, b) => b.score - a.score) // Ordenar por score
      .slice(0, maxSupplierMatches); // Pegar os melhores
      
    console.log(`✅ Gerados ${customerMatches.length} matches de clientes e ${supplierMatches.length} matches de fornecedores`);
    
    // Salvar matches no banco de dados
    const matchesToInsert = [];
    
    // Processar matches de clientes
    customerMatches.forEach(match => {
      matchesToInsert.push({
        user_id: userId,
        matched_user_id: match.profile.id,
        match_type: 'customer',
        compatibility_score: match.score,
        match_reason: match.reason,
        match_strengths: match.strengths,
        suggested_topics: match.suggestedTopics,
        ai_analysis: match.aiAnalysis,
        month_year: currentMonth,
        status: 'pending',
        is_viewed: false
      });
    });
    
    // Processar matches de fornecedores
    supplierMatches.forEach(match => {
      matchesToInsert.push({
        user_id: userId,
        matched_user_id: match.profile.id,
        match_type: 'supplier',
        compatibility_score: match.score,
        match_reason: match.reason,
        match_strengths: match.strengths,
        suggested_topics: match.suggestedTopics,
        ai_analysis: match.aiAnalysis,
        month_year: currentMonth,
        status: 'pending',
        is_viewed: false
      });
    });
    
    // Inserir matches no banco
    if (matchesToInsert.length > 0) {
      console.log(`💾 Salvando ${matchesToInsert.length} matches no banco de dados`);
      
      const { data: insertedMatches, error: insertError } = await supabaseAdmin
        .from('network_matches')
        .insert(matchesToInsert)
        .select();
        
      if (insertError) {
        console.error('❌ Erro ao inserir matches:', insertError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Falha ao salvar matches',
            details: insertError.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`✅ Salvos ${insertedMatches?.length || 0} matches com sucesso`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Matches gerados com sucesso',
          total_matches_generated: insertedMatches?.length || 0,
          customer_matches: customerMatches.length,
          supplier_matches: supplierMatches.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum match gerado',
          total_matches_generated: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('💥 Erro fatal na geração de matches:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno na geração de matches',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
