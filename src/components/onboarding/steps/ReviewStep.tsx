
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingProgress } from '@/types/onboarding';
import { steps } from '@/hooks/onboarding/useStepDefinitions';
import { ArrowRight, Edit } from 'lucide-react';

interface ReviewStepProps {
  progress: OnboardingProgress | null;
  onComplete: () => void;
  isSubmitting: boolean;
  navigateToStep: (index: number) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  progress,
  onComplete,
  isSubmitting,
  navigateToStep
}) => {
  if (!progress) return <div>Carregando dados...</div>;

  // Mapeamentos para exibir textos amigáveis em vez dos IDs
  const businessModelMap: {[key: string]: string} = {
    'b2b': 'B2B - Business to Business',
    'b2c': 'B2C - Business to Consumer',
    'b2b2c': 'B2B2C - Business to Business to Consumer',
    'd2c': 'D2C - Direct to Consumer',
    'saas': 'SaaS - Software as a Service',
    'marketplace': 'Marketplace',
    'ecommerce': 'E-commerce',
    'subscription': 'Assinatura / Recorrência',
    'freelancer': 'Freelancer / Autônomo',
    'consulting': 'Consultoria',
    'agency': 'Agência'
  };

  const businessChallengesMap: {[key: string]: string} = {
    'growth': 'Crescimento acelerado',
    'leads': 'Geração de leads qualificados',
    'automation': 'Automação de processos',
    'conversion': 'Conversão de vendas',
    'retention': 'Retenção de clientes',
    'ai-implementation': 'Implementação eficiente de IA',
    'data-analysis': 'Análise e uso efetivo de dados',
    'team-training': 'Capacitação de equipe em IA',
    'cost-optimization': 'Otimização de custos',
    'product-development': 'Desenvolvimento de novos produtos'
  };

  const shortTermGoalsMap: {[key: string]: string} = {
    'first-ai-solution': 'Implementar primeira solução de IA no negócio',
    'automate-customer-service': 'Automatizar processo de atendimento',
    'virtual-assistant': 'Criar assistente virtual para área comercial',
    'optimize-internal-processes': 'Otimizar processos internos com IA',
    'optimize_processes': 'Otimizar processos internos com IA',
    'ai-content': 'Desenvolver conteúdo com auxílio de IA',
    'team-training': 'Treinar equipe em ferramentas de IA',
    'ai-marketing': 'Implementar estratégia de marketing com IA',
    'sales-conversion': 'Aumentar conversão de vendas com IA',
    'cost-reduction': 'Reduzir custos operacionais com automação',
    'new-product': 'Lançar novo produto/serviço utilizando IA'
  };

  const mediumTermGoalsMap: {[key: string]: string} = {
    'scale_ai': 'Escalar soluções de IA implementadas',
    'create_internal_department': 'Criar departamento interno focado em IA',
    'measure_roi': 'Mensurar e otimizar ROI das soluções de IA',
    'expand_markets': 'Expandir para novos mercados utilizando IA',
    'omnichannel': 'Implementar estratégia omnichannel com IA',
    'develop_services': 'Desenvolver oferta de serviços baseados em IA',
    'integrate_ai': 'Integrar múltiplas soluções de IA nos processos',
    'advanced_data_analysis': 'Implementar análise avançada de dados com IA',
    'product_with_ai': 'Desenvolver produto próprio com base em IA',
    'market_reference': 'Tornar-se referência no seu setor em uso de IA'
  };

  const kpiMap: {[key: string]: string} = {
    'revenue': 'Receita',
    'profit': 'Lucro',
    'customer-acquisition': 'Aquisição de Clientes',
    'customer-retention': 'Retenção de Clientes',
    'churn-rate': 'Taxa de Churn',
    'cac': 'CAC (Custo de Aquisição de Cliente)',
    'ltv': 'LTV (Valor do Tempo de Vida do Cliente)',
    'mrr': 'MRR (Receita Recorrente Mensal)',
    'conversion-rate': 'Taxa de Conversão',
    'operational-efficiency': 'Eficiência Operacional',
    'nps': 'NPS (Net Promoter Score)'
  };

  const motivosMap: {[key: string]: string} = {
    'networking': 'Networking com outros empresários',
    'aprofundar_conhecimento': 'Aprofundar conhecimento em IA',
    'implementar_solucoes': 'Implementar soluções concretas',
    'be_atualizado': 'Manter-me atualizado sobre IA',
    'mentoria': 'Mentoria para implementar IA',
    'aprender_ferramentas': 'Aprender ferramentas práticas',
    'capacitar_time': 'Capacitar meu time em IA',
    'comunidade': 'Fazer parte de uma comunidade de IA'
  };

  const implementMap: {[key: string]: string} = {
    'delegar_time': 'Colocar pessoa do time',
    'eu_mesmo': 'Eu mesmo vou implementar',
    'contratar_equipe': 'Contratar equipe VIVER DE IA'
  };

  const formatoMap: {[key: string]: string} = {
    'video': 'Vídeo',
    'texto': 'Texto',
    'audio': 'Áudio',
    'ao_vivo': 'Ao vivo',
    'workshop': 'Workshop prático'
  };

  const knowledgeLevelMap: {[key: string]: string} = {
    'basico': 'Básico',
    'intermediario': 'Intermediário',
    'avancado': 'Avançado'
  };

  const aiAreasMap: {[key: string]: string} = {
    'marketing': 'Marketing',
    'vendas': 'Vendas',
    'operacoes': 'Operações',
    'atendimento': 'Atendimento',
    'rh': 'Recursos Humanos',
    'financeiro': 'Financeiro',
    'produtos': 'Desenvolvimento de Produtos'
  };

  const interestsMap: {[key: string]: string} = {
    'automacao': 'Automação de Processos',
    'growth': 'Growth Marketing',
    'atendimento': 'Atendimento ao Cliente',
    'conteudo': 'Criação de Conteúdo',
    'desenvolvimento': 'Desenvolvimento de Produtos',
    'gestao_projetos': 'Gestão de Projetos',
    'analytics': 'Análise de Dados'
  };

  const timePreferenceMap: {[key: string]: string} = {
    'manha': 'Manhã',
    'tarde': 'Tarde',
    'noite': 'Noite'
  };

  const skillsMap: {[key: string]: string} = {
    'copy': 'Copywriting',
    'design': 'Design',
    'seo': 'SEO',
    'programacao': 'Programação',
    'midias_sociais': 'Gestão de Mídias Sociais',
    'vendas': 'Vendas',
    'gestao_pessoas': 'Gestão de Pessoas',
    'integracao_apis': 'Integração de APIs',
    'gestao_processos': 'Gestão de Processos',
    'marketing_performance': 'Marketing de Performance'
  };

  const mentorshipMap: {[key: string]: string} = {
    'automacao_marketing': 'Automação de Marketing',
    'vendas_prospeccao': 'Vendas e Prospecção',
    'gestao_times': 'Gestão de Times',
    'engenharia_prompts': 'Engenharia de Prompts',
    'ia_midias_sociais': 'IA para Mídias Sociais',
    'desenvolvimento_produtos': 'Desenvolvimento de Produtos com IA',
    'ia_gestao_projetos': 'IA para Gestão de Projetos'
  };

  const topicsMap: {[key: string]: string} = {
    'fundamentos_ia': 'Fundamentos de IA para Negócios',
    'automacao_atendimento': 'Automação de Atendimento',
    'automacao_vendas': 'Automação de Vendas',
    'analise_dados': 'Análise de Dados',
    'desenvolvimento_produtos': 'Desenvolvimento de Produtos',
    'engenharia_prompts': 'Engenharia de Prompts',
    'criacao_conteudo': 'Criação de Conteúdo com IA',
    'otimizacao_processos': 'Otimização de Processos',
    'estrategia_ia': 'Estratégia de IA para Negócios'
  };

  // Função para traduzir arrays de IDs para seus valores legíveis
  const translateArray = (array: string[] | undefined, map: {[key: string]: string}) => {
    if (!array || array.length === 0) return [];
    return array.map(id => map[id] || id);
  };

  // Função para resumir cada etapa
  const getSummary = (section: string, data: any) => {
    if (!data) return 'Nenhuma informação fornecida';
    
    switch (section) {
      case 'personal_info':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><strong>Nome:</strong> {data.name || 'Não informado'}</p>
            <p><strong>E-mail:</strong> {data.email || 'Não informado'}</p>
            <p><strong>Telefone:</strong> {data.phone ? `${data.ddi} ${data.phone}` : 'Não informado'}</p>
            <p><strong>Localização:</strong> {[data.city, data.state, data.country].filter(Boolean).join(', ') || 'Não informada'}</p>
            <p><strong>LinkedIn:</strong> {data.linkedin || 'Não informado'}</p>
            <p><strong>Instagram:</strong> {data.instagram || 'Não informado'}</p>
          </div>
        );
      
      case 'professional_info':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Empresa:</strong> {data.company_name || progress.company_name || 'Não informada'}</p>
            <p><strong>Tamanho da empresa:</strong> {data.company_size || progress.company_size || 'Não informado'}</p>
            <p><strong>Setor:</strong> {data.company_sector || progress.company_sector || 'Não informado'}</p>
            <p><strong>Site:</strong> {data.company_website || progress.company_website || 'Não informado'}</p>
            <p><strong>Cargo atual:</strong> {data.current_position || progress.current_position || 'Não informado'}</p>
            <p><strong>Faturamento anual:</strong> {data.annual_revenue || progress.annual_revenue || 'Não informado'}</p>
          </div>
        );
      
      case 'business_context':
        // Usar os dados de business_data se business_context não existir
        const businessData = data || progress.business_data || {};
        
        // Traduzir os IDs para textos legíveis em português
        const businessModel = businessModelMap[businessData.business_model] || businessData.business_model;
        const challenges = translateArray(businessData.business_challenges, businessChallengesMap);
        const shortGoals = translateArray(businessData.short_term_goals, shortTermGoalsMap);
        const mediumGoals = translateArray(businessData.medium_term_goals, mediumTermGoalsMap);
        const kpis = translateArray(businessData.important_kpis, kpiMap);
        
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Modelo de negócio:</strong> {businessModel || 'Não informado'}</p>
            <p><strong>Desafios:</strong> {challenges.length > 0 ? challenges.join(', ') : 'Não informados'}</p>
            <p><strong>Objetivos de curto prazo:</strong> {shortGoals.length > 0 ? shortGoals.join(', ') : 'Não informados'}</p>
            <p><strong>Objetivos de médio prazo:</strong> {mediumGoals.length > 0 ? mediumGoals.join(', ') : 'Não informados'}</p>
            <p><strong>KPIs importantes:</strong> {kpis.length > 0 ? kpis.join(', ') : 'Não informados'}</p>
          </div>
        );
        
      case 'ai_experience':
        const aiExp = data || {};
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Nível de conhecimento:</strong> {knowledgeLevelMap[aiExp.knowledge_level] || aiExp.knowledge_level || 'Não informado'}</p>
            <p><strong>Ferramentas utilizadas:</strong> {aiExp.previous_tools?.join(', ') || 'Nenhuma'}</p>
            <p><strong>Já implementou soluções de IA:</strong> {aiExp.has_implemented === 'sim' ? 'Sim' : 'Não'}</p>
            <p><strong>Áreas de interesse em IA:</strong> {
              aiExp.desired_ai_areas?.map(area => aiAreasMap[area] || area).join(', ') || 
              (aiExp.desired_ai_area ? aiAreasMap[aiExp.desired_ai_area] || aiExp.desired_ai_area : 'Nenhuma')
            }</p>
            <p><strong>Completou formação VIVER DE IA:</strong> {aiExp.completed_formation ? 'Sim' : 'Não'}</p>
            <p><strong>NPS (Se já foi membro):</strong> {typeof aiExp.nps_score === 'number' ? aiExp.nps_score : 'Não informado'}</p>
            {aiExp.improvement_suggestions && <p><strong>Sugestões de melhoria:</strong> {aiExp.improvement_suggestions}</p>}
          </div>
        );
        
      case 'business_goals':
        const goals = data || {};
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Objetivo primário:</strong> {motivosMap[goals.primary_goal] || goals.primary_goal || 'Não informado'}</p>
            <p><strong>Resultados esperados:</strong> {goals.expected_outcomes?.join(', ') || 'Não informados'}</p>
            <p><strong>Resultado esperado em 30 dias:</strong> {goals.expected_outcome_30days || (goals.expected_outcomes && goals.expected_outcomes[0]) || 'Não informado'}</p>
            <p><strong>Tipo de solução prioritária:</strong> {goals.priority_solution_type || 'Não informado'}</p>
            <p><strong>Como implementar:</strong> {implementMap[goals.how_implement] || goals.how_implement || 'Não informado'}</p>
            <p><strong>Disponibilidade semanal:</strong> {goals.week_availability || 'Não informado'}</p>
            <p><strong>Interesse em eventos ao vivo:</strong> {typeof goals.live_interest === 'number' ? `${goals.live_interest}/10` : 'Não informado'}</p>
            <p><strong>Formatos de conteúdo preferidos:</strong> {translateArray(goals.content_formats, formatoMap).join(', ') || 'Não informados'}</p>
          </div>
        );
                
      case 'experience_personalization':
        const exp = data || {};
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Interesses:</strong> {translateArray(exp.interests, interestsMap).join(', ') || 'Não informados'}</p>
            <p><strong>Preferência de horário:</strong> {translateArray(exp.time_preference, timePreferenceMap).join(', ') || 'Não informada'}</p>
            <p><strong>Dias disponíveis:</strong> {exp.available_days?.join(', ') || 'Não informados'}</p>
            <p><strong>Disponibilidade para networking:</strong> {typeof exp.networking_availability === 'number' ? `${exp.networking_availability} hora(s) por semana` : 'Não informada'}</p>
            <p><strong>Habilidades para compartilhar:</strong> {translateArray(exp.skills_to_share, skillsMap).join(', ') || 'Não informadas'}</p>
            <p><strong>Tópicos para mentoria:</strong> {translateArray(exp.mentorship_topics, mentorshipMap).join(', ') || 'Não informados'}</p>
          </div>
        );

      case 'complementary_info':
        const sourceMap: {[key: string]: string} = {
          instagram: 'Instagram',
          youtube: 'YouTube',
          facebook: 'Facebook',
          linkedin: 'LinkedIn',
          google: 'Google',
          indicacao: 'Indicação',
          evento: 'Evento',
          newsletter: 'Newsletter',
          podcast: 'Podcast',
          formacao: 'Formação VIVER DE IA'
        };
          
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Como conheceu:</strong> {data.how_found_us ? (sourceMap[data.how_found_us] || data.how_found_us) : 'Não informado'}</p>
            {data.referred_by && <p><strong>Indicado por:</strong> {data.referred_by}</p>}
            <p><strong>Autoriza uso de cases:</strong> {data.authorize_case_usage ? 'Sim' : 'Não'}</p>
            <p><strong>Interesse em entrevista:</strong> {data.interested_in_interview ? 'Sim' : 'Não'}</p>
            <p><strong>Tópicos prioritários:</strong> {translateArray(data.priority_topics, topicsMap).join(', ') || 'Não informados'}</p>
          </div>
        );

      default:
        return 'Informações não disponíveis';
    }
  };

  // Encontra o índice de cada etapa para navegação
  const findStepIndex = (sectionId: string) => {
    return steps.findIndex(s => s.id === sectionId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0ABAB5]/10 p-4 rounded-md border border-[#0ABAB5]/20">
        <p className="text-gray-700">
          Revise todas as informações preenchidas no seu onboarding. Caso algo esteja incorreto, clique no botão "Editar" ao lado da seção correspondente.
        </p>
      </div>

      <div className="space-y-4">
        {steps.filter(step => step.id !== 'review').map((step) => {
          const sectionKey = step.section as keyof OnboardingProgress;
          let sectionData = progress[sectionKey];
          
          // Correção para business_context/business_data
          if (step.section === 'business_context' && !sectionData) {
            sectionData = progress.business_data;
          }
          
          const stepIndex = findStepIndex(step.id);
          
          return (
            <Card key={step.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-3 pt-4 px-4 flex flex-row justify-between items-center">
                <CardTitle className="text-base font-medium">{step.title}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={() => navigateToStep(stepIndex)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {getSummary(step.section, sectionData)}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="pt-6 flex justify-end">
        <Button
          onClick={onComplete}
          disabled={isSubmitting}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSubmitting ? "Processando..." : (
            <span className="flex items-center gap-2">
              Concluir Onboarding
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
