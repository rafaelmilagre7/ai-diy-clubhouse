
import { ImplementationTrail } from "@/types/implementation-trail";
import { OnboardingProgress } from "@/types/onboarding";

// Função para salvar a trilha no localStorage
export function saveTrailToLocalStorage(userId: string, trailData: any) {
  try {
    localStorage.setItem(`implementation_trail_${userId}`, JSON.stringify({
      timestamp: Date.now(),
      trail_data: trailData.trail_data
    }));
  } catch (error) {
    console.error("Erro ao salvar trilha no localStorage:", error);
  }
}

// Função para obter a trilha do localStorage
export function getTrailFromLocalStorage(userId: string) {
  try {
    const storedData = localStorage.getItem(`implementation_trail_${userId}`);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Verificar se os dados são recentes (menos de 1 dia)
      const isRecent = (Date.now() - parsedData.timestamp) < 86400000; // 24h em ms
      
      if (isRecent) {
        return parsedData;
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao recuperar trilha do localStorage:", error);
    return null;
  }
}

// Função para limpar a trilha do localStorage
export function clearTrailFromLocalStorage(userId: string) {
  try {
    localStorage.removeItem(`implementation_trail_${userId}`);
  } catch (error) {
    console.error("Erro ao limpar trilha do localStorage:", error);
  }
}

// Função para validar e sanitizar a estrutura de dados da trilha
export function sanitizeTrailData(trailData: any): ImplementationTrail {
  // Valores padrão caso os dados estejam incompletos
  const defaultTrail: ImplementationTrail = {
    priority1: [],
    priority2: [],
    priority3: [],
    recommended_courses: [],
    recommended_lessons: []
  };

  // Se não temos dados, retornar a estrutura padrão
  if (!trailData) {
    return defaultTrail;
  }

  try {
    // Garantir que trailData seja um objeto
    const trail = typeof trailData === 'string' ? JSON.parse(trailData) : trailData;

    // Construir o objeto de saída com validação de dados
    const sanitized: ImplementationTrail = {
      priority1: Array.isArray(trail.priority1) ? trail.priority1 : [],
      priority2: Array.isArray(trail.priority2) ? trail.priority2 : [],
      priority3: Array.isArray(trail.priority3) ? trail.priority3 : [],
      recommended_courses: Array.isArray(trail.recommended_courses) ? trail.recommended_courses : [],
      recommended_lessons: Array.isArray(trail.recommended_lessons) ? trail.recommended_lessons : []
    };

    // Personalizar as justificativas baseadas no contexto do usuário
    if (sanitized) {
      personalizeSolutionJustifications(sanitized);
      personalizeRecommendationsJustifications(sanitized);
    }

    return sanitized;
  } catch (error) {
    console.error("Erro ao processar dados da trilha:", error);
    return defaultTrail;
  }
}

// Função para personalizar as justificativas das soluções
function personalizeSolutionJustifications(trail: ImplementationTrail): void {
  // Obter contexto do usuário do localStorage ou outro armazenamento
  const userContext = getUserContext();
  
  if (!userContext) return;
  
  const personalizeJustification = (item: any) => {
    if (!item.justification || item.justification.includes("Recomendado com base")) {
      // Criar justificativas personalizadas baseadas no contexto do usuário
      if (userContext.businessGoal) {
        item.justification = `Perfeitamente alinhada com seu objetivo de ${userContext.businessGoal}`;
      } else if (userContext.companySize) {
        item.justification = `Ideal para empresas de ${userContext.companySize} como a sua`;
      } else if (userContext.industry) {
        item.justification = `Recomendada para negócios no setor de ${userContext.industry}`;
      } else if (userContext.name) {
        item.justification = `${userContext.name}, esta solução se alinha perfeitamente com suas necessidades`;
      } else {
        item.justification = "Selecionada especificamente para o seu perfil de negócio";
      }
    }
  };
  
  // Aplicar personalização para cada prioridade
  trail.priority1.forEach(personalizeJustification);
  trail.priority2.forEach(personalizeJustification);
  trail.priority3.forEach(personalizeJustification);
}

// Função para personalizar as justificativas das recomendações (aulas e cursos)
function personalizeRecommendationsJustifications(trail: ImplementationTrail): void {
  // Obter contexto do usuário do localStorage ou outro armazenamento
  const userContext = getUserContext();
  
  if (!userContext) return;
  
  // Personalizar justificativas das aulas
  const personalizeAulaJustification = (item: any) => {
    if (!item.justification || item.justification.includes("Recomendado com base")) {
      if (userContext.aiExperience === 'iniciante') {
        item.justification = "Selecionamos este conteúdo ideal para iniciantes como você";
      } else if (userContext.aiExperience === 'intermediario') {
        item.justification = "Como você já tem conhecimento intermediário, este conteúdo vai aprofundar seu aprendizado";
      } else if (userContext.aiExperience === 'avancado') {
        item.justification = "Baseado no seu nível avançado de conhecimento em IA, este conteúdo trará insights valiosos";
      } else if (userContext.name) {
        item.justification = `${userContext.name}, este conteúdo foi selecionado para ampliar seu conhecimento`;
      } else {
        item.justification = "Aula selecionada para complementar seu aprendizado em IA";
      }
    }
  };
  
  // Aplicar personalização para cada recomendação
  trail.recommended_lessons.forEach(personalizeAulaJustification);
  trail.recommended_courses.forEach(personalizeAulaJustification);
}

// Função para obter o contexto do usuário do localStorage ou sessionStorage
function getUserContext() {
  try {
    // Tentar obter dados do onboarding do localStorage
    const onboardingData = localStorage.getItem('onboarding_data');
    if (onboardingData) {
      const parsedData = JSON.parse(onboardingData);
      return {
        name: extractFirstName(parsedData),
        businessGoal: extractBusinessGoal(parsedData),
        industry: extractIndustry(parsedData),
        companySize: extractCompanySize(parsedData),
        aiExperience: extractAiExperience(parsedData),
        role: extractRole(parsedData)
      };
    }
    
    // Alternativa: obter do sessionStorage
    const onboardingSession = sessionStorage.getItem('onboarding_progress');
    if (onboardingSession) {
      const parsedSession = JSON.parse(onboardingSession);
      return {
        name: extractFirstName(parsedSession),
        businessGoal: extractBusinessGoal(parsedSession),
        industry: extractIndustry(parsedSession),
        companySize: extractCompanySize(parsedSession),
        aiExperience: extractAiExperience(parsedSession),
        role: extractRole(parsedSession)
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao recuperar contexto do usuário:", error);
    return null;
  }
}

// Funções auxiliares para extrair dados do onboarding
function extractFirstName(data: OnboardingProgress | any): string {
  try {
    if (data?.personal_info?.name) {
      return data.personal_info.name.split(' ')[0];
    }
    return '';
  } catch (e) {
    return '';
  }
}

function extractBusinessGoal(data: OnboardingProgress | any): string {
  try {
    return data?.business_goals?.primary_goal || 
           data?.business_context?.business_model || 
           '';
  } catch (e) {
    return '';
  }
}

function extractIndustry(data: OnboardingProgress | any): string {
  try {
    return data?.professional_info?.company_sector || '';
  } catch (e) {
    return '';
  }
}

function extractCompanySize(data: OnboardingProgress | any): string {
  try {
    return data?.professional_info?.company_size || '';
  } catch (e) {
    return '';
  }
}

function extractAiExperience(data: OnboardingProgress | any): string {
  try {
    return data?.ai_experience?.knowledge_level || '';
  } catch (e) {
    return '';
  }
}

function extractRole(data: OnboardingProgress | any): string {
  try {
    return data?.professional_info?.current_position || '';
  } catch (e) {
    return '';
  }
}
