import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, Zap, CheckSquare } from 'lucide-react';
import { useTools } from '@/hooks/useTools';
import { Card, CardContent } from '@/components/ui/card';

interface AIExperienceData {
  experience_level: string;
  implementation_status: string;
  implementation_approach: string;
  current_tools: string[];
}

interface Step3AIExperienceProps {
  initialData?: Partial<AIExperienceData>;
  onDataChange: (data: Partial<AIExperienceData>) => void;
  onNext: () => void;
}

export const Step3AIExperience: React.FC<Step3AIExperienceProps> = ({
  initialData,
  onDataChange,
  onNext,
}) => {
  // Estados simples - sem React Hook Form
  const [experienceLevel, setExperienceLevel] = useState(initialData?.experience_level || '');
  const [implementationStatus, setImplementationStatus] = useState(initialData?.implementation_status || '');
  const [implementationApproach, setImplementationApproach] = useState(initialData?.implementation_approach || '');
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.current_tools || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { tools, isLoading } = useTools();

  // Validação simples
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!experienceLevel) newErrors.experience_level = 'Selecione seu nível de experiência';
    if (!implementationStatus) newErrors.implementation_status = 'Selecione o status da implementação';
    if (!implementationApproach) newErrors.implementation_approach = 'Selecione como pretende implementar';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers simples sem notificações em tempo real
  const handleExperienceLevelChange = (value: string) => {
    setExperienceLevel(value);
    if (errors.experience_level) {
      setErrors(prev => ({ ...prev, experience_level: '' }));
    }
  };

  const handleImplementationStatusChange = (value: string) => {
    setImplementationStatus(value);
    if (errors.implementation_status) {
      setErrors(prev => ({ ...prev, implementation_status: '' }));
    }
  };

  const handleImplementationApproachChange = (value: string) => {
    setImplementationApproach(value);
    if (errors.implementation_approach) {
      setErrors(prev => ({ ...prev, implementation_approach: '' }));
    }
  };

  const handleToolClick = (toolName: string) => {
    let newSelectedTools: string[];
    
    if (toolName === 'Nenhuma ainda') {
      newSelectedTools = selectedTools.includes('Nenhuma ainda') 
        ? selectedTools.filter(t => t !== 'Nenhuma ainda')
        : ['Nenhuma ainda'];
    } else {
      if (selectedTools.includes('Nenhuma ainda')) {
        newSelectedTools = [toolName];
      } else if (selectedTools.includes(toolName)) {
        newSelectedTools = selectedTools.filter(t => t !== toolName);
      } else {
        newSelectedTools = [...selectedTools, toolName];
      }
    }
    
    setSelectedTools(newSelectedTools);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Apenas aqui notificamos os dados finais
    const finalData: AIExperienceData = {
      experience_level: experienceLevel,
      implementation_status: implementationStatus,
      implementation_approach: implementationApproach,
      current_tools: selectedTools
    };

    console.log('[Step3] Enviando dados:', finalData);
    onDataChange(finalData);
    onNext();
  };

  // Organizar ferramentas por categoria
  const organizeToolsByCategory = () => {
    const categories = [
      'Modelos de IA e Interfaces',
      'Geração de Conteúdo Visual', 
      'Geração e Processamento de Áudio',
      'Automação e Integrações',
      'Comunicação e Atendimento',
      'Captura e Análise de Dados',
      'Pesquisa e Síntese de Informações',
      'Gestão de Documentos e Conteúdo',
      'Marketing e CRM',
      'Produtividade e Organização',
      'Desenvolvimento e Código',
      'Plataformas de Mídia',
      'Outros'
    ];

    const organizedTools = categories.reduce((acc, category) => {
      const toolsInCategory = tools
        .filter(tool => tool.status && tool.category === category)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      if (toolsInCategory.length > 0) {
        acc[category] = toolsInCategory;
      }
      
      return acc;
    }, {} as Record<string, typeof tools>);

    return organizedTools;
  };

  const organizedTools = organizeToolsByCategory();
  const isFormValid = experienceLevel && implementationStatus && implementationApproach;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <Bot className="w-16 h-16 mx-auto text-primary" />
        <p className="text-muted-foreground text-lg">
          Vamos entender sua experiência atual com IA para criar o melhor plano de aprendizado
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Qual é seu nível de experiência com IA?
          </Label>
          <Select onValueChange={handleExperienceLevelChange} value={experienceLevel}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante - Nunca usei ferramentas de IA</SelectItem>
              <SelectItem value="basic">Básico - Uso algumas ferramentas ocasionalmente</SelectItem>
              <SelectItem value="intermediate">Intermediário - Uso IA regularmente no trabalho</SelectItem>
              <SelectItem value="advanced">Avançado - Implemento soluções de IA na empresa</SelectItem>
            </SelectContent>
          </Select>
          {errors.experience_level && (
            <p className="text-sm text-destructive">{errors.experience_level}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Qual é o status da implementação de IA na sua empresa?
          </Label>
          <Select onValueChange={handleImplementationStatusChange} value={implementationStatus}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o status atual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Ainda não começamos</SelectItem>
              <SelectItem value="exploring">Estamos explorando possibilidades</SelectItem>
              <SelectItem value="testing">Testando algumas ferramentas</SelectItem>
              <SelectItem value="implementing">Implementando soluções</SelectItem>
              <SelectItem value="advanced">Já temos IA integrada aos processos</SelectItem>
            </SelectContent>
          </Select>
          {errors.implementation_status && (
            <p className="text-sm text-destructive">{errors.implementation_status}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Como pretende implementar IA na sua empresa?
          </Label>
          <Select onValueChange={handleImplementationApproachChange} value={implementationApproach}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione sua abordagem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="myself">Eu mesmo vou fazer</SelectItem>
              <SelectItem value="team">Meu time</SelectItem>
              <SelectItem value="hire">Quero contratar</SelectItem>
            </SelectContent>
          </Select>
          {errors.implementation_approach && (
            <p className="text-sm text-destructive">{errors.implementation_approach}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Quais ferramentas de IA você já usa? (selecione todas que se aplicam)
          </Label>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando ferramentas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(organizedTools).map(([category, categoryTools]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">{category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryTools.map((tool) => (
                      <Card 
                        key={tool.id} 
                        className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                          selectedTools.includes(tool.name) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:bg-accent/50'
                        }`}
                        onClick={() => handleToolClick(tool.name)}
                      >
                        <CardContent className="p-3 flex flex-col items-center space-y-2">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {tool.logo_url ? (
                              <img 
                                src={tool.logo_url} 
                                alt={tool.name} 
                                className="h-full w-full object-contain" 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<div class="text-xs font-bold text-primary">${tool.name.substring(0, 2).toUpperCase()}</div>`;
                                  }
                                }}
                              />
                            ) : (
                              <div className="text-xs font-bold text-primary">
                                {tool.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-center line-clamp-2">
                            {tool.name}
                          </span>
                          <Checkbox
                            checked={selectedTools.includes(tool.name)}
                            className="pointer-events-none"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Opção "Nenhuma ainda" no final */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Opções especiais</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                      selectedTools.includes('Nenhuma ainda') 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-accent/50'
                    }`}
                    onClick={() => handleToolClick('Nenhuma ainda')}
                  >
                    <CardContent className="p-3 flex flex-col items-center space-y-2">
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                        <span className="text-xs">❌</span>
                      </div>
                      <span className="text-xs font-medium text-center">
                        Nenhuma ainda
                      </span>
                      <Checkbox
                        checked={selectedTools.includes('Nenhuma ainda')}
                        className="pointer-events-none"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90"
            disabled={!isFormValid}
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};