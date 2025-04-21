
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStepProps } from '@/types/onboarding';
import { ArrowRight } from 'lucide-react';

const knowledgeSourceOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'google', label: 'Google' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'evento', label: 'Evento' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'formacao', label: 'Formação VIVER DE IA' },
];

const topicsOptions = [
  { value: 'fundamentos_ia', label: 'Fundamentos de IA para Negócios' },
  { value: 'automacao_atendimento', label: 'Automação de Atendimento' },
  { value: 'automacao_vendas', label: 'Automação de Vendas' },
  { value: 'analise_dados', label: 'Análise de Dados' },
  { value: 'desenvolvimento_produtos', label: 'Desenvolvimento de Produtos' },
  { value: 'engenharia_prompts', label: 'Engenharia de Prompts' },
  { value: 'criacao_conteudo', label: 'Criação de Conteúdo com IA' },
  { value: 'otimizacao_processos', label: 'Otimização de Processos' },
  { value: 'estrategia_ia', label: 'Estratégia de IA para Negócios' },
];

export const ComplementaryInfoStep: React.FC<OnboardingStepProps> = ({
  onSubmit,
  isSubmitting,
  isLastStep,
  initialData
}) => {
  const [formData, setFormData] = useState({
    how_found_us: initialData?.how_found_us || '',
    referred_by: initialData?.referred_by || '',
    authorize_case_usage: initialData?.authorize_case_usage || false,
    interested_in_interview: initialData?.interested_in_interview || false,
    priority_topics: initialData?.priority_topics || [],
  });

  const handleTopicChange = (value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      priority_topics: checked
        ? [...prev.priority_topics, value]
        : prev.priority_topics.filter(item => item !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('complementary_info', { complementary_info: formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Como Conheceu o VIVER DE IA</h3>
          <div className="grid gap-2">
            <Label htmlFor="how_found_us">Como você conheceu o VIVER DE IA Club? *</Label>
            <Select 
              value={formData.how_found_us}
              onValueChange={(value) => setFormData(prev => ({ ...prev, how_found_us: value }))}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {knowledgeSourceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="referred_by">Se foi indicado por alguém da comunidade, quem?</Label>
            <Input
              id="referred_by"
              placeholder="Nome de quem te indicou"
              value={formData.referred_by}
              onChange={(e) => setFormData(prev => ({ ...prev, referred_by: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Autorizações</h3>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="authorize_case_usage"
              checked={formData.authorize_case_usage}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, authorize_case_usage: checked }))}
            />
            <Label htmlFor="authorize_case_usage" className="font-normal">
              Autorizo o VIVER DE IA Club a utilizar meus resultados e cases de sucesso em materiais promocionais.
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="interested_in_interview"
              checked={formData.interested_in_interview}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, interested_in_interview: checked }))}
            />
            <Label htmlFor="interested_in_interview" className="font-normal">
              Tenho interesse em compartilhar minha experiência em formato de depoimento ou entrevista.
            </Label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tópicos/Trilhas Prioritárias para Começar *</h3>
          <div className="grid gap-3">
            {topicsOptions.map((topic) => (
              <div key={topic.value} className="flex items-center space-x-2">
                <Checkbox
                  id={topic.value}
                  checked={formData.priority_topics.includes(topic.value)}
                  onCheckedChange={(checked) => handleTopicChange(topic.value, checked as boolean)}
                />
                <Label htmlFor={topic.value} className="font-normal">
                  {topic.label}
                </Label>
              </div>
            ))}
          </div>
          {formData.priority_topics.length === 0 && (
            <p className="text-sm text-red-500">Selecione pelo menos um tópico.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          className="min-w-[120px] bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          disabled={isSubmitting || formData.priority_topics.length === 0 || !formData.how_found_us}
        >
          {isSubmitting ? (
            "Salvando..."
          ) : (
            <span className="flex items-center gap-2">
              Próximo
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
