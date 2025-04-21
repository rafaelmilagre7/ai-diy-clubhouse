
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

  // Função para resumir cada etapa
  const getSummary = (section: string, data: any) => {
    if (!data) return 'Nenhuma informação fornecida';
    
    switch (section) {
      case 'personal_info':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><strong>Nome:</strong> {data.name || 'Não informado'}</p>
            <p><strong>E-mail:</strong> {data.email || 'Não informado'}</p>
            <p><strong>Telefone:</strong> {data.phone ? `${data.ddi || '+55'} ${data.phone}` : 'Não informado'}</p>
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
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Modelo de negócio:</strong> {businessData.business_model || 'Não informado'}</p>
            <p><strong>Desafios:</strong> {businessData.business_challenges?.join(', ') || 'Não informados'}</p>
            <p><strong>Objetivos de curto prazo:</strong> {businessData.short_term_goals?.join(', ') || 'Não informados'}</p>
            <p><strong>Objetivos de médio prazo:</strong> {businessData.medium_term_goals?.join(', ') || 'Não informados'}</p>
            <p><strong>KPIs importantes:</strong> {businessData.important_kpis?.join(', ') || 'Não informados'}</p>
          </div>
        );
        
      case 'ai_experience':
        const aiExp = data || {};
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Nível de conhecimento:</strong> {aiExp.knowledge_level || 'Não informado'}</p>
            <p><strong>Ferramentas utilizadas:</strong> {aiExp.previous_tools?.join(', ') || 'Nenhuma'}</p>
            <p><strong>Já implementou soluções de IA:</strong> {aiExp.has_implemented === 'sim' ? 'Sim' : 'Não'}</p>
            <p><strong>Áreas de interesse em IA:</strong> {aiExp.desired_ai_areas?.join(', ') || aiExp.desired_ai_area || 'Nenhuma'}</p>
            <p><strong>Completou formação VIVER DE IA:</strong> {aiExp.completed_formation ? 'Sim' : 'Não'}</p>
            <p><strong>NPS (Se já foi membro):</strong> {typeof aiExp.nps_score === 'number' ? aiExp.nps_score : 'Não informado'}</p>
            {aiExp.improvement_suggestions && <p><strong>Sugestões de melhoria:</strong> {aiExp.improvement_suggestions}</p>}
          </div>
        );
        
      case 'business_goals':
        const goals = data || {};
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Objetivo primário:</strong> {goals.primary_goal || 'Não informado'}</p>
            <p><strong>Resultados esperados:</strong> {goals.expected_outcomes?.join(', ') || 'Não informados'}</p>
            <p><strong>Resultado esperado em 30 dias:</strong> {goals.expected_outcome_30days || (goals.expected_outcomes && goals.expected_outcomes[0]) || 'Não informado'}</p>
            <p><strong>Timeline:</strong> {goals.timeline || 'Não informado'}</p>
            <p><strong>Como implementar:</strong> {goals.how_implement || 'Não informado'}</p>
            <p><strong>Disponibilidade semanal:</strong> {goals.week_availability || 'Não informado'}</p>
            <p><strong>Interesse em eventos ao vivo:</strong> {goals.live_interest ? `${goals.live_interest}/5` : 'Não informado'}</p>
            <p><strong>Formatos de conteúdo preferidos:</strong> {goals.content_formats?.join(', ') || 'Não informados'}</p>
          </div>
        );
                
      case 'experience_personalization':
        const exp = data || {};
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Interesses:</strong> {exp.interests?.join(', ') || 'Não informados'}</p>
            <p><strong>Preferência de horário:</strong> {exp.time_preference?.join(', ') || 'Não informada'}</p>
            <p><strong>Dias disponíveis:</strong> {exp.available_days?.join(', ') || 'Não informados'}</p>
            <p><strong>Disponibilidade para networking:</strong> {typeof exp.networking_availability === 'number' ? `${exp.networking_availability} hora(s) por semana` : 'Não informada'}</p>
            <p><strong>Habilidades para compartilhar:</strong> {exp.skills_to_share?.join(', ') || 'Não informadas'}</p>
            <p><strong>Tópicos para mentoria:</strong> {exp.mentorship_topics?.join(', ') || 'Não informados'}</p>
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

        const topicMap: {[key: string]: string} = {
          fundamentos_ia: 'Fundamentos de IA para Negócios',
          automacao_atendimento: 'Automação de Atendimento',
          automacao_vendas: 'Automação de Vendas',
          analise_dados: 'Análise de Dados',
          desenvolvimento_produtos: 'Desenvolvimento de Produtos',
          engenharia_prompts: 'Engenharia de Prompts',
          criacao_conteudo: 'Criação de Conteúdo com IA',
          otimizacao_processos: 'Otimização de Processos',
          estrategia_ia: 'Estratégia de IA para Negócios'
        };
          
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Como conheceu:</strong> {data.how_found_us ? (sourceMap[data.how_found_us] || data.how_found_us) : 'Não informado'}</p>
            {data.referred_by && <p><strong>Indicado por:</strong> {data.referred_by}</p>}
            <p><strong>Autoriza uso de cases:</strong> {data.authorize_case_usage ? 'Sim' : 'Não'}</p>
            <p><strong>Interesse em entrevista:</strong> {data.interested_in_interview ? 'Sim' : 'Não'}</p>
            <p><strong>Tópicos prioritários:</strong> {data.priority_topics?.map(t => topicMap[t] || t).join(', ') || 'Não informados'}</p>
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
