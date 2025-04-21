
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
            <p><strong>Telefone:</strong> {data.phone ? `+${data.ddi || '55'} ${data.phone}` : 'Não informado'}</p>
            <p><strong>Localização:</strong> {[data.city, data.state, data.country].filter(Boolean).join(', ') || 'Não informada'}</p>
          </div>
        );
      
      case 'professional_info':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><strong>Empresa:</strong> {data.company_name || 'Não informada'}</p>
            <p><strong>Cargo:</strong> {data.current_position || 'Não informado'}</p>
            <p><strong>Tamanho da empresa:</strong> {data.company_size || 'Não informado'}</p>
            <p><strong>Setor:</strong> {data.company_sector || 'Não informado'}</p>
          </div>
        );
      
      case 'business_context':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Modelo de negócio:</strong> {data.business_model || 'Não informado'}</p>
            <p><strong>Desafios:</strong> {data.business_challenges?.join(', ') || 'Não informados'}</p>
            <p><strong>KPIs importantes:</strong> {data.important_kpis?.join(', ') || 'Não informados'}</p>
          </div>
        );
        
      case 'ai_experience':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Nível de conhecimento:</strong> {data.knowledge_level || 'Não informado'}</p>
            <p><strong>Ferramentas utilizadas:</strong> {data.previous_tools?.join(', ') || 'Nenhuma'}</p>
            <p><strong>Soluções desejadas:</strong> {data.desired_solutions?.join(', ') || 'Nenhuma'}</p>
          </div>
        );
        
      case 'business_goals':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Objetivo primário:</strong> {data.primary_goal || 'Não informado'}</p>
            <p><strong>Resultados esperados:</strong> {data.expected_outcomes?.join(', ') || 'Não informados'}</p>
            <p><strong>Timeline:</strong> {data.timeline || 'Não informado'}</p>
          </div>
        );
        
      case 'industry_focus':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Setor:</strong> {data.sector || 'Não informado'}</p>
            <p><strong>Mercado-alvo:</strong> {data.target_market || 'Não informado'}</p>
            <p><strong>Principais desafios:</strong> {data.main_challenges?.join(', ') || 'Não informados'}</p>
          </div>
        );
        
      case 'resources_needs':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Faixa de orçamento:</strong> {data.budget_range || 'Não informada'}</p>
            <p><strong>Tamanho da equipe:</strong> {data.team_size || 'Não informado'}</p>
            <p><strong>Stack tecnológico:</strong> {data.tech_stack?.join(', ') || 'Não informado'}</p>
          </div>
        );
        
      case 'team_info':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Tomadores de decisão:</strong> {data.decision_makers?.join(', ') || 'Não informados'}</p>
            <p><strong>Expertise técnica:</strong> {data.technical_expertise || 'Não informada'}</p>
            <p><strong>Necessidades de treinamento:</strong> {data.training_needs?.join(', ') || 'Não informadas'}</p>
          </div>
        );
        
      case 'implementation_preferences':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Áreas prioritárias:</strong> {data.priority_areas?.join(', ') || 'Não informadas'}</p>
            <p><strong>Velocidade de implementação:</strong> {data.implementation_speed || 'Não informada'}</p>
            <p><strong>Nível de suporte:</strong> {data.support_level || 'Não informado'}</p>
          </div>
        );
        
      case 'experience_personalization':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>Interesses:</strong> {data.interests?.join(', ') || 'Não informados'}</p>
            <p><strong>Preferência de horário:</strong> {data.time_preference || 'Não informada'}</p>
            <p><strong>Dias disponíveis:</strong> {data.available_days?.join(', ') || 'Não informados'}</p>
            <p><strong>Habilidades para compartilhar:</strong> {data.skills_to_share?.join(', ') || 'Não informadas'}</p>
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
            <p><strong>Como conheceu:</strong> {sourceMap[data.how_found_us] || data.how_found_us || 'Não informado'}</p>
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
          const sectionData = progress[sectionKey];
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
