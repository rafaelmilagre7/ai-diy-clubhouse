
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings, BookOpen, Clock } from 'lucide-react';

interface PreferencesStepProps {
  onDataChange: (data: any) => void;
  data?: any;
}

/**
 * Step de preferências do usuário
 * FASE 3: Coleta de preferências de aprendizado e ferramentas
 */
export const PreferencesStep: React.FC<PreferencesStepProps> = ({ onDataChange, data = {} }) => {
  const categories = [
    { id: 'automation', label: 'Automação de Processos' },
    { id: 'content', label: 'Criação de Conteúdo' },
    { id: 'analytics', label: 'Análise de Dados' },
    { id: 'marketing', label: 'Marketing Digital' },
    { id: 'development', label: 'Desenvolvimento/Tech' },
    { id: 'design', label: 'Design e Criatividade' },
    { id: 'productivity', label: 'Produtividade' },
    { id: 'communication', label: 'Comunicação' }
  ];

  const priorityTools = [
    { id: 'chatgpt', label: 'ChatGPT' },
    { id: 'midjourney', label: 'Midjourney' },
    { id: 'notion', label: 'Notion AI' },
    { id: 'zapier', label: 'Zapier' },
    { id: 'canva', label: 'Canva AI' },
    { id: 'claude', label: 'Claude' },
    { id: 'github', label: 'GitHub Copilot' },
    { id: 'others', label: 'Outras ferramentas' }
  ];

  const updateCategories = (categoryId: string, checked: boolean) => {
    const currentCategories = data.interestedCategories || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter((id: string) => id !== categoryId);
    
    onDataChange({
      ...data,
      interestedCategories: newCategories
    });
  };

  const updateTools = (toolId: string, checked: boolean) => {
    const currentTools = data.priorityTools || [];
    const newTools = checked
      ? [...currentTools, toolId]
      : currentTools.filter((id: string) => id !== toolId);
    
    onDataChange({
      ...data,
      priorityTools: newTools
    });
  };

  const updateLearningStyle = (value: string) => {
    onDataChange({
      ...data,
      learningStyle: value
    });
  };

  const updateTimeAvailability = (value: string) => {
    onDataChange({
      ...data,
      timeAvailability: value
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Suas Preferências</h2>
        <p className="text-gray-600">
          Personalize sua experiência baseada em seus interesses
        </p>
      </div>

      <div className="space-y-6">
        {/* Categorias de Interesse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-viverblue" />
              Áreas de Interesse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Selecione as áreas que mais interessam você (pode escolher várias):
            </p>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={(data.interestedCategories || []).includes(category.id)}
                    onCheckedChange={(checked) => updateCategories(category.id, checked as boolean)}
                  />
                  <Label htmlFor={category.id} className="text-sm font-normal">
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ferramentas Prioritárias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-viverblue" />
              Ferramentas de Interesse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Quais ferramentas você gostaria de aprender ou se aprofundar?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {priorityTools.map((tool) => (
                <div key={tool.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tool.id}
                    checked={(data.priorityTools || []).includes(tool.id)}
                    onCheckedChange={(checked) => updateTools(tool.id, checked as boolean)}
                  />
                  <Label htmlFor={tool.id} className="text-sm font-normal">
                    {tool.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estilo de Aprendizado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-viverblue" />
              Como você prefere aprender?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={data.learningStyle || ''} onValueChange={updateLearningStyle}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="visual" id="visual" />
                <Label htmlFor="visual">Visual - Vídeos e demonstrações</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hands-on" id="hands-on" />
                <Label htmlFor="hands-on">Prático - Implementando junto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reading" id="reading" />
                <Label htmlFor="reading">Leitura - Tutoriais e documentação</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed">Misto - Combinação de formatos</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Disponibilidade de Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-viverblue" />
              Tempo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Quanto tempo você tem disponível para aprender por semana?
            </p>
            <RadioGroup value={data.timeAvailability || ''} onValueChange={updateTimeAvailability}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Pouco tempo - Até 2 horas por semana</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Tempo moderado - 3-5 horas por semana</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">Muito tempo - Mais de 5 horas por semana</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
