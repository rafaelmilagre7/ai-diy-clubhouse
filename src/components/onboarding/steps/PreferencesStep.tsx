
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Settings, BookOpen, Clock, Zap } from 'lucide-react';

interface PreferencesStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

/**
 * Step de preferências - FASE 5
 * Coleta preferências de aprendizado e interesse
 */
export const PreferencesStep: React.FC<PreferencesStepProps> = ({ data, onUpdate }) => {
  const handleCategoryToggle = (category: string) => {
    const current = data.interestedCategories || [];
    const updated = current.includes(category)
      ? current.filter((c: string) => c !== category)
      : [...current, category];
    
    onUpdate({
      ...data,
      interestedCategories: updated
    });
  };

  const handleToolToggle = (tool: string) => {
    const current = data.priorityTools || [];
    const updated = current.includes(tool)
      ? current.filter((t: string) => t !== tool)
      : [...current, tool];
    
    onUpdate({
      ...data,
      priorityTools: updated
    });
  };

  const categories = [
    { id: 'receita', label: 'Receita - Vendas e Marketing', description: 'Automações para gerar mais receita' },
    { id: 'operacional', label: 'Operacional - Processos e Eficiência', description: 'Otimizar operações do dia a dia' },
    { id: 'estrategia', label: 'Estratégia - Gestão e Planejamento', description: 'Decisões estratégicas com IA' }
  ];

  const tools = [
    'ChatGPT / Claude',
    'Automação de WhatsApp',
    'Análise de Dados',
    'Criação de Conteúdo',
    'Atendimento ao Cliente',
    'Gestão de Projetos',
    'Marketing Digital',
    'Vendas e CRM'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Settings className="w-12 h-12 text-viverblue mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Suas Preferências</h2>
        <p className="text-gray-600">
          Vamos personalizar o conteúdo baseado nos seus interesses e necessidades
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Categorias de Interesse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Áreas de Interesse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Selecione as áreas que mais despertam seu interesse:
            </p>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={category.id}
                    checked={(data.interestedCategories || []).includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ferramentas Prioritárias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Ferramentas de Interesse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Quais ferramentas você gostaria de aprender primeiro?
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {tools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={tool}
                    checked={(data.priorityTools || []).includes(tool)}
                    onCheckedChange={() => handleToolToggle(tool)}
                  />
                  <label
                    htmlFor={tool}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tool}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferências de Aprendizado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Estilo de Aprendizado
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="learningStyle">Como você prefere aprender?</Label>
            <Select 
              value={data.learningStyle || ''} 
              onValueChange={(value) => onUpdate({ ...data, learningStyle: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual - Vídeos e imagens</SelectItem>
                <SelectItem value="hands-on">Prático - Fazendo na prática</SelectItem>
                <SelectItem value="reading">Leitura - Textos e documentação</SelectItem>
                <SelectItem value="mixed">Misto - Combinação de formatos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timeAvailability">Tempo disponível por semana</Label>
            <Select 
              value={data.timeAvailability || ''} 
              onValueChange={(value) => onUpdate({ ...data, timeAvailability: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Pouco - 1-2 horas</SelectItem>
                <SelectItem value="medium">Médio - 3-5 horas</SelectItem>
                <SelectItem value="high">Alto - 6+ horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
