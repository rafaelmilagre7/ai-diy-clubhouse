
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { Brain, Lightbulb, Target, Zap } from 'lucide-react';

interface AIExperienceStepProps {
  data: QuickOnboardingData;
  onUpdate: (field: string, value: any) => void;
}

export const AIExperienceStep: React.FC<AIExperienceStepProps> = ({ data, onUpdate }) => {
  const { ai_experience } = data;

  const aiAreas = [
    { id: 'automacao', label: 'Automação de processos' },
    { id: 'atendimento', label: 'Atendimento ao cliente' },
    { id: 'vendas', label: 'Vendas e marketing' },
    { id: 'analise', label: 'Análise de dados' },
    { id: 'producao', label: 'Produção de conteúdo' },
    { id: 'recursos', label: 'Recursos humanos' },
    { id: 'financeiro', label: 'Gestão financeira' },
    { id: 'logistica', label: 'Logística e operações' }
  ];

  const tools = [
    { id: 'chatgpt', label: 'ChatGPT' },
    { id: 'gemini', label: 'Google Gemini' },
    { id: 'copilot', label: 'Microsoft Copilot' },
    { id: 'claude', label: 'Claude' },
    { id: 'midjourney', label: 'Midjourney' },
    { id: 'zapier', label: 'Zapier' },
    { id: 'notion', label: 'Notion AI' },
    { id: 'outro', label: 'Outras ferramentas' }
  ];

  const handleAreaChange = (areaId: string, checked: boolean) => {
    const currentAreas = ai_experience?.desired_ai_areas || [];
    let newAreas;
    
    if (checked) {
      newAreas = [...currentAreas, areaId];
    } else {
      newAreas = currentAreas.filter(area => area !== areaId);
    }
    
    onUpdate('desired_ai_areas', newAreas);
  };

  const handleToolChange = (toolId: string, checked: boolean) => {
    const currentTools = ai_experience?.previous_tools || [];
    let newTools;
    
    if (checked) {
      newTools = [...currentTools, toolId];
    } else {
      newTools = currentTools.filter(tool => tool !== toolId);
    }
    
    onUpdate('previous_tools', newTools);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-viverblue" />
          Experiência com Inteligência Artificial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ai_knowledge_level" className="text-white">Nível de conhecimento em IA *</Label>
            <Select
              value={ai_experience?.ai_knowledge_level || ''}
              onValueChange={(value) => onUpdate('ai_knowledge_level', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione seu nível" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="iniciante">Iniciante - Pouco ou nenhum conhecimento</SelectItem>
                <SelectItem value="basico">Básico - Já ouvi falar e uso algumas ferramentas</SelectItem>
                <SelectItem value="intermediario">Intermediário - Uso regularmente algumas ferramentas</SelectItem>
                <SelectItem value="avancado">Avançado - Tenho experiência sólida com IA</SelectItem>
                <SelectItem value="especialista">Especialista - Implemento soluções complexas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uses_ai" className="text-white">Você já usa IA no seu trabalho? *</Label>
            <Select
              value={ai_experience?.uses_ai || ''}
              onValueChange={(value) => onUpdate('uses_ai', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="nao">Não, ainda não uso</SelectItem>
                <SelectItem value="ocasionalmente">Ocasionalmente, para tarefas específicas</SelectItem>
                <SelectItem value="regularmente">Sim, uso regularmente</SelectItem>
                <SelectItem value="diariamente">Sim, uso diariamente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="main_goal" className="text-white">Objetivo principal com IA *</Label>
            <Select
              value={ai_experience?.main_goal || ''}
              onValueChange={(value) => onUpdate('main_goal', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione seu objetivo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="produtividade">Aumentar produtividade</SelectItem>
                <SelectItem value="custos">Reduzir custos operacionais</SelectItem>
                <SelectItem value="qualidade">Melhorar qualidade dos produtos/serviços</SelectItem>
                <SelectItem value="inovacao">Inovar no mercado</SelectItem>
                <SelectItem value="competitividade">Ganhar vantagem competitiva</SelectItem>
                <SelectItem value="escala">Escalar o negócio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="has_implemented" className="text-white">Já implementou IA na empresa? *</Label>
            <Select
              value={ai_experience?.has_implemented || ''}
              onValueChange={(value) => onUpdate('has_implemented', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="nao">Não, ainda não implementamos</SelectItem>
                <SelectItem value="planejando">Estamos planejando implementar</SelectItem>
                <SelectItem value="piloto">Temos projetos piloto</SelectItem>
                <SelectItem value="parcial">Implementação parcial</SelectItem>
                <SelectItem value="completa">Implementação completa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-white">Áreas de interesse em IA * (selecione pelo menos uma)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiAreas.map((area) => (
              <div key={area.id} className="flex items-center space-x-2">
                <Checkbox
                  id={area.id}
                  checked={(ai_experience?.desired_ai_areas || []).includes(area.id)}
                  onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                  className="border-gray-600"
                />
                <Label
                  htmlFor={area.id}
                  className="text-gray-300 text-sm cursor-pointer"
                >
                  {area.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-white">Ferramentas de IA que já usou (opcional)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tools.map((tool) => (
              <div key={tool.id} className="flex items-center space-x-2">
                <Checkbox
                  id={tool.id}
                  checked={(ai_experience?.previous_tools || []).includes(tool.id)}
                  onCheckedChange={(checked) => handleToolChange(tool.id, checked as boolean)}
                  className="border-gray-600"
                />
                <Label
                  htmlFor={tool.id}
                  className="text-gray-300 text-sm cursor-pointer"
                >
                  {tool.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
