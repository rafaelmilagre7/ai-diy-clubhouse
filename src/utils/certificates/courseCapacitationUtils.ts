/**
 * Utilitários para gerar descrições automáticas de capacitação baseadas no conteúdo do curso
 */

interface CourseCapacitationOptions {
  title: string;
  category?: string;
  type: 'course' | 'solution';
  metadata?: {
    totalModules?: number;
    totalLessons?: number;
    totalDuration?: number;
  };
}

/**
 * Gera a descrição específica de capacitação baseada no título e categoria do curso/solução
 */
export const getCourseCapacitationDescription = (options: CourseCapacitationOptions): string => {
  const { title, category, type, metadata } = options;
  
  // Normalizar título para análise
  const titleLower = title.toLowerCase();
  
  // === CURSOS DE FORMAÇÃO ===
  if (titleLower.includes('formação') || titleLower.includes('mastery')) {
    if (titleLower.includes('ia') || titleLower.includes('inteligência artificial')) {
      return "Formação Completa em Inteligência Artificial";
    }
    if (titleLower.includes('digital') || titleLower.includes('marketing')) {
      return "Formação em Marketing Digital com IA";
    }
    if (titleLower.includes('automação')) {
      return "Formação em Automação Inteligente";
    }
    return "Formação Profissional Especializada";
  }
  
  // === ANÁLISE POR PALAVRAS-CHAVE ESPECÍFICAS ===
  
  // Chatbots e Assistentes
  if (titleLower.includes('chatbot') || titleLower.includes('assistente') || titleLower.includes('bot')) {
    return "Desenvolvimento de Chatbots e Assistentes Virtuais";
  }
  
  // Automação
  if (titleLower.includes('automação') || titleLower.includes('workflow') || titleLower.includes('zapier')) {
    return "Automação de Processos com Inteligência Artificial";
  }
  
  // Marketing e Vendas
  if (titleLower.includes('marketing') || titleLower.includes('vendas') || titleLower.includes('leads')) {
    return "Marketing Digital e Vendas com IA";
  }
  
  // E-commerce
  if (titleLower.includes('ecommerce') || titleLower.includes('e-commerce') || titleLower.includes('loja')) {
    return "E-commerce Inteligente e Otimização de Vendas";
  }
  
  // Produtividade
  if (titleLower.includes('produtividade') || titleLower.includes('organização') || titleLower.includes('gestão')) {
    return "Produtividade e Gestão Inteligente";
  }
  
  // Análise de Dados
  if (titleLower.includes('dados') || titleLower.includes('análise') || titleLower.includes('dashboard')) {
    return "Análise de Dados e Business Intelligence";
  }
  
  // Criação de Conteúdo
  if (titleLower.includes('conteúdo') || titleLower.includes('copywriting') || titleLower.includes('criativo')) {
    return "Criação de Conteúdo com Inteligência Artificial";
  }
  
  // Desenvolvimento
  if (titleLower.includes('desenvolvimento') || titleLower.includes('código') || titleLower.includes('programming')) {
    return "Desenvolvimento de Software com IA";
  }
  
  // Design
  if (titleLower.includes('design') || titleLower.includes('ui/ux') || titleLower.includes('visual')) {
    return "Design e Experiência do Usuário com IA";
  }
  
  // === ANÁLISE POR CATEGORIA (fallback) ===
  if (category) {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('marketing')) {
      return "Marketing Digital e Estratégias de IA";
    }
    if (categoryLower.includes('automação')) {
      return "Automação e Otimização de Processos";
    }
    if (categoryLower.includes('produtividade')) {
      return "Produtividade e Ferramentas Inteligentes";
    }
    if (categoryLower.includes('vendas')) {
      return "Vendas e Relacionamento com Cliente";
    }
  }
  
  // === PADRÃO POR TIPO ===
  if (type === 'solution') {
    // Para soluções, inferir baseado no contexto
    if (titleLower.includes('sistema') || titleLower.includes('plataforma')) {
      return "Implementação de Sistema Inteligente";
    }
    return "Solução Prática de Inteligência Artificial";
  } else {
    // Para cursos, descrição mais ampla
    return "Capacitação em Inteligência Artificial";
  }
};

/**
 * Gera o label do tipo de certificado (usado em badges, etc)
 */
export const getCertificateTypeLabel = (type: 'course' | 'solution', title?: string): string => {
  if (type === 'solution') {
    return "Solução";
  }
  
  // Para cursos, verificar se é formação
  if (title && title.toLowerCase().includes('formação')) {
    return "Formação";
  }
  
  return "Curso";
};

/**
 * Gera descrição mais detalhada para certificados (usada em modais, PDFs, etc)
 */
export const getDetailedCapacitationDescription = (options: CourseCapacitationOptions): string => {
  const baseDescription = getCourseCapacitationDescription(options);
  const { metadata, type } = options;
  
  // Adicionar informações de carga horária se disponível
  let workloadInfo = "";
  if (metadata?.totalDuration) {
    const hours = Math.ceil(metadata.totalDuration / 60);
    workloadInfo = ` com ${hours}h de conteúdo prático`;
  } else if (metadata?.totalLessons) {
    const estimatedHours = Math.ceil(metadata.totalLessons * 0.5);
    workloadInfo = ` com ${estimatedHours}h de aulas`;
  }
  
  // Personalizar baseado no tipo
  if (type === 'course') {
    return `${baseDescription}${workloadInfo}`;
  } else {
    return `${baseDescription} - Implementação Prática${workloadInfo}`;
  }
};

/**
 * Busca descrição personalizada do template de certificado configurado no admin
 */
export const getCourseCapacitationDescriptionFromTemplate = async (courseId: string, fallbackOptions: CourseCapacitationOptions): Promise<string> => {
  console.log('🔍 [DEBUG-TEMPLATE] getCourseCapacitationDescriptionFromTemplate iniciada');
  console.log('📊 [DEBUG-TEMPLATE] Parâmetros recebidos:', {
    courseId,
    fallbackOptions
  });

  try {
    const { supabase } = await import('@/lib/supabase');
    
    // Primeiro, buscar template específico do curso (sem filtro is_default)
    console.log('🔍 [DEBUG-TEMPLATE] Buscando template específico para courseId:', courseId);
    const { data: courseTemplate, error: courseError } = await supabase
      .from('learning_certificate_templates')
      .select('metadata, is_default, course_id, is_active')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .limit(1);
    
    console.log('📋 [DEBUG-TEMPLATE] Resultado da busca específica:', {
      courseTemplate,
      courseError,
      hasData: !!courseTemplate,
      dataLength: courseTemplate?.length || 0,
      firstTemplateMetadata: courseTemplate?.[0]?.metadata,
      hasDescription: !!courseTemplate?.[0]?.metadata?.course_description,
      description: courseTemplate?.[0]?.metadata?.course_description
    });
    
    if (!courseError && courseTemplate && courseTemplate.length > 0 && courseTemplate[0].metadata?.course_description) {
      console.log('✅ [DESCRIPTION] Usando descrição personalizada do template específico:', courseTemplate[0].metadata.course_description);
      return courseTemplate[0].metadata.course_description;
    }

    // Se não encontrou template específico, buscar template global padrão
    console.log('🔍 [DEBUG-TEMPLATE] Template específico não encontrado, buscando template global padrão...');
    const { data: defaultTemplate, error: defaultError } = await supabase
      .from('learning_certificate_templates')
      .select('metadata, is_default, course_id, is_active')
      .eq('is_active', true)
      .eq('is_default', true)
      .is('course_id', null)
      .limit(1);

    console.log('📋 [DEBUG-TEMPLATE] Resultado da busca global:', {
      defaultTemplate,
      defaultError,
      hasData: !!defaultTemplate,
      dataLength: defaultTemplate?.length || 0,
      firstTemplateMetadata: defaultTemplate?.[0]?.metadata,
      hasDescription: !!defaultTemplate?.[0]?.metadata?.course_description,
      description: defaultTemplate?.[0]?.metadata?.course_description
    });

    if (!defaultError && defaultTemplate && defaultTemplate.length > 0 && defaultTemplate[0].metadata?.course_description) {
      console.log('✅ [DESCRIPTION] Usando descrição do template global padrão:', defaultTemplate[0].metadata.course_description);
      return defaultTemplate[0].metadata.course_description;
    }

    console.log('⚠️ [DEBUG-TEMPLATE] Nenhum template encontrado, usando fallback automático');
  } catch (error) {
    console.error('❌ [DEBUG-TEMPLATE] Erro ao buscar descrição personalizada:', error);
    console.warn('⚠️ Erro ao buscar descrição personalizada, usando fallback:', error);
  }
  
  // Fallback para descrição automática
  console.log('📋 [DEBUG-TEMPLATE] Gerando fallback com opções:', fallbackOptions);
  const fallbackResult = getCourseCapacitationDescription(fallbackOptions);
  console.log('📝 [DEBUG-TEMPLATE] Resultado do fallback gerado:', fallbackResult);
  return fallbackResult;
};